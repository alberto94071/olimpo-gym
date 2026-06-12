import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { MembershipCard } from "@/components/MembershipCard";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import type { Member, Announcement } from "@/lib/types";

export default function DashboardScreen() {
  const { member: authMember } = useAuth();
  const router = useRouter();

  const [member, setMember] = useState<Member | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [memberData, annData] = await Promise.all([
        apiFetch<Member>("/api/mobile/me"),
        apiFetch<{ data: Announcement[] }>("/api/mobile/announcements?page=1&limit=3"),
      ]);
      setMember(memberData);
      setAnnouncements(annData.data);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.gymName}>{member?.gym?.name ?? "Olimpo Gym"}</Text>
          <Text style={styles.welcomeText}>Hola, {authMember?.name?.split(" ")[0]}</Text>
        </View>
        <Text style={styles.logo}>⚡</Text>
      </View>

      {/* Alerta de grupo bloqueado */}
      {member?.group && !member.group.paidFull && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={styles.alertText}>
            Tu grupo tiene un pago pendiente. Tu acceso está bloqueado hasta que el representante realice el pago.
          </Text>
        </View>
      )}

      {/* Membership Card */}
      {member && (
        <View style={styles.section}>
          <MembershipCard member={member} />
        </View>
      )}

      {/* Anuncios recientes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Anuncios recientes</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/announcements")}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {announcements.length === 0 ? (
          <Text style={styles.empty}>No hay anuncios recientes.</Text>
        ) : (
          announcements.map((a) => <AnnouncementCard key={a.id} announcement={a} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: 56 },
  loader: { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  gymName: { color: Colors.gold, fontSize: 12, fontWeight: "700", letterSpacing: 2, marginBottom: 2 },
  welcomeText: { color: Colors.text, fontSize: 22, fontWeight: "800" },
  logo: { fontSize: 32 },
  alertBanner: {
    flexDirection: "row",
    backgroundColor: Colors.red + "20",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.red + "40",
    gap: 10,
    alignItems: "flex-start",
  },
  alertIcon: { fontSize: 16 },
  alertText: { color: Colors.red, fontSize: 13, lineHeight: 19, flex: 1 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  seeAll: { color: Colors.gold, fontSize: 13, fontWeight: "600" },
  empty: { color: Colors.dim, fontSize: 14, textAlign: "center", paddingVertical: 20 },
});
