import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.subtitle}>Pantalla no encontrada</Text>
      <TouchableOpacity onPress={() => router.replace("/(tabs)")} style={styles.btn}>
        <Text style={styles.btnText}>Ir al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { color: Colors.gold, fontSize: 64, fontWeight: "900" },
  subtitle: { color: Colors.dim, fontSize: 16, marginBottom: 32 },
  btn: { backgroundColor: Colors.gold, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: Colors.bg, fontWeight: "700", fontSize: 15 },
});
