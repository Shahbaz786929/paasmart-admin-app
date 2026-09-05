import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { G } from "react-native-svg";
import { getAllOrders, getDashboardStats } from "../../../api/admin/adminApi";
import type { AdminOrder, DashboardStats } from "../../../api/admin/types";
import { ApiError } from "../../../api/client";
import { AppBackground } from "../../../components/AppBackground";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

const STATUS_COLORS = [colors.primary, colors.warning, colors.error, "#3B82F6", "#8B5CF6"];

function statusPillStyle(status: string) {
  if (status === "DELIVERED") return { color: colors.success, backgroundColor: colors.success + "22" };
  if (status === "CANCELLED" || status === "REJECTED") return { color: colors.error, backgroundColor: colors.error + "22" };
  return { color: colors.warning, backgroundColor: colors.warning + "22" };
}

function OrderStatusDonut({ orders }: { orders: AdminOrder[] }) {
  const counts: Record<string, number> = {};
  orders.forEach((o) => {
    counts[o.status] = (counts[o.status] ?? 0) + 1;
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = orders.length;

  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetSoFar = 0;

  return (
    <View style={styles.donutCard}>
      <Text style={styles.cardTitle}>Order Status</Text>
      <View style={styles.donutRow}>
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
              <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.surfaceBorder} strokeWidth={strokeWidth} fill="none" />
              {total > 0 &&
                entries.map(([status, count], i) => {
                  const fraction = count / total;
                  const dash = fraction * circumference;
                  const segment = (
                    <Circle
                      key={status}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke={STATUS_COLORS[i % STATUS_COLORS.length]}
                      strokeWidth={strokeWidth}
                      fill="none"
                      strokeDasharray={`${dash} ${circumference - dash}`}
                      strokeDashoffset={-offsetSoFar}
                      strokeLinecap="butt"
                    />
                  );
                  offsetSoFar += dash;
                  return segment;
                })}
            </G>
          </Svg>
          <View style={styles.donutCenter}>
            <Text style={styles.donutTotal}>{total}</Text>
            <Text style={styles.donutTotalLabel}>Total</Text>
          </View>
        </View>

        <View style={{ flex: 1, gap: 10 }}>
          {entries.length === 0 ? (
            <Text style={styles.emptyText}>No orders yet</Text>
          ) : (
            entries.map(([status, count], i) => (
              <View key={status} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }]} />
                <Text style={styles.legendLabel}>{status}</Text>
                <Text style={styles.legendValue}>
                  {count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
}

function RecentOrdersTable({ orders }: { orders: AdminOrder[] }) {
  const recent = orders.slice(0, 6);
  return (
    <View style={styles.tableCard}>
      <Text style={styles.cardTitle}>Recent Orders</Text>
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Order ID</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Shop</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Amount</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
      </View>
      {recent.length === 0 ? (
        <Text style={styles.emptyText}>No orders yet</Text>
      ) : (
        recent.map((order) => (
          <View key={order.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 1, fontWeight: typography.weight.bold }]}>#{order.id}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>Shop #{order.shopId}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>₹{order.totalAmount}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusPill, statusPillStyle(order.status)]}>{order.status}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function StatCard({ icon, iconColor, label, value }: { icon: keyof typeof Ionicons.glyphMap; iconColor: string; label: string; value: string | number }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconBadge, { backgroundColor: iconColor + "22" }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function WebDashboard({ user, stats, orders }: { user: any; stats: DashboardStats; orders: AdminOrder[] }) {
  return (
    <ScrollView>
      <Text style={styles.welcome}>Welcome back, {user?.name}! Here's what's happening today.</Text>
      <View style={styles.statsRow}>
        <StatCard icon="bag-handle" iconColor={colors.primary} label="Total Orders" value={stats.totalOrders} />
        <StatCard icon="people" iconColor="#8B5CF6" label="Total Users" value={stats.totalUsers} />
        <StatCard icon="storefront" iconColor="#3B82F6" label="Approved Shops" value={stats.approvedShops} />
        <StatCard icon="time" iconColor={colors.warning} label="Pending Shops" value={stats.pendingShops} />
      </View>
      <View style={styles.statsRow}>
        <StatCard icon="people-circle" iconColor={colors.primary} label="Customers" value={stats.totalCustomers} />
        <StatCard icon="briefcase" iconColor="#8B5CF6" label="Sellers" value={stats.totalSellers} />
        <StatCard icon="bicycle" iconColor="#3B82F6" label="Delivery Partners" value={stats.totalDeliveryBoys} />
        <StatCard icon="cash" iconColor={colors.success} label="Total Revenue" value={`₹${stats.totalRevenue}`} />
      </View>
      <View style={styles.grid}>
        <OrderStatusDonut orders={orders} />
        <RecentOrdersTable orders={orders} />
      </View>
    </ScrollView>
  );
}

function NativeStatCard({ icon, iconColor, label, value }: { icon: keyof typeof Ionicons.glyphMap; iconColor: string; label: string; value: string | number }) {
  return (
    <View style={styles.nativeTile}>
      <View style={[styles.nativeIconBadge, { backgroundColor: iconColor + "22" }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.nativeTileValue}>{value}</Text>
      <Text style={styles.nativeTileLabel}>{label}</Text>
    </View>
  );
}

function NativeDashboard({ user, stats, logout }: { user: any; stats: DashboardStats; logout: () => void }) {
  return (
    <AppBackground>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.nativeContent}>
        <View style={styles.nativeHeader}>
          <View>
            <Text style={styles.nativeGreeting}>Hi, {user?.name}</Text>
            <Text style={styles.nativeRole}>{user?.role === "ADMIN" ? "Platform Admin" : "City Partner"}</Text>
          </View>
          <Pressable onPress={logout} style={styles.nativeLogoutBtn}>
            <Ionicons name="log-out-outline" size={16} color={colors.error} />
            <Text style={{ color: colors.error, fontWeight: typography.weight.bold, fontSize: typography.size.sm }}>Logout</Text>
          </Pressable>
        </View>

        <Text style={styles.nativeSectionLabel}>OVERVIEW</Text>
        <View style={styles.nativeGrid}>
          <NativeStatCard icon="bag-handle" iconColor={colors.primary} label="Total Orders" value={stats.totalOrders} />
          <NativeStatCard icon="people" iconColor="#8B5CF6" label="Total Users" value={stats.totalUsers} />
          <NativeStatCard icon="storefront" iconColor="#3B82F6" label="Approved Shops" value={stats.approvedShops} />
          <NativeStatCard icon="time" iconColor={colors.warning} label="Pending Shops" value={stats.pendingShops} />
          <NativeStatCard icon="people-circle" iconColor={colors.primary} label="Customers" value={stats.totalCustomers} />
          <NativeStatCard icon="briefcase" iconColor="#8B5CF6" label="Sellers" value={stats.totalSellers} />
          <NativeStatCard icon="bicycle" iconColor="#3B82F6" label="Delivery Partners" value={stats.totalDeliveryBoys} />
          <NativeStatCard icon="cash" iconColor={colors.success} label="Total Revenue" value={`₹${stats.totalRevenue}`} />
        </View>
      </ScrollView>
    </AppBackground>
  );
}

export default function DashboardScreen() {
  const { user, token, logout } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsData, ordersData] = await Promise.all([getDashboardStats(token), getAllOrders(token)]);
      setStats(statsData);
      setOrders(ordersData);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.error }}>{error}</Text>
      </View>
    );
  }

  if (loading || !stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return Platform.OS === "web" ? (
    <WebDashboard user={user} stats={stats} orders={orders} />
  ) : (
    <NativeDashboard user={user} stats={stats} logout={logout} />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  welcome: { color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: 20 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 16 },
  statCard: { flex: 1, minWidth: 180, backgroundColor: "rgba(15,15,15,0.72)", borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 14, padding: 18 },
  statIconBadge: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  statLabel: { color: colors.textSecondary, fontSize: typography.size.sm },
  statValue: { color: colors.textPrimary, fontSize: 24, fontWeight: typography.weight.heavy, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 4 },
  donutCard: { flex: 1, minWidth: 320, backgroundColor: "rgba(15,15,15,0.72)", borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 14, padding: 20 },
  tableCard: { flex: 2, minWidth: 400, backgroundColor: "rgba(15,15,15,0.72)", borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 14, padding: 20 },
  cardTitle: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold, marginBottom: 16 },
  donutRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  donutCenter: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  donutTotal: { color: colors.textPrimary, fontSize: 22, fontWeight: typography.weight.heavy },
  donutTotalLabel: { color: colors.textMuted, fontSize: typography.size.xs },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { color: colors.textSecondary, fontSize: typography.size.sm, flex: 1 },
  legendValue: { color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.bold },
  emptyText: { color: colors.textMuted, fontSize: typography.size.sm },
  tableHeaderRow: { flexDirection: "row", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  tableHeaderCell: { color: colors.textMuted, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  tableCell: { color: colors.textPrimary, fontSize: typography.size.sm },
  statusPill: { alignSelf: "flex-start", fontSize: typography.size.xs, fontWeight: typography.weight.bold, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  nativeContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  nativeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  nativeGreeting: { color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.heavy },
  nativeRole: { color: colors.primary, fontWeight: typography.weight.bold, marginTop: 2, fontSize: typography.size.sm },
  nativeLogoutBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(239,68,68,0.12)", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  nativeSectionLabel: { color: colors.textMuted, fontSize: 11, fontWeight: typography.weight.bold, letterSpacing: 1, marginBottom: 12 },
  nativeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  nativeTile: { width: "47%", backgroundColor: "rgba(15,15,15,0.72)", borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 14, padding: 16 },
  nativeIconBadge: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  nativeTileValue: { color: colors.textPrimary, fontSize: 22, fontWeight: typography.weight.heavy },
  nativeTileLabel: { color: colors.textSecondary, marginTop: 4, fontSize: typography.size.sm },
});