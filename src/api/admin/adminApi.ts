import { apiRequest } from "../client";
import type { AdminOrder, AdminUser, DashboardStats, Shop, ShopRejectRequest } from "./types";

export function getPendingShops(token: string) {
  return apiRequest<Shop[]>("/admin/shops/pending", { token });
}

export function getAllShops(token: string) {
  return apiRequest<Shop[]>("/admin/shops", { token });
}

export function approveShop(id: number, token: string) {
  return apiRequest<Shop>(`/admin/shops/${id}/approve`, { method: "PUT", token });
}

export function rejectShop(id: number, payload: ShopRejectRequest, token: string) {
  return apiRequest<Shop>(`/admin/shops/${id}/reject`, { method: "PUT", body: payload, token });
}

export function suspendShop(id: number, payload: ShopRejectRequest, token: string) {
  return apiRequest<Shop>(`/admin/shops/${id}/suspend`, { method: "PUT", body: payload, token });
}

export function getAllUsers(token: string) {
  return apiRequest<AdminUser[]>("/admin/users", { token });
}

export function blockUser(id: number, token: string) {
  return apiRequest<AdminUser>(`/admin/users/${id}/block`, { method: "PUT", token });
}

export function unblockUser(id: number, token: string) {
  return apiRequest<AdminUser>(`/admin/users/${id}/unblock`, { method: "PUT", token });
}

export function getAllOrders(token: string) {
  return apiRequest<AdminOrder[]>("/admin/orders", { token });
}

export function getDashboardStats(token: string) {
  return apiRequest<DashboardStats>("/admin/dashboard", { token });
}

export function getDeliveryPricing(token: string) {
  return apiRequest<{ baseFee: number; perKmFee: number }>("/settings/delivery-fee", { token });
}

export function updateDeliveryBaseFee(baseFee: number, token: string) {
  return apiRequest<{ baseFee: number }>("/admin/settings/delivery-fee", {
    method: "PUT",
    body: { baseFee },
    token,
  });
}

export function updateDeliveryPerKmFee(perKmFee: number, token: string) {
  return apiRequest<{ perKmFee: number }>("/admin/settings/delivery-per-km-fee", {
    method: "PUT",
    body: { perKmFee },
    token,
  });
}