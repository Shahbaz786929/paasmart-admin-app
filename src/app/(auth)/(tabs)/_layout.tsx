import { Ionicons } from "@expo/vector-icons";
import { Redirect, Slot, Tabs, usePathname, useRouter } from "expo-router";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppBackground } from "../../../components/AppBackground";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "grid-outline" as const },
  { key: "users", label: "Users", icon: "people-outline" as const },
  { key: "shops", label: "Sellers / Stores", icon: "storefront-outline" as const },
  { key: "orders", label: "Orders", icon: "receipt-outline" as const },
  { key: "coupons", label: "Coupons", icon: "pricetag-outline" as const },
  { key: "cities", label: "Cities", icon: "business-outline" as const, superAdminOnly: true },
  { key: "settings", label: "Settings", icon: "settings-outline" as const, tenantAdminOnly: true },
];

function NativeTabsLayout({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: "rgba(10,10,10,0.9)",
          borderTopColor: colors.surfaceBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
          href: isSuperAdmin ? null : undefined,
        }}
      />
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <Ionicons name="speedometer" size={size} color={color} /> }} />
      <Tabs.Screen name="shops" options={{ title: "Shops", tabBarIcon: ({ color, size }) => <Ionicons name="storefront" size={size} color={color} /> }} />
      <Tabs.Screen name="users" options={{ title: "Users", tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: ({ color, size }) => <Ionicons name="receipt" size={size} color={color} /> }} />
      <Tabs.Screen name="coupons" options={{ title: "Coupons", tabBarIcon: ({ color, size }) => <Ionicons name="pricetag" size={size} color={color} /> }} />
      <Tabs.Screen
        name="cities"
        options={{
          title: "Cities",
          tabBarIcon: ({ color, size }) => <Ionicons name="business" size={size} color={color} />,
          href: isSuperAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}

function WebSidebarLayout({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  return (
    <AppBackground>
      <View style={styles.shell}>
        <View style={styles.sidebar}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="bag-handle" size={20} color={colors.white} />
            </View>
            <View>
              <Text style={styles.brandName}>PaasMart</Text>
              <Text style={styles.brandSub}>Admin Panel</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>MAIN</Text>
          <ScrollView style={{ flex: 1 }}>
            {NAV_ITEMS.filter((item) => {
              if (item.superAdminOnly) return isSuperAdmin;
              if (item.tenantAdminOnly) return !isSuperAdmin;
              return true;
            }).map((item) => {
              const active = pathname?.includes(item.key);
              return (
                <Pressable
                  key={item.key}
                  style={[styles.navItem, active && styles.navItemActive]}
                  onPress={() => router.push(`/(tabs)/${item.key}` as any)}
                >
                  <Ionicons name={item.icon} size={18} color={active ? colors.white : colors.textSecondary} />
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={styles.logoutRow} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

        <View style={styles.contentArea}>
          <View style={styles.topBar}>
            <Text style={styles.topBarTitle}>
              {NAV_ITEMS.find((i) => pathname?.includes(i.key))?.label ?? "Dashboard"}
            </Text>
            <View style={styles.profileRow}>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileRole}>{user?.role === "ADMIN" ? "Platform Admin" : "City Partner"}</Text>
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.pageScroll} contentContainerStyle={styles.pageContent}>
            <Slot />
          </ScrollView>
        </View>
      </View>
    </AppBackground>
  );
}

export default function TabsLayout() {
  const { user, loading, isSuperAdmin } = useAdminAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return Platform.OS === "web" ? (
    <WebSidebarLayout isSuperAdmin={isSuperAdmin} />
  ) : (
    <NativeTabsLayout isSuperAdmin={isSuperAdmin} />
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: "row", backgroundColor: "transparent", minHeight: "100%" as any },
  sidebar: {
    width: 240,
    backgroundColor: "rgba(15,15,15,0.82)",
    borderRightWidth: 1,
    borderRightColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 24, paddingHorizontal: 6 },
  brandIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  brandName: { color: colors.textPrimary, fontWeight: typography.weight.heavy, fontSize: typography.size.md },
  brandSub: { color: colors.textMuted, fontSize: typography.size.xs },
  sectionLabel: { color: colors.textMuted, fontSize: 11, fontWeight: typography.weight.bold, letterSpacing: 1, paddingHorizontal: 6, marginBottom: 8 },
  navItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, marginBottom: 2 },
  navItemActive: { backgroundColor: colors.primary },
  navLabel: { color: colors.textSecondary, fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  navLabelActive: { color: colors.white, fontWeight: typography.weight.bold },
  logoutRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 10, marginTop: 12 },
  logoutText: { color: colors.error, fontWeight: typography.weight.bold, fontSize: typography.size.sm },
  contentArea: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 18,
    backgroundColor: "rgba(15,15,15,0.72)",
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  topBarTitle: { color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.heavy },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  profileName: { color: colors.textPrimary, fontWeight: typography.weight.bold, fontSize: typography.size.sm },
  profileRole: { color: colors.textMuted, fontSize: typography.size.xs },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontWeight: typography.weight.heavy },
  pageScroll: { flex: 1 },
  pageContent: { padding: 28 },
});