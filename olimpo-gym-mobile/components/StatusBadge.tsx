import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import type { MemberStatus } from "@/lib/types";

const STATUS_CONFIG: Record<MemberStatus, { label: string; color: string; bg: string }> = {
  activo: { label: "Al día", color: Colors.green, bg: "#1A3A1A" },
  mora: { label: "En mora", color: Colors.orange, bg: "#3A2A0A" },
  vencido: { label: "Vencido", color: Colors.red, bg: "#3A0A0A" },
  bloqueado: { label: "Bloqueado", color: Colors.red, bg: "#3A0A0A" },
};

interface Props {
  status: MemberStatus;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.vencido;
  const fontSize = size === "sm" ? 11 : size === "lg" ? 15 : 13;
  const px = size === "sm" ? 8 : size === "lg" ? 14 : 10;
  const py = size === "sm" ? 3 : size === "lg" ? 6 : 4;

  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, paddingHorizontal: px, paddingVertical: py }]}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.label, { color: cfg.color, fontSize }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    gap: 5,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontWeight: "600",
  },
});
