import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { approveShop, getAllShops, getPendingShops, rejectShop, suspendShop } from "../../../api/admin/adminApi";
import type { Shop } from "../../../api/admin/types";
import { ApiError } from "../../../api/client";
import { AppBackground } from "../../../components/AppBackground";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { Input } from "../../../components/Input";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

type TabKey = "pending" | "all";
type ReasonAction = { shopId: number; action: "reject" | "suspend" } | null;

function statusColor(status: Shop["status"]) {
  if (status === "APPROVED") return colors.success;
  if (status === "PENDING") return colors.warning;
  return colors.error;
}

function ReasonModal({
  reasonAction,
  reason,
  setReason,
  submitting,
  onCancel,
  onSubmit,
}: {
  reasonAction: ReasonAction;
  reason: string;
  setReason: (v: string) => void;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal visible={!!reasonAction} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalScroll}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>{reasonAction?.action === "reject" ? "Reject Shop" : "Suspend Shop"}</Text>
            <Input label="Reason" placeholder="Shown to the seller" value={reason} onChangeText={setReason} multiline />
            <View style={{ height: 12 }} />
            <Button label={submitting ? "Submitting..." : "Confirm"} onPress={onSubmit} loading={submitting} />
            <View style={{ height: 10 }} />
            <Button label="Cancel" variant="outline" onPress={onCancel} />
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
}

function WebShops({
  tab,
  setTab,
  shops,
  onApprove,
  onOpenReason,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  shops: Shop[];
  onApprove: (id: number) => void;
  onOpenReason: (shopId: number, action: "reject" | "suspend") => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.webTabs}>
        <Pressable style={[styles.webTab, tab === "pending" && styles.webTabActive]} onPress={() => setTab("pending")}>
          <Text style={[styles.webTabText, tab === "pending" && styles.webTabTextActive]}>Pending</Text>
        </Pressable>
        <Pressable style={[styles.webTab, tab === "all" && styles.webTabActive]} onPress={() => setTab("all")}>
          <Text style={[styles.webTabText, tab === "all" && styles.webTabTextActive]}>All Shops</Text>
        </Pressable>
      </View>

      <View style={styles.tableCard}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Shop</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Category</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>City</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Actions</Text>
        </View>
        {shops.length === 0 ? (
          <Text style={styles.emptyText}>No shops here.</Text>
        ) : (
          shops.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: typography.weight.bold }]}>{item.shopName}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.category}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.city}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusPill, { color: statusColor(item.status), backgroundColor: statusColor(item.status) + "22" }]}>
                  {item.status}
                </Text>
              </View>
              <View style={{ flex: 1.5, flexDirection: "row", gap: 8 }}>
                {item.status === "PENDING" && (
                  <Pressable style={styles.approveBtn} onPress={() => onApprove(item.id)}>
                    <Text style={styles.smallActionText}>Approve</Text>
                  </Pressable>
                )}
                {item.status !== "REJECTED" && (
                  <Pressable
                    style={styles.rejectBtn}
                    onPress={() => onOpenReason(item.id, item.status === "PENDING" ? "reject" : "suspend")}
                  >
                    <Text style={styles.smallActionText}>{item.status === "PENDING" ? "Reject" : "Suspend"}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function NativeShops({
  tab,
  setTab,
  shops,
  loading,
  onApprove,
  onOpenReason,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  shops: Shop[];
  loading: boolean;
  onApprove: (id: number) => void;
  onOpenReason: (shopId: number, action: "reject" | "suspend") => void;
}) {
  return (
    <AppBackground>
      <View style={styles.nativeScreen}>
        <Text style={styles.nativeTitle}>Shops</Text>

        <View style={styles.nativeTabs}>
          <Pressable style={[styles.nativeTab, tab === "pending" && styles.nativeTabActive]} onPress={() => setTab("pending")}>
            <Text style={[styles.nativeTabText, tab === "pending" && styles.nativeTabTextActive]}>Pending</Text>
          </Pressable>
          <Pressable style={[styles.nativeTab, tab === "all" && styles.nativeTabActive]} onPress={() => setTab("all")}>
            <Text style={[styles.nativeTabText, tab === "all" && styles.nativeTabTextActive]}>All Shops</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={shops}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No shops here.</Text>}
            renderItem={({ item }) => (
              <Card style={styles.nativeCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nativeShopName}>{item.shopName}</Text>
                  <Text style={styles.nativeMeta}>{item.category} • {item.city}</Text>
                  <Text style={styles.nativeMeta}>{item.address}</Text>
                  <Text style={[styles.nativeStatus, { color: statusColor(item.status) }]}>{item.status}</Text>
                </View>
                <View style={styles.nativeActions}>
                  {item.status === "PENDING" && (
                    <Pressable style={styles.approveBtn} onPress={() => onApprove(item.id)}>
                      <Text style={styles.smallActionText}>Approve</Text>
                    </Pressable>
                  )}
                  {item.status !== "REJECTED" && (
                    <Pressable
                      style={styles.rejectBtn}
                      onPress={() => onOpenReason(item.id, item.status === "PENDING" ? "reject" : "suspend")}
                    >
                      <Text style={styles.smallActionText}>{item.status === "PENDING" ? "Reject" : "Suspend"}</Text>
                    </Pressable>
                  )}
                </View>
              </Card>
            )}
          />
        )}
      </View>
    </AppBackground>
  );
}

