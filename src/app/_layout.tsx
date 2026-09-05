import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { AdminAuthProvider } from "../context/AdminAuthContext";

export default function RootLayout() {
  return (
    <AdminAuthProvider>
      <StatusBar barStyle="light-content" />
      <Stack screenOptions={{ headerShown: false }} />
    </AdminAuthProvider>
  );
}