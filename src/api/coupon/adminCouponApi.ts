import { apiRequest } from "../client";
import type { Coupon, CreateCouponRequest } from "./types";

export function getAdminCoupons(token: string) {
  return apiRequest<Coupon[]>("/admin/coupons", { token });
}

export function createCoupon(payload: CreateCouponRequest, token: string) {
  return apiRequest<Coupon>("/admin/coupons", { method: "POST", body: payload, token });
}

export function deactivateCoupon(id: number, token: string) {
  return apiRequest<Coupon>(`/admin/coupons/${id}/deactivate`, { method: "PUT", token });
}