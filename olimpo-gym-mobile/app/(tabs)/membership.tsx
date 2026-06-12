import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/colors";
import { apiFetch } from "@/lib/api";
import { MembershipCard } from "@/components/MembershipCard";
import { GroupCard } from "@/components/GroupCard";
import { StatusBadge } from "@/components/StatusBadge";
import type { Member } from "@/lib/types";

export default function MembershipScreen() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Member>("/api/mobile/me");
      setMember(data);
    } catch (err) {
      console.error("Membership load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator color={Colors.gold} size="large" /></View>;
  }

  if (!member) {
    return <View style={styles.loader}><Text style={styles.dim}>No se pudo cargar la información.</Text></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
    >
      <Text style={styles.pageTitle}>Membresía</Text>

      {/* Card de estado */}
      <MembershipCard member={member} />

      {/* Detalles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles</Text>
        <View style={styles.detailCard}>
          <Row label="Plan" value={member.plan.charAt(0).toUpperCase() + member.plan.slice(1)} />
          <Row label="Precio" value={`Q${parseFloat(member.price).toFixed(2)}`} />
          <Row label="Inicio" value={formatDate(member.membershipStart)} />
          <Row label="Vencimiento" value={formatDate(member.membershipEnd)} />
          <Row label="Sede" value={member.gym.name ?? "—"} />
          <View style={[styles.rowItem, { marginTop: 4 }]}>
            <Text style={styles.rowLabel}>Estado</Text>
            <StatusBadge status={member.status} size="sm" />
          </View>
        </View>
      </View>

      {/* Grupo */}
      {member.group && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grupo familiar</Text>
          <GroupCard group={member.group} />
        </View>
      )}

      {/* Historial de pagos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial de pagos</Text>
        {member.paymentHistory.length === 0 ? (
          <Text style={styles.dim}>No hay pagos registrados.</Text>
        ) : (
          <View style={styles.detailCard}>
            {member.paymentHistory.map((p, i) => (
              <View key={p.id} style={[styles.paymentRow, i > 0 && styles.paymentBorder]}>
                <View>
                  <Text style={styles.paymentAmount}>Q{parseFloat(p.amount).toFixed(2)}</Text>
                  <Text style={styles.paymentDate}>{formatDate(p.date)}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <View style={[styles.methodBadge, p.method === "efectivo" ? styles.cash : styles.transfer]}>
                    <Text style={styles.methodText}>
                      {p.method === "efectivo" ? "Efectivo" : "Transferencia"}
                    </Text>
                  </View>
                  {p.notes ? <Text style={styles.paymentNote} numberOfLines={1}>{p.notes}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.rowItem}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: 56 },
  loader: { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" },
  pageTitle: { color: Colors.text, fontSize: 24, fontWeight: "800", marginBottom: 20 },
  section: { marginTop: 28 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  detailCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border },
  rowItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { color: Colors.dim, fontSize: 13 },
  rowValue: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  dim: { color: Colors.dim, fontSize: 14 },
  paymentRow: { paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  paymentBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  paymentAmount: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  paymentDate: { color: Colors.dim, fontSize: 12, marginTop: 2 },
  paymentNote: { color: Colors.dim, fontSize: 11, maxWidth: 120 },
  methodBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 3 },
  cash: { backgroundColor: "#1A3A1A" },
  transfer: { backgroundColor: "#0A1A3A" },
  methodText: { color: Colors.text, fontSize: 11, fontWeight: "600" },
});
