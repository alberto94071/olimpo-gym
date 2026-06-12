import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { StatusBadge } from "./StatusBadge";
import type { Member } from "@/lib/types";

interface Props {
  member: Member;
}

const PLAN_DAYS: Record<string, number> = {
  mensual: 30,
  trimestral: 90,
  anual: 365,
};

export function MembershipCard({ member }: Props) {
  const totalDays = PLAN_DAYS[member.plan] ?? 30;
  const progress = Math.min(1, Math.max(0, member.daysRemaining / totalDays));
  const progressWidth = `${Math.round(progress * 100)}%` as const;

  const isBlocked = member.status === "bloqueado" || member.status === "mora";
  const barColor = member.daysRemaining > 7
    ? Colors.green
    : member.daysRemaining > 0
    ? Colors.orange
    : Colors.red;

  return (
    <View style={[styles.card, isBlocked && styles.cardWarning]}>
      <View style={styles.row}>
        <Text style={styles.planLabel}>{member.plan.toUpperCase()}</Text>
        <StatusBadge status={member.status} size="sm" />
      </View>

      <Text style={styles.daysCount}>{member.daysRemaining}</Text>
      <Text style={styles.daysLabel}>días restantes</Text>

      {/* Barra de progreso */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: progressWidth, backgroundColor: barColor }]} />
      </View>

      <View style={styles.datesRow}>
        <View>
          <Text style={styles.dateLabel}>Inicio</Text>
          <Text style={styles.dateValue}>{formatDate(member.membershipStart)}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.dateLabel}>Vencimiento</Text>
          <Text style={styles.dateValue}>{formatDate(member.membershipEnd)}</Text>
        </View>
      </View>
    </View>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardWarning: {
    borderColor: Colors.red + "60",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  planLabel: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  daysCount: {
    color: Colors.text,
    fontSize: 48,
    fontWeight: "900",
    lineHeight: 52,
  },
  daysLabel: {
    color: Colors.dim,
    fontSize: 13,
    marginBottom: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.card2,
    borderRadius: 2,
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateLabel: {
    color: Colors.dim,
    fontSize: 11,
    marginBottom: 2,
  },
  dateValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
});