export default function ShopsScreen() {
  const { token } = useAdminAuth();
  const [tab, setTab] = useState<TabKey>("pending");
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [reasonAction, setReasonAction] = useState<ReasonAction>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = tab === "pending" ? await getPendingShops(token) : await getAllShops(token);
      setShops(data);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load shops");
    } finally {
      setLoading(false);
    }
  }, [tab, token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleApprove(id: number) {
    if (!token) return;
    await approveShop(id, token);
    load();
  }

  function openReasonModal(shopId: number, action: "reject" | "suspend") {
    setReason("");
    setReasonAction({ shopId, action });
  }

  async function submitReason() {
    if (!reasonAction || !token) return;
    try {
      setSubmitting(true);
      if (reasonAction.action === "reject") {
        await rejectShop(reasonAction.shopId, { reason }, token);
      } else {
        await suspendShop(reasonAction.shopId, { reason }, token);
      }
      setReasonAction(null);
      setReason("");
      load();
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.error }}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      {Platform.OS === "web" ? (
        <WebShops tab={tab} setTab={setTab} shops={shops} onApprove={handleApprove} onOpenReason={openReasonModal} />
      ) : (
        <NativeShops tab={tab} setTab={setTab} shops={shops} loading={loading} onApprove={handleApprove} onOpenReason={openReasonModal} />
      )}
      <ReasonModal
        reasonAction={reasonAction}
        reason={reason}
        setReason={setReason}
        submitting={submitting}
        onCancel={() => setReasonAction(null)}
        onSubmit={submitReason}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { color: colors.textMuted, textAlign: "center", padding: 20 },

  // Web
  webTabs: { flexDirection: "row", gap: 10, marginBottom: 16 },
  webTab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, backgroundColor: "rgba(15,15,15,0.6)", borderWidth: 1, borderColor: colors.surfaceBorder },
  webTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  webTabText: { color: colors.textMuted, fontWeight: typography.weight.medium },
  webTabTextActive: { color: colors.white },
  tableCard: { backgroundColor: "rgba(15,15,15,0.72)", borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 14, padding: 20 },
  tableHeaderRow: { flexDirection: "row", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  tableHeaderCell: { color: colors.textMuted, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  tableCell: { color: colors.textPrimary, fontSize: typography.size.sm },
  statusPill: { alignSelf: "flex-start", fontSize: typography.size.xs, fontWeight: typography.weight.bold, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  approveBtn: { backgroundColor: colors.success, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  rejectBtn: { backgroundColor: colors.error, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  smallActionText: { color: colors.white, fontWeight: typography.weight.bold, fontSize: typography.size.xs },

  // Native
  nativeScreen: { flex: 1, paddingTop: 56 },
  nativeTitle: { color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.heavy, paddingHorizontal: 20 },
  nativeTabs: { flexDirection: "row", paddingHorizontal: 20, marginTop: 16, gap: 10 },
  nativeTab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "rgba(15,15,15,0.5)", borderWidth: 1, borderColor: colors.surfaceBorder },
  nativeTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  nativeTabText: { color: colors.textMuted, fontWeight: typography.weight.medium },
  nativeTabTextActive: { color: colors.white },
  nativeCard: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  nativeShopName: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  nativeMeta: { color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 2 },
  nativeStatus: { fontWeight: typography.weight.bold, marginTop: 6, fontSize: typography.size.xs },
  nativeActions: { justifyContent: "center", gap: 8 },

  // Modal (shared)
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)" },
  modalScroll: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 420 },
  modalTitle: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold, marginBottom: 16 },
});