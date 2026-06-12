import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import type { Group } from "@/lib/types";

interface Props {
  group: Group;
}

export function GroupCard({ group }: Props) {
  return (
    <View style={[styles.card, !group.paidFull && styles.cardWarning]}>
      <View style={styles.header}>
        <Text style={styles.label}>GRUPO #{group.groupNumber}</Text>
        <View style={[styles.badge, group.paidFull ? styles.badgeOk : styles.badgeBad]}>
          <Text style={[styles.badgeText, group.paidFull ? styles.textOk : styles.textBad]}>
            {group.paidFull ? "Pagado" : "Pago pendiente"}
          </Text>
        </View>
      </View>

      {group.repName && (
        <View style={styles.row}>
          <Text style={styles.dim}>Representante</Text>
          <Text style={styles.value}>{group.repName}</Text>
        </View>
      )}
      {group.repPhone && (
        <View style={styles.row}>
          <Text style={styles.dim}>Teléfono</Text>
          <Text style={styles.value}>{group.repPhone}</Text>
        </View>
      )}
      <View style={styles.row}>
        <Text style={styles.dim}>Miembros</Text>
        <Text style={styles.value}>{group.memberCount}</Text>
      </View>

      {!group.paidFull && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>
            El representante del grupo tiene un pago pendiente. Tu acceso está temporalmente bloqueado.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardWarning: {
    borderColor: Colors.red + "60",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  label: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeOk: { backgroundColor: "#1A3A1A" },
  badgeBad: { backgroundColor: "#3A0A0A" },
  badgeText: { fontSize: 11, fontWeight: "600" },
  textOk: { color: Colors.green },
  textBad: { color: Colors.red },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dim: { color: Colors.dim, fontSize: 13 },
  value: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  alert: {
    marginTop: 12,
    backgroundColor: Colors.red + "20",
    borderRadius: 8,
    padding: 10,
  },
  alertText: {
    color: Colors.red,
    fontSize: 12,
    lineHeight: 17,
  },
});
