import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthResponse } from "../api/auth";

const TOKEN_KEY = "@paasmart_admin_token";
const USER_KEY = "@paasmart_admin_user";

export async function saveAuthSession(auth: AuthResponse) {
  await AsyncStorage.setItem(TOKEN_KEY, auth.token);
  await AsyncStorage.setItem(
    USER_KEY,
    JSON.stringify({ userId: auth.userId, name: auth.name, role: auth.role })
  );
}

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser() {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearAuthSession() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}