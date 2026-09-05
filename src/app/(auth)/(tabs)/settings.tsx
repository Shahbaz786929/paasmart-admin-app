import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { getDeliveryPricing, updateDeliveryBaseFee, updateDeliveryPerKmFee } from "../../../api/admin/adminApi";
import { ApiError } from "../../../api/client";
import { AppBackground } from "../../../components/AppBackground";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { Input } from "../../../components/Input";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

function DeliveryPricingForm() {
  const { token } = useAdminAuth();
  const [baseFee, setBaseFee] = useState<number | null>(null);
  const [perKmFee, setPerKmFee] = useState<number | null>(null);
  const [baseFeeInput, setBaseFeeInput] = useState("");
  const [perKmFeeInput, setPerKmFeeInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getDeliveryPricing(token);
      setBaseFee(data.baseFee);
      setPerKmFee(data.perKmFee);
      setBaseFeeInput(String(data.baseFee));
      setPerKmFeeInput(String(data.perKmFee));
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load settings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleSave() {
    if (!token) return;
    const baseVal = Number(baseFeeInput);
    const perKmVal = Number(perKmFeeInput);
    if (!baseFeeInput || isNaN(baseVal) || baseVal < 0) {
      Alert.alert("Invalid", "Enter a valid base fee (0 or more)");
      return;
    }
    if (!perKmFeeInput || isNaN(perKmVal) || perKmVal < 0) {
      Alert.alert("Invalid", "Enter a valid per-km fee (0 or more)");
      return;
    }
    try {
      setSaving(true);
      const [baseResult, perKmResult] = await Promise.all([
        updateDeliveryBaseFee(baseVal, token),
        updateDeliveryPerKmFee(perKmVal, token),
      ]);
      setBaseFee(baseResult.baseFee);
      setPerKmFee(perKmResult.perKmFee);
      Alert.alert("Saved", "Delivery pricing updated successfully");
    } catch (err) {
      Alert.alert("Error", err instanceof ApiError ? err.message : "Could not update delivery pricing");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />;
  }

  if (error) {
    return <Text style={{ color: colors.error, padding: 20 }}>{error}</Text>;
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Delivery Pricing</Text>
      <Text style={styles.cardSubtitle}>
        Base fee covers the first 1 km. Every extra km (rounded up) adds the per-km fee.
        {"\n"}Example: ₹{baseFee} + 2 extra km × ₹{perKmFee} = ₹{(baseFee ?? 0) + 2 * (perKmFee ?? 0)}
      </Text>
      <View style={{ height: 16 }} />
      <Input label="Base Fee (₹) — covers first 1 km" placeholder="e.g. 20" keyboardType="numeric" value={baseFeeInput} onChangeText={setBaseFeeInput} />
      <View style={{ height: 12 }} />
      <Input label="Per-Km Fee (₹) — for every extra km" placeholder="e.g. 5" keyboardType="numeric" value={perKmFeeInput} onChangeText={setPerKmFeeInput} />
      <View style={{ height: 16 }} />
      <Button label={saving ? "Saving..." : "Save"} onPress={handleSave} loading={saving} />
    </Card>
  );
}

export default function SettingsScreen() {
  return (
    <AppBackground>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.title}>Settings</Text>
        <DeliveryPricingForm />
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, paddingTop: 56, maxWidth: 480 },
  title: { color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.heavy, marginBottom: 20 },
  card: { width: "100%" },
  cardTitle: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  cardSubtitle: { color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 6, lineHeight: 18 },
});