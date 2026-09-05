import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ApiError } from "../../../api/client";
import {
    activateTenant,
    createTenant,
    createTenantAdmin,
    getAllTenants,
    suspendTenant,
} from "../../../api/tenant/tenantApi";
import type { CreateTenantAdminRequest, CreateTenantRequest, Tenant } from "../../../api/tenant/types";
import { AppBackground } from "../../../components/AppBackground";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { Input } from "../../../components/Input";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

const emptyTenantForm: CreateTenantRequest = { slug: "", name: "" };
const emptyAdminForm: CreateTenantAdminRequest = { name: "", phone: "" };

function CreateCityModal({
  visible,
  form,
  setForm,
  saving,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  form: CreateTenantRequest;
  setForm: (f: CreateTenantRequest) => void;
  saving: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalScroll}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Launch a New City</Text>
            <Input label="Slug" placeholder="e.g. jaipur" value={form.slug} onChangeText={(v) => setForm({ ...form, slug: v })} autoCapitalize="none" />
            <View style={{ height: 12 }} />
            <Input label="Display name" placeholder="e.g. LocalMart Jaipur" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
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

function AddPartnerModal({
  tenantId,
  form,
  setForm,
  saving,
  onCancel,
  onSubmit,
}: {
  tenantId: number | null;
  form: CreateTenantAdminRequest;
  setForm: (f: CreateTenantAdminRequest) => void;
  saving: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal visible={tenantId != null} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalScroll}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add City Partner</Text>
            <Input label="Full name" placeholder="Partner's name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
            <View style={{ height: 12 }} />
            <Input label="Mobile number" placeholder="10-digit number" keyboardType="phone-pad" maxLength={10} value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} />
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

function WebCities({
  tenants,
  onToggle,
  onOpenCreate,
  onOpenAddPartner,
}: {
  tenants: Tenant[];
  onToggle: (t: Tenant) => void;
  onOpenCreate: () => void;
  onOpenAddPartner: (id: number) => void;
}) {
  return (
    <View>
      <View style={styles.headerRow}>
        <Pressable style={styles.addBtn} onPress={onOpenCreate}>
          <Text style={styles.addBtnText}>+ New City</Text>
        </Pressable>
      </View>
      <View style={styles.tableCard}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>City</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Slug</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Actions</Text>
        </View>
        {tenants.length === 0 ? (
          <Text style={styles.emptyText}>No cities yet.</Text>
        ) : (
          tenants.map((item) => {
            const suspended = item.status === "SUSPENDED";
            return (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2, fontWeight: typography.weight.bold }]}>{item.name}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{item.slug}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statusPill, { color: suspended ? colors.error : colors.success, backgroundColor: (suspended ? colors.error : colors.success) + "22" }]}>
                    {item.status}
                  </Text>
                </View>
                <View style={{ flex: 2, flexDirection: "row", gap: 8 }}>
                  <Pressable style={styles.partnerBtn} onPress={() => onOpenAddPartner(item.id)}>
                    <Text style={styles.smallActionText}>+ City Partner</Text>
                  </Pressable>
                  <Pressable style={[styles.statusBtn, { backgroundColor: suspended ? colors.success : colors.error }]} onPress={() => onToggle(item)}>
                    <Text style={styles.smallActionText}>{suspended ? "Activate" : "Suspend"}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

function NativeCities({
  tenants,
  loading,
  onToggle,
  onOpenCreate,
  onOpenAddPartner,
}: {
  tenants: Tenant[];
  loading: boolean;
  onToggle: (t: Tenant) => void;
  onOpenCreate: () => void;
  onOpenAddPartner: (id: number) => void;
}) {
  return (
    <AppBackground>
      <View style={styles.nativeScreen}>
        <View style={styles.nativeHeaderRow}>
          <Text style={styles.nativeTitle}>Cities</Text>
          <Pressable style={styles.addBtn} onPress={onOpenCreate}>
            <Text style={styles.addBtnText}>+ New City</Text>
          </Pressable>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={tenants}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No cities yet.</Text>}
            renderItem={({ item }) => {
              const suspended = item.status === "SUSPENDED";
              return (
                <Card style={styles.nativeCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nativeName}>{item.name}</Text>
                    <Text style={styles.nativeMeta}>slug: {item.slug}</Text>
                    <Text style={[styles.nativeStatus, { color: suspended ? colors.error : colors.success }]}>{item.status}</Text>
                  </View>
                  <View style={styles.nativeActions}>
                    <Pressable style={styles.partnerBtn} onPress={() => onOpenAddPartner(item.id)}>
                      <Text style={styles.smallActionText}>+ Partner</Text>
                    </Pressable>
                    <Pressable style={[styles.statusBtn, { backgroundColor: suspended ? colors.success : colors.error }]} onPress={() => onToggle(item)}>
                      <Text style={styles.smallActionText}>{suspended ? "Activate" : "Suspend"}</Text>
                    </Pressable>
                  </View>
                </Card>
              );
            }}
          />
        )}
      </View>
    </AppBackground>
  );
}

