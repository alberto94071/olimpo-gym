import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import type { Announcement } from "@/lib/types";

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtenemos el anuncio de la lista y lo mostramos
    // (No hay endpoint de detalle individual; lo traemos de la lista paginada)
    apiFetch<{ data: Announcement[] }>("/api/mobile/announcements?page=1&limit=50")
      .then((res) => {
        const found = res.data.find((a) => a.id === id);
        setAnnouncement(found ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  if (!announcement) {
    return (
      <View style={styles.loader}>
        <Text style={styles.notFound}>Anuncio no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      {announcement.gymName && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{announcement.gymName}</Text>
        </View>
      )}

      <Text style={styles.title}>{announcement.title}</Text>
      <Text style={styles.date}>{formatDate(announcement.createdAt)}</Text>

      <View style={styles.divider} />

      <Text style={styles.body}>{announcement.body}</Text>
    </ScrollView>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-GT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: 56 },
  loader: { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" },
  notFound: { color: Colors.dim, fontSize: 16, marginBottom: 12 },
  backBtn: { marginBottom: 20 },
  backText: { color: Colors.gold, fontSize: 15, fontWeight: "600" },
  back: { color: Colors.gold, fontSize: 15, fontWeight: "600" },
  badge: {
    backgroundColor: Colors.goldDark + "30",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  badgeText: { color: Colors.gold, fontSize: 11, fontWeight: "600" },
  title: { color: Colors.text, fontSize: 22, fontWeight: "800", lineHeight: 28, marginBottom: 8 },
  date: { color: Colors.dim, fontSize: 13, marginBottom: 20, textTransform: "capitalize" },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 20 },
  body: { color: Colors.text, fontSize: 15, lineHeight: 24 },
});
