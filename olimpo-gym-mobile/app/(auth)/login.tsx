import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { Colors } from "@/constants/colors";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_ID_ANDROID } from "@/constants/config";
import { useAuth, ApiError } from "@/lib/auth";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
    redirectUri: makeRedirectUri({ scheme: "olimpogym" }),
  });

  React.useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        handleLogin(idToken);
      }
    } else if (response?.type === "error") {
      Alert.alert("Error", "No se pudo completar el inicio de sesión con Google.");
    }
  }, [response]);

  async function handleLogin(idToken: string) {
    setLoading(true);
    try {
      await loginWithGoogle(idToken);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 404
            ? "No estás inscrito en Olimpo Gym. Contacta a tu sede."
            : err.message
          : "Error al iniciar sesión. Intenta de nuevo.";
      Alert.alert("Acceso denegado", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Logo / Branding */}
      <View style={styles.logoArea}>
        <Text style={styles.logoTitle}>OLIMPO</Text>
        <Text style={styles.logoSubtitle}>GYM</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>Forjando cuerpos. Construyendo leyendas.</Text>
      </View>

      {/* Login card */}
      <View style={styles.card}>
        <Text style={styles.welcomeText}>Bienvenido</Text>
        <Text style={styles.instructionText}>
          Inicia sesión con tu cuenta de Google para acceder a tu membresía.
        </Text>

        <TouchableOpacity
          style={[styles.googleButton, (!request || loading) && styles.disabled]}
          onPress={() => promptAsync()}
          disabled={!request || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.bg} />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Iniciar sesión con Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>Solo para miembros inscritos</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoTitle: {
    fontSize: 52,
    fontWeight: "900",
    color: Colors.gold,
    letterSpacing: 12,
  },
  logoSubtitle: {
    fontSize: 28,
    fontWeight: "300",
    color: Colors.text,
    letterSpacing: 16,
    marginTop: -8,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: Colors.gold,
    marginVertical: 16,
  },
  tagline: {
    color: Colors.dim,
    fontSize: 13,
    letterSpacing: 1,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  welcomeText: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  instructionText: {
    color: Colors.dim,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    justifyContent: "center",
    gap: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4285F4",
  },
  googleButtonText: {
    color: "#1F1F1F",
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimer: {
    color: Colors.dim,
    fontSize: 12,
    marginTop: 16,
  },
});
