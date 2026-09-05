import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { requestOtp, verifyOtp } from "../api/auth";
import { ApiError } from "../api/client";
import { AuthBackground } from "../components/AuthBackground";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { OtpInput } from "../components/OtpInput";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAdminAuth } from "../context/AdminAuthContext";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { useResponsive } from "../theme/useResponsive";

const RESEND_WAIT_SECONDS = 30;
const ALLOWED_ROLES = ["ADMIN", "TENANT_ADMIN"];

export function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scale } = useResponsive();
  const { login } = useAdminAuth();
  const { mobileNumber } = useLocalSearchParams<{ mobileNumber: string }>();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_WAIT_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formattedTimer = `00:${secondsLeft.toString().padStart(2, "0")}`;

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const auth = await verifyOtp(mobileNumber, code);

      if (!ALLOWED_ROLES.includes(auth.role)) {
        setError("This account is not an admin account. This app is for platform admins and city partners only.");
        setLoading(false);
        return;
      }

      await login(auth);
      router.replace("/(tabs)/dashboard" as any);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    try {
      await requestOtp(mobileNumber);
      setSecondsLeft(RESEND_WAIT_SECONDS);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not resend OTP. Please try again.";
      setError(message);
    }
  };

  return (
    <AuthBackground>
      <ScreenContainer>
        <StatusBar barStyle="light-content" />

        <View
          style={[
            styles.container,
            { paddingHorizontal: scale(20), paddingTop: insets.top + scale(16), paddingBottom: insets.bottom + scale(16) },
          ]}
        >
          <Card>
            <View style={[styles.header, { marginBottom: scale(20) }]}>
              <Text style={[styles.title, { fontSize: scale(typography.size.lg), marginBottom: scale(8) }]}>
                Verify Your Number
              </Text>
              <Text style={[styles.subtitle, { fontSize: scale(typography.size.sm) }]}>
                Enter the 6 digit code sent to{"\n"}
                <Text style={{ color: colors.textPrimary, fontWeight: typography.weight.bold }}>
                  {mobileNumber}
                </Text>
              </Text>
            </View>

            <OtpInput value={code} onChange={setCode} error={!!error} />
            {error ? (
              <Text style={{ color: colors.error, fontSize: scale(typography.size.sm), marginTop: -12, marginBottom: scale(12) }}>
                {error}
              </Text>
            ) : null}

            <Button label="Verify & Continue" onPress={handleVerify} loading={loading} />

            <View style={[styles.resendRow, { marginTop: scale(16) }]}>
              {secondsLeft > 0 ? (
                <Text style={{ color: colors.textMuted, fontSize: scale(typography.size.sm) }}>
                  Resend code in {formattedTimer}
                </Text>
              ) : (
                <Pressable onPress={handleResend}>
                  <Text style={{ color: colors.textSecondary, fontSize: scale(typography.size.sm) }}>
                    Didn't receive code?{" "}
                    <Text style={{ color: colors.primary, fontWeight: typography.weight.bold }}>Resend OTP</Text>
                  </Text>
                </Pressable>
              )}
            </View>
          </Card>
        </View>
      </ScreenContainer>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  header: {},
  title: { color: colors.textPrimary, fontWeight: typography.weight.heavy },
  subtitle: { color: colors.textSecondary, lineHeight: 20 },
  resendRow: { alignItems: "center" },
});