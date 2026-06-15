import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import RenderHtml from "react-native-render-html";
import { Colors } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import type { Announcement } from "@/lib/types";

// Detect if body is plain text or HTML
function isHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ data: Announcement[] }>("/api/mobile/announcements?page=1&limit=50")
      .then((res) => {
        const found = res.data.find((a) => a.id === id);
        setAnnouncement(found ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator color={Colors.gold} size="large" /></View>;
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

  const bodyIsHtml = isHtml(announcement.body);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      {/* Pinned badge */}
      {announcement.pinned && (
        <View style={styles.pinnedBadge}>
          <Text style={styles.pinnedText}>📌 ANUNCIO FIJADO</Text>
        </View>
      )}

      {/* Cover image */}
      {announcement.imageUrl && (
        <Image
          source={{ uri: announcement.imageUrl }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      )}

      {/* Gym badge */}
      {announcement.gymName && (
        <View style={styles.gymBadge}>
          <Text style={styles.gymBadgeText}>{announcement.gymName}</Text>
        </View>
      )}

      <Text style={styles.title}>{announcement.title}</Text>
      <Text style={styles.date}>{formatDate(announcement.createdAt)}</Text>

      <View style={styles.divider} />

      {/* Body: HTML or plain text */}
      {bodyIsHtml ? (
        <RenderHtml
          contentWidth={width - 40}
          source={{ html: announcement.body }}
          tagsStyles={{
            body: { color: Colors.text, fontSize: 15, lineHeight: 24 },
            p:    { color: Colors.text, fontSize: 15, lineHeight: 24, marginBottom: 12 },
            h2:   { color: Colors.gold, fontSize: 20, fontWeight: "700", marginBottom: 8, marginTop: 16 },
            h3:   { color: Colors.gold, fontSize: 17, fontWeight: "700", marginBottom: 6, marginTop: 12 },
            b:    { color: Colors.text, fontWeight: "700" },
            i:    { color: Colors.dim, fontStyle: "italic" },
            ul:   { marginBottom: 12 },
            li:   { color: Colors.text, fontSize: 14, lineHeight: 22, marginBottom: 4 },
            hr:   { backgroundColor: Colors.border, height: 1, marginVertical: 16 },
            a:    { color: Colors.gold },
          }}
          systemFonts={["System"]}
        />
      ) : (
        <Text style={styles.bodyPlain}>{announcement.body}</Text>
      )}
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
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  loader: { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" },
  notFound: { color: Colors.dim, fontSize: 16, marginBottom: 12 },
  backBtn: { marginBottom: 20 },
  backText: { color: Colors.gold, fontSize: 15, fontWeight: "600" },
  back: { color: Colors.gold, fontSize: 15, fontWeight: "600" },

  pinnedBadge: {
    backgroundColor: Colors.gold + "20",
    borderWidth: 1,
    borderColor: Colors.gold + "40",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginBottom: 14,
  },
  pinnedText: { color: Colors.gold, fontSize: 11, fontWeight: "700", letterSpacing: 1 },

  coverImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  gymBadge: {
    backgroundColor: Colors.gold + "20",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  gymBadgeText: { color: Colors.gold, fontSize: 11, fontWeight: "600" },

  title: { color: Colors.text, fontSize: 22, fontWeight: "800", lineHeight: 28, marginBottom: 8 },
  date: { color: Colors.dim, fontSize: 13, marginBottom: 20, textTransform: "capitalize" },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 20 },
  bodyPlain: { color: Colors.text, fontSize: 15, lineHeight: 24 },
});
