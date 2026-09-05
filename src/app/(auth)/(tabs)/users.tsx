import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { blockUser, getAllUsers, unblockUser } from "../../../api/admin/adminApi";
import type { AdminUser } from "../../../api/admin/types";
import { ApiError } from "../../../api/client";
import { AppBackground } from "../../../components/AppBackground";
import { Card } from "../../../components/Card";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

function WebUsers({ users, onToggle }: { users: AdminUser[]; onToggle: (u: AdminUser) => void }) {
  return (
    <View style={styles.tableCard}>
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Name</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Phone</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Role</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Action</Text>
      </View>
      {users.length === 0 ? (
        <Text style={styles.emptyText}>No users found.</Text>
      ) : (
        users.map((item) => {
          const banned = item.status === "BANNED";
          return (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: typography.weight.bold }]}>{item.name}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.phone}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.role}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusPill, { color: banned ? colors.error : colors.success, backgroundColor: (banned ? colors.error : colors.success) + "22" }]}>
                  {item.status}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Pressable style={[styles.actionBtn, { backgroundColor: banned ? colors.success : colors.error }]} onPress={() => onToggle(item)}>
                  <Text style={styles.actionText}>{banned ? "Unblock" : "Block"}</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

function NativeUsers({ users, loading, onToggle }: { users: AdminUser[]; loading: boolean; onToggle: (u: AdminUser) => void }) {
  return (
    <AppBackground>
      <View style={styles.nativeScreen}>
        <Text style={styles.nativeTitle}>Users</Text>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
            renderItem={({ item }) => {
              const banned = item.status === "BANNED";
              return (
                <Card style={styles.nativeCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nativeName}>{item.name}</Text>
                    <Text style={styles.nativeMeta}>{item.phone} • {item.role}</Text>
                    <Text style={[styles.nativeStatus, { color: banned ? colors.error : colors.success }]}>{item.status}</Text>
                  </View>
                  <Pressable style={[styles.actionBtn, { backgroundColor: banned ? colors.success : colors.error }]} onPress={() => onToggle(item)}>
                    <Text style={styles.actionText}>{banned ? "Unblock" : "Block"}</Text>
                  </Pressable>
                </Card>
              );
            }}
          />
        )}
      </View>
    </AppBackground>
  );
}

export default function UsersScreen() {
  const { token } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getAllUsers(token);
      setUsers(data);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function toggleBlock(user: AdminUser) {
    if (!token) return;
    if (user.status === "BANNED") {
      await unblockUser(user.id, token);
    } else {
      await blockUser(user.id, token);
    }
    load();
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.error }}>{error}</Text>
      </View>
    );
  }

  return Platform.OS === "web" ? (
    <WebUsers users={users} onToggle={toggleBlock} />
  ) : (
    <NativeUsers users={users} loading={loading} onToggle={toggleBlock} />
  );
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
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: "flex-start" },
  actionText: { color: colors.white, fontWeight: typography.weight.bold, fontSize: typography.size.xs },
  nativeScreen: { flex: 1, paddingTop: 56 },
  nativeTitle: { color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.heavy, paddingHorizontal: 20 },
  nativeCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  nativeName: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  nativeMeta: { color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 2 },
  nativeStatus: { fontWeight: typography.weight.bold, marginTop: 6, fontSize: typography.size.xs },
});