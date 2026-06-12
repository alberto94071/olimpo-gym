import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, saveToken, deleteToken, getToken, ApiError } from "./api";
import type { AuthMember } from "./types";

interface AuthState {
  member: AuthMember | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    member: null,
    token: null,
    loading: true,
  });

  // Al arrancar: verificar si hay token guardado
  useEffect(() => {
    (async () => {
      const storedToken = await getToken();
      if (!storedToken) {
        setState({ member: null, token: null, loading: false });
        return;
      }
      try {
        const res = await apiFetch<{ valid: boolean; member: AuthMember }>(
          "/api/mobile/auth/verify",
          { method: "POST" }
        );
        if (res.valid && res.member) {
          setState({ member: res.member, token: storedToken, loading: false });
        } else {
          await deleteToken();
          setState({ member: null, token: null, loading: false });
        }
      } catch {
        await deleteToken();
        setState({ member: null, token: null, loading: false });
      }
    })();
  }, []);

  async function loginWithGoogle(idToken: string) {
    const res = await apiFetch<{ token: string; member: AuthMember }>(
      "/api/mobile/auth/google",
      {
        method: "POST",
        body: JSON.stringify({ idToken }),
        skipAuth: true,
      }
    );
    await saveToken(res.token);
    setState({ member: res.member, token: res.token, loading: false });

    // Registrar push token en background (no bloquea el login)
    import("./push").then(({ registerForPushNotifications }) => {
      registerForPushNotifications().catch(console.error);
    });
  }

  async function logout() {
    await deleteToken();
    setState({ member: null, token: null, loading: false });
  }

  return React.createElement(
    AuthContext.Provider,
    { value: { ...state, loginWithGoogle, logout } },
    children
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

export { ApiError };
