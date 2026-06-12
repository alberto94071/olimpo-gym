import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Cinzel_700Bold } from "@expo-google-fonts/cinzel";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Colors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

function AuthGuard() {
  const { member, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({ Cinzel_700Bold });

  useEffect(() => {
    if (!loading && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loading, fontsLoaded]);

  useEffect(() => {
    if (loading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!member && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (member && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [member, loading, fontsLoaded, segments]);

  // Navegar a la pantalla de cumpleaños cuando el usuario toca la notificación
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;
      if (data?.type === "birthday") {
        const name = typeof data.memberName === "string" ? data.memberName : "";
        router.push({ pathname: "/birthday", params: { name } });
      }
    });
    return () => sub.remove();
  }, [router]);

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AuthGuard />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});
