import { apiRequest } from "./client";

export type RegisterPayload = {
  name: string;
  phone: string;
  tenantSlug?: string;
  referralCode?: string;
  role: "CUSTOMER" | "SELLER" | "DELIVERY" | "ADMIN" | "SUPPORT_AGENT" | "TENANT_ADMIN";
};

export type AuthResponse = {
  token: string;
  userId: number;
  name: string;
  role: string;
};

// POST /api/v1/auth/register — creates the account (does NOT send an OTP by itself)
export function registerUser(payload: RegisterPayload): Promise<string> {
  return apiRequest<string>("/auth/register", { method: "POST", body: payload });
}

// POST /api/v1/auth/login-otp — triggers OTP generation, used for both
// "Login" and right after a successful Register.
export function requestOtp(phone: string): Promise<string> {
  return apiRequest<string>("/auth/login-otp", { method: "POST", body: { phone } });
}

// POST /api/v1/auth/verify-otp — verifies the code and returns the JWT + user info
export function verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/verify-otp", { method: "POST", body: { phone, otp } });
}