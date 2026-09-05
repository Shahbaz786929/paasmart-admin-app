import { apiRequest } from "../client";
import type { CreateTenantAdminRequest, CreateTenantRequest, Tenant, TenantAdminUser } from "./types";

export function getAllTenants(token: string) {
  return apiRequest<Tenant[]>("/super-admin/tenants", { token });
}

export function createTenant(payload: CreateTenantRequest, token: string) {
  return apiRequest<Tenant>("/super-admin/tenants", { method: "POST", body: payload, token });
}

export function suspendTenant(id: number, token: string) {
  return apiRequest<Tenant>(`/super-admin/tenants/${id}/suspend`, { method: "PUT", token });
}

export function activateTenant(id: number, token: string) {
  return apiRequest<Tenant>(`/super-admin/tenants/${id}/activate`, { method: "PUT", token });
}

export function createTenantAdmin(tenantId: number, payload: CreateTenantAdminRequest, token: string) {
  return apiRequest<TenantAdminUser>(`/super-admin/tenants/${tenantId}/admin`, {
    method: "POST",
    body: payload,
    token,
  });
}