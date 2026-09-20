import { apiRequest } from "./client";

export type AuthResponse = {
  token: string;
  userId: number;
  name: string;
  role: string;
};

export type GoogleConfig = {
  clientId: string;
};

// GET /api/v1/auth/google-config
export function getGoogleConfig(): Promise<GoogleConfig> {
  return apiRequest<GoogleConfig>("/auth/google-config");
}

export type AdminGoogleLoginPayload = {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
};

// POST /api/v1/auth/admin/google — admin-only. Does NOT create a new account;
// only logs in an email that a super admin has already added to the database
// with role ADMIN or TENANT_ADMIN.
export function adminGoogleLogin(payload: AdminGoogleLoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/admin/google", { method: "POST", body: payload });
}

export type AdminEmailLoginPayload = {
  email: string;
  password: string;
};

// POST /api/v1/auth/admin/email-login — admin-only email+password login.
export function adminEmailLogin(payload: AdminEmailLoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/admin/email-login", { method: "POST", body: payload });
}