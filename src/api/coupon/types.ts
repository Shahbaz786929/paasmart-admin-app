export type Coupon = {
  id: number;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  usageLimitPerUser: number;
  active: boolean;
  tenantId: number;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
};

export type CreateCouponRequest = {
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimitPerUser?: number;
  validFrom?: string;
  validUntil?: string;
};