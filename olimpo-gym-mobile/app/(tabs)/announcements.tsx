import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import type { Announcement } from "@/lib/types";

interface AnnouncementsResponse {
  data: Announcement[];
  totalCount: number;
  page: number;
  totalPages: number;
}

function MegaphoneIcon({ color = Colors.gold, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3 11l18-5v12L3 13v-2z" />
      <Path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </Svg>
  );
}

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await apiFetch<AnnouncementsResponse>(
        `/api/mobile/announcements?page=${pageNum}&limit=20`
      );
      setAnnouncements((prev) => (reset || pageNum === 1 ? res.data : [...prev, ...res.data]));
      setTotalPages(res.totalPages);
      setPage(res.page);
    } catch (err) {
      console.error("Announcements error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load(1, true);
  };

  const onEndReached = () => {
    if (!loadingMore && page < totalPages) load(page + 1);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <MegaphoneIcon />
          </View>
          <View>
            <Text style={styles.title}>Anuncios</Text>
            <Text style={styles.subtitle}>{announcements.length} publicaciones</Text>
          </View>
        </View>
      </View>
      <View style={styles.headerDivider} />

      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AnnouncementCard announcement={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={Colors.gold} style={{ marginVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No hay anuncios disponibles.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loader: { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.gold + "18",
    borderWidth: 1,
    borderColor: Colors.gold + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    fontFamily: "Cinzel_700Bold",
  },
  subtitle: { color: Colors.dim, fontSize: 12, marginTop: 1 },
  headerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 24,
    marginBottom: 4,
  },
  list: { padding: 16, paddingTop: 12 },
  empty: { color: Colors.dim, textAlign: "center", marginTop: 40 },
});
