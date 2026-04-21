import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth";
import { ApiError } from "../api/client";
import type { Session } from "../types";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<Session>;
  register: (
    username: string,
    password: string,
    displayName: string,
  ) => Promise<Session>;
  logout: () => Promise<void>;
  /** Replace the in-memory session (e.g. after a profile update). */
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Attempt to restore session from the server's httpOnly cookie on mount.
  useEffect(() => {
    authApi
      .me()
      .then(setSession)
      .catch((err: unknown) => {
        // 401 = not logged in — treat as guest, don't surface an error.
        if (err instanceof ApiError && err.status === 401) return;
        console.error("Failed to restore session:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const s = await authApi.login({ username, password });
    setSession(s);
    return s;
  }, []);

  const register = useCallback(
    async (username: string, password: string, displayName: string) => {
      const s = await authApi.register({ username, password, displayName });
      setSession(s);
      return s;
    },
    [],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setSession(null);
  }, []);

  const refreshSession = useCallback(async () => {
    const s = await authApi.me();
    setSession(s);
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, loading, login, register, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
