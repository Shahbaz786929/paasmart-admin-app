import { createContext, useContext, useEffect, useState } from "react";

import type { AuthResponse } from "../api/auth";
import { clearAuthSession, getAuthToken, getStoredUser, saveAuthSession } from "../utils/authStorage";

type StoredUser = { userId: number; name: string; role: string };

type AdminAuthContextValue = {
  user: StoredUser | null;
  token: string | null;
  loading: boolean;
  isSuperAdmin: boolean;
  login: (auth: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedUser = await getStoredUser();
      const storedToken = await getAuthToken();
      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);
      }
      setLoading(false);
    })();
  }, []);

  async function login(auth: AuthResponse) {
    await saveAuthSession(auth);
    setUser({ userId: auth.userId, name: auth.name, role: auth.role });
    setToken(auth.token);
  }

  async function logout() {
    await clearAuthSession();
    setUser(null);
    setToken(null);
  }

  return (
    <AdminAuthContext.Provider
      value={{ user, token, loading, isSuperAdmin: user?.role === "ADMIN", login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}