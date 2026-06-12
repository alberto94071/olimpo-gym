import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import type { Announcement } from "@/lib/types";

interface Props {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`/announcement/${announcement.id}` as never)}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>{announcement.title}</Text>
        {announcement.gymName && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{announcement.gymName}</Text>
          </View>
        )}
      </View>
      <Text style={styles.body} numberOfLines={3}>{announcement.body}</Text>
      <Text style={styles.date}>{formatRelative(announcement.createdAt)}</Text>
    </TouchableOpacity>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  return new Date(iso).toLocaleDateString("es-GT", { day: "2-digit", month: "short" });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.goldDark + "30",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: "600",
  },
  body: {
    color: Colors.dim,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  date: {
    color: Colors.dim + "99",
    fontSize: 11,
  },
});
