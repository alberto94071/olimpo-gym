import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Image } from "expo-image";
import { Colors } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { registerForPushNotifications } from "@/lib/push";
import type { Member } from "@/lib/types";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Member>("/api/mobile/me");
      setMember(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleToggleNotifications(value: boolean) {
    setNotificationsEnabled(value);
    if (value) {
      await registerForPushNotifications();
    }
  }

  function handleLogout() {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro que deseas salir?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar sesión", style: "destructive", onPress: logout },
      ]
    );
  }

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator color={Colors.gold} size="large" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Perfil</Text>

      {/* Avatar + nombre */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          {member?.photoUrl ? (
            <Image source={{ uri: member.photoUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {member?.name?.charAt(0).toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.memberName}>{member?.name}</Text>
        <Text style={styles.memberCode}>{member?.code}</Text>
        <Text style={styles.memberGym}>{member?.gym?.name}</Text>
      </View>

      {/* Datos personales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información personal</Text>
        <View style={styles.card}>
          <InfoRow label="Email" value={member?.email ?? "—"} />
          <InfoRow label="Teléfono" value={member?.phone ?? "—"} />
          <InfoRow label="Fecha de nacimiento" value={member?.birthDate ? formatDate(member.birthDate) : "—"} />
          <InfoRow label="Sexo" value={member?.sex === "M" ? "Masculino" : "Femenino"} />
          <InfoRow label="Sede" value={member?.gym?.name ?? "—"} last />
        </View>
      </View>

      {/* Configuración */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notificaciones push</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: Colors.border, true: Colors.gold + "80" }}
              thumbColor={notificationsEnabled ? Colors.gold : Colors.dim}
            />
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-GT", { day: "2-digit", month: "long", year: "numeric" });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  loader: { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" },
  pageTitle: { color: Colors.text, fontSize: 24, fontWeight: "800", marginBottom: 24 },
  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatarWrapper: { marginBottom: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: Colors.gold },
  avatarPlaceholder: { backgroundColor: Colors.card2, alignItems: "center", justifyContent: "center" },
  avatarInitial: { color: Colors.gold, fontSize: 34, fontWeight: "700" },
  memberName: { color: Colors.text, fontSize: 20, fontWeight: "800", marginBottom: 4 },
  memberCode: { color: Colors.gold, fontSize: 13, fontWeight: "600", letterSpacing: 1, marginBottom: 4 },
  memberGym: { color: Colors.dim, fontSize: 13 },
  section: { marginBottom: 24 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: "700", marginBottom: 10 },
  card: { backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { color: Colors.dim, fontSize: 13 },
  infoValue: { color: Colors.text, fontSize: 13, fontWeight: "600", maxWidth: "60%" },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  settingLabel: { color: Colors.text, fontSize: 14 },
  logoutBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.red + "60",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  logoutText: { color: Colors.red, fontSize: 15, fontWeight: "700" },
});
