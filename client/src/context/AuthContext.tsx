import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { api } from "../api/client";
import { clearToken, getToken, setToken } from "../api/client";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getToken()));

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      async login(username: string, password: string) {
        const { token } = await api.post<{ token: string }>("/auth/login", { username, password });
        setToken(token);
        setIsAuthenticated(true);
      },
      logout() {
        clearToken();
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated],
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
