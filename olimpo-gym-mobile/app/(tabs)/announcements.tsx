import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
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

  useEffect(() => { load(1); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(1, true); };

  const onEndReached = () => {
    if (!loadingMore && page < totalPages) {
      load(page + 1);
    }
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
        <Text style={styles.title}>Anuncios</Text>
        <Text style={styles.subtitle}>{announcements.length} publicaciones</Text>
      </View>

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
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { color: Colors.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: Colors.dim, fontSize: 13, marginTop: 2 },
  list: { padding: 16 },
  empty: { color: Colors.dim, textAlign: "center", marginTop: 40 },
});
