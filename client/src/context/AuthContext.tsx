import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api/client";

interface AuthContextValue {
  isAuthenticated: boolean;
  isChecking: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    api
      .get<{ authenticated: true }>("/auth/me")
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsChecking(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isChecking,
      async login(username: string, password: string) {
        await api.post("/auth/login", { username, password });
        setIsAuthenticated(true);
      },
      async logout() {
        try {
          await api.post("/auth/logout");
        } finally {
          setIsAuthenticated(false);
        }
      },
    }),
    [isAuthenticated, isChecking],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
