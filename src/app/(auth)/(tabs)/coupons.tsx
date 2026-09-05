import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ApiError } from "../../../api/client";
import { createCoupon, deactivateCoupon, getAdminCoupons } from "../../../api/coupon/adminCouponApi";
import type { Coupon, CreateCouponRequest } from "../../../api/coupon/types";
import { AppBackground } from "../../../components/AppBackground";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { Input } from "../../../components/Input";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

const emptyForm: CreateCouponRequest = {
  code: "",
  description: "",
  discountType: "FLAT",
  discountValue: 0,
  minOrderAmount: 0,
  usageLimitPerUser: 1,
};

function CreateCouponModal({
  visible,
  form,
  setForm,
  saving,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  form: CreateCouponRequest;
  setForm: (f: CreateCouponRequest) => void;
  saving: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalScroll}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Coupon</Text>

            <Input label="Code" placeholder="e.g. WELCOME50" value={form.code} onChangeText={(v) => setForm({ ...form, code: v })} autoCapitalize="characters" />
            <View style={{ height: 12 }} />
            <Input label="Description" placeholder="Shown to customers" value={form.description ?? ""} onChangeText={(v) => setForm({ ...form, description: v })} />
            <View style={{ height: 12 }} />

            <View style={styles.typeToggle}>
              {(["FLAT", "PERCENTAGE"] as const).map((t) => (
                <Pressable
                  key={t}
                  style={[styles.typeOption, form.discountType === t && styles.typeOptionActive]}
                  onPress={() => setForm({ ...form, discountType: t })}
                >
                  <Text style={[styles.typeText, form.discountType === t && styles.typeTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ height: 12 }} />

            <Input
              label={form.discountType === "FLAT" ? "Discount amount (₹)" : "Discount percent (%)"}
              placeholder="0"
              keyboardType="numeric"
              value={form.discountValue ? String(form.discountValue) : ""}
              onChangeText={(v) => setForm({ ...form, discountValue: Number(v) || 0 })}
            />
            <View style={{ height: 12 }} />
            <Input
              label="Minimum order amount (optional)"
              placeholder="0"
              keyboardType="numeric"
              value={form.minOrderAmount ? String(form.minOrderAmount) : ""}
              onChangeText={(v) => setForm({ ...form, minOrderAmount: Number(v) || 0 })}
            />
            <View style={{ height: 12 }} />
            <Input
              label="Usage limit per user"
              placeholder="1"
              keyboardType="numeric"
              value={form.usageLimitPerUser ? String(form.usageLimitPerUser) : ""}
              onChangeText={(v) => setForm({ ...form, usageLimitPerUser: Number(v) || 1 })}
            />

            <View style={{ height: 16 }} />
            <Button label={saving ? "Creating..." : "Create"} onPress={onSubmit} loading={saving} />
            <View style={{ height: 10 }} />
            <Button label="Cancel" variant="outline" onPress={onCancel} />
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
}

function WebCoupons({ coupons, onOpenCreate, onDeactivate }: { coupons: Coupon[]; onOpenCreate: () => void; onDeactivate: (id: number) => void }) {
  return (
    <View>
      <View style={styles.headerRow}>
        <Pressable style={styles.addBtn} onPress={onOpenCreate}>
          <Text style={styles.addBtnText}>+ New Coupon</Text>
        </Pressable>
      </View>
      <View style={styles.tableCard}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Code</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Description</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Discount</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Action</Text>
        </View>
        {coupons.length === 0 ? (
          <Text style={styles.emptyText}>No coupons yet.</Text>
        ) : (
          coupons.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1, fontWeight: typography.weight.bold }]}>{item.code}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.description}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {item.discountType === "PERCENTAGE" ? `${item.discountValue}%` : `₹${item.discountValue}`}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusPill, { color: item.active ? colors.success : colors.error, backgroundColor: (item.active ? colors.success : colors.error) + "22" }]}>
                  {item.active ? "ACTIVE" : "INACTIVE"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                {item.active && (
                  <Pressable style={styles.deactivateBtn} onPress={() => onDeactivate(item.id)}>
                    <Text style={styles.smallActionText}>Deactivate</Text>
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

function NativeCoupons({
  coupons,
  loading,
  onOpenCreate,
  onDeactivate,
}: {
  coupons: Coupon[];
  loading: boolean;
  onOpenCreate: () => void;
  onDeactivate: (id: number) => void;
}) {
  return (
    <AppBackground>
      <View style={styles.nativeScreen}>
        <View style={styles.nativeHeaderRow}>
          <Text style={styles.nativeTitle}>Coupons</Text>
          <Pressable style={styles.addBtn} onPress={onOpenCreate}>
            <Text style={styles.addBtnText}>+ New</Text>
          </Pressable>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={coupons}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No coupons yet.</Text>}
            renderItem={({ item }) => (
              <Card style={styles.nativeCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nativeCode}>{item.code}</Text>
                  <Text style={styles.nativeMeta}>{item.description}</Text>
                  <Text style={styles.nativeMeta}>
                    {item.discountType === "PERCENTAGE" ? `${item.discountValue}% off` : `₹${item.discountValue} off`}
                    {item.minOrderAmount ? ` • Min ₹${item.minOrderAmount}` : ""}
                  </Text>
                  <Text style={[styles.nativeStatus, { color: item.active ? colors.success : colors.error }]}>
                    {item.active ? "ACTIVE" : "INACTIVE"}
                  </Text>
                </View>
                {item.active && (
                  <Pressable style={styles.deactivateBtn} onPress={() => onDeactivate(item.id)}>
                    <Text style={styles.smallActionText}>Deactivate</Text>
                  </Pressable>
                )}
              </Card>
            )}
          />
        )}
      </View>
    </AppBackground>
  );
}

export default function CouponsScreen() {
  const { token } = useAdminAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateCouponRequest>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getAdminCoupons(token);
      setCoupons(data);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load coupons");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleDeactivate(id: number) {
    if (!token) return;
    await deactivateCoupon(id, token);
    load();
  }

  function openCreateModal() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  async function submitCoupon() {
    if (!token || !form.code.trim() || !form.discountValue) return;
    try {
      setSaving(true);
      await createCoupon({ ...form, code: form.code.trim().toUpperCase() }, token);
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
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
        <WebCoupons coupons={coupons} onOpenCreate={openCreateModal} onDeactivate={handleDeactivate} />
      ) : (
        <NativeCoupons coupons={coupons} loading={loading} onOpenCreate={openCreateModal} onDeactivate={handleDeactivate} />
      )}
      <CreateCouponModal visible={modalOpen} form={form} setForm={setForm} saving={saving} onCancel={() => setModalOpen(false)} onSubmit={submitCoupon} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { color: colors.textMuted, textAlign: "center", padding: 20 },
  headerRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 16 },
  nativeHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 4 },
  addBtn: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  addBtnText: { color: colors.white, fontWeight: typography.weight.bold, fontSize: typography.size.sm },
  tableCard: { backgroundColor: "rgba(15,15,15,0.72)", borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 14, padding: 20 },
  tableHeaderRow: { flexDirection: "row", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  tableHeaderCell: { color: colors.textMuted, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  tableCell: { color: colors.textPrimary, fontSize: typography.size.sm },
  statusPill: { alignSelf: "flex-start", fontSize: typography.size.xs, fontWeight: typography.weight.bold, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  deactivateBtn: { backgroundColor: colors.error, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, alignSelf: "flex-start" },
  smallActionText: { color: colors.white, fontWeight: typography.weight.bold, fontSize: typography.size.xs },
  nativeScreen: { flex: 1, paddingTop: 56 },
  nativeTitle: { color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.heavy },
  nativeCard: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  nativeCode: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  nativeMeta: { color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 2 },
  nativeStatus: { fontWeight: typography.weight.bold, marginTop: 6, fontSize: typography.size.xs },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)" },
  modalScroll: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 440 },
  modalTitle: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold, marginBottom: 4 },
  typeToggle: { flexDirection: "row", gap: 10 },
  typeOption: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.surface, alignItems: "center" },
  typeOptionActive: { backgroundColor: colors.primary },
  typeText: { color: colors.textMuted, fontWeight: typography.weight.medium },
  typeTextActive: { color: colors.white },
});