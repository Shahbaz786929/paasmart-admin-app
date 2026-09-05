import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, View } from "react-native";

import { getAllOrders } from "../../../api/admin/adminApi";
import type { AdminOrder } from "../../../api/admin/types";
import { ApiError } from "../../../api/client";
import { AppBackground } from "../../../components/AppBackground";
import { Card } from "../../../components/Card";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

function statusColor(status: string) {
  if (status === "DELIVERED") return colors.success;
  if (status === "CANCELLED" || status === "REJECTED") return colors.error;
  return colors.warning;
}

function WebOrders({ orders }: { orders: AdminOrder[] }) {
  return (
    <View style={styles.tableCard}>
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Order ID</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Shop</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Customer</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Payment</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Amount</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
      </View>
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>No orders yet.</Text>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 1, fontWeight: typography.weight.bold }]}>#{order.id}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>Shop #{order.shopId}</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>Customer #{order.customerId}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{order.paymentMode}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>₹{order.totalAmount}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusPill, { color: statusColor(order.status), backgroundColor: statusColor(order.status) + "22" }]}>
                {order.status}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function NativeOrders({ orders, loading }: { orders: AdminOrder[]; loading: boolean }) {
  return (
    <AppBackground>
      <View style={styles.nativeScreen}>
        <Text style={styles.nativeTitle}>Orders</Text>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No orders yet.</Text>}
            renderItem={({ item }) => (
              <Card style={styles.nativeCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nativeOrderId}>Order #{item.id}</Text>
                  <Text style={styles.nativeMeta}>Shop #{item.shopId} • Customer #{item.customerId}</Text>
                  <Text style={styles.nativeMeta}>{item.paymentMode} • {item.deliveryAddress}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.nativeAmount}>₹{item.totalAmount}</Text>
                  <Text style={[styles.nativeStatus, { color: statusColor(item.status) }]}>{item.status}</Text>
                </View>
              </Card>
            )}
          />
        )}
      </View>
    </AppBackground>
  );
}

export default function OrdersScreen() {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getAllOrders(token);
      setOrders(data);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load orders");
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

  return Platform.OS === "web" ? <WebOrders orders={orders} /> : <NativeOrders orders={orders} loading={loading} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { color: colors.textMuted, textAlign: "center", padding: 20 },
  tableCard: { backgroundColor: "rgba(15,15,15,0.72)", borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 14, padding: 20 },
  tableHeaderRow: { flexDirection: "row", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  tableHeaderCell: { color: colors.textMuted, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  tableCell: { color: colors.textPrimary, fontSize: typography.size.sm },
  statusPill: { alignSelf: "flex-start", fontSize: typography.size.xs, fontWeight: typography.weight.bold, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  nativeScreen: { flex: 1, paddingTop: 56 },
  nativeTitle: { color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.heavy, paddingHorizontal: 20 },
  nativeCard: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  nativeOrderId: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  nativeMeta: { color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 2 },
  nativeAmount: { color: colors.textPrimary, fontWeight: typography.weight.bold, fontSize: typography.size.md },
  nativeStatus: { fontWeight: typography.weight.bold, marginTop: 6, fontSize: typography.size.xs },
});