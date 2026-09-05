import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { requestOtp } from "../api/auth";
import { ApiError } from "../api/client";
import { AuthBackground } from "../components/AuthBackground";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Logo } from "../components/Logo";
import { ScreenContainer } from "../components/ScreenContainer";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { useResponsive } from "../theme/useResponsive";

export function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scale } = useResponsive();

  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setError("Enter a valid 10-digit mobile number");
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSendOtp = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await requestOtp(mobileNumber);
      router.push({ pathname: "/(auth)/otp" as any, params: { mobileNumber } });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <ScreenContainer>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <StatusBar barStyle="light-content" />

          <View
            style={[
              styles.container,
              { paddingHorizontal: scale(20), paddingTop: insets.top + scale(6), paddingBottom: insets.bottom + scale(16), justifyContent: "flex-start" },
            ]}
          >
            <View style={[styles.header, { marginBottom: scale(8) }]}>
              <Logo size={scale(300)} />
              <Text style={[styles.title, { fontSize: scale(typography.size.lg), marginTop: scale(-24) }]}>
                PassMart Admin
              </Text>
              <Text style={[styles.subtitle, { fontSize: scale(typography.size.sm), marginTop: scale(2) }]}>
                For platform admins &amp; city partners only
              </Text>
            </View>

            <Card>
              <Input
                label="Mobile Number"
                placeholder="Enter your number"
                keyboardType="phone-pad"
                maxLength={10}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                error={error}
              />

              <View style={{ height: scale(8) }} />

              <Button label="Send OTP" onPress={handleSendOtp} loading={loading} />
            </Card>
          </View>
        </KeyboardAvoidingView>
      </ScreenContainer>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  header: { alignItems: "center" },
  title: { color: colors.textPrimary, fontWeight: typography.weight.heavy },
  subtitle: { color: colors.textSecondary, textAlign: "center" },
});