export default function CitiesScreen() {
  const { token } = useAdminAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tenantForm, setTenantForm] = useState<CreateTenantRequest>(emptyTenantForm);

  const [adminModalTenantId, setAdminModalTenantId] = useState<number | null>(null);
  const [adminForm, setAdminForm] = useState<CreateTenantAdminRequest>(emptyAdminForm);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getAllTenants(token);
      setTenants(data);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load cities");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function toggleStatus(tenant: Tenant) {
    if (!token) return;
    if (tenant.status === "SUSPENDED") {
      await activateTenant(tenant.id, token);
    } else {
      await suspendTenant(tenant.id, token);
    }
    load();
  }

  async function submitNewTenant() {
    if (!token || !tenantForm.slug.trim() || !tenantForm.name.trim()) return;
    try {
      setSaving(true);
      await createTenant({ slug: tenantForm.slug.trim().toLowerCase(), name: tenantForm.name.trim() }, token);
      setCreateModalOpen(false);
      setTenantForm(emptyTenantForm);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function submitNewAdmin() {
    if (!token || adminModalTenantId == null || !adminForm.name.trim() || adminForm.phone.length !== 10) return;
    try {
      setSaving(true);
      await createTenantAdmin(adminModalTenantId, adminForm, token);
      Alert.alert("City Partner Created", `${adminForm.name} can now log in to this app with phone ${adminForm.phone} using OTP.`);
      setAdminModalTenantId(null);
      setAdminForm(emptyAdminForm);
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
        <WebCities
          tenants={tenants}
          onToggle={toggleStatus}
          onOpenCreate={() => setCreateModalOpen(true)}
          onOpenAddPartner={(id) => {
            setAdminForm(emptyAdminForm);
            setAdminModalTenantId(id);
          }}
        />
      ) : (
        <NativeCities
          tenants={tenants}
          loading={loading}
          onToggle={toggleStatus}
          onOpenCreate={() => setCreateModalOpen(true)}
          onOpenAddPartner={(id) => {
            setAdminForm(emptyAdminForm);
            setAdminModalTenantId(id);
          }}
        />
      )}
      <CreateCityModal visible={createModalOpen} form={tenantForm} setForm={setTenantForm} saving={saving} onCancel={() => setCreateModalOpen(false)} onSubmit={submitNewTenant} />
      <AddPartnerModal tenantId={adminModalTenantId} form={adminForm} setForm={setAdminForm} saving={saving} onCancel={() => setAdminModalTenantId(null)} onSubmit={submitNewAdmin} />
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
  partnerBtn: { backgroundColor: "rgba(255,255,255,0.1)", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  statusBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  smallActionText: { color: colors.white, fontWeight: typography.weight.bold, fontSize: typography.size.xs },
  nativeScreen: { flex: 1, paddingTop: 56 },
  nativeTitle: { color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.heavy },
  nativeCard: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  nativeName: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  nativeMeta: { color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 2 },
  nativeStatus: { fontWeight: typography.weight.bold, marginTop: 6, fontSize: typography.size.xs },
  nativeActions: { justifyContent: "center", gap: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)" },
  modalScroll: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 440 },
  modalTitle: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold, marginBottom: 4 },
});