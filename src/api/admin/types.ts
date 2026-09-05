export type Shop = {
  id: number;
  sellerId: number;
  shopName: string;
  category: "CLOTHING" | "FOOD" | "GENERAL" | "MULTI";
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  storeSlug: string;
  rejectionReason: string | null;
  documentsUrl: string | null;
  tenantId: number;
  createdAt: string;
};

export type AdminUser = {
  id: number;
  name: string;
  phone: string;
  role: "CUSTOMER" | "SELLER" | "DELIVERY" | "ADMIN" | "SUPPORT_AGENT" | "TENANT_ADMIN";
  status: "ACTIVE" | "BANNED";
  tenantId: number;
  walletBalance: number;
  createdAt: string;
};

export type AdminOrder = {
  id: number;
  customerId: number;
  shopId: number;
  deliveryBoyId: number | null;
  status: string;
  paymentMode: "COD" | "ONLINE";
  totalAmount: number;
  deliveryFee: number;
  deliveryAddress: string;
  otp: string;
  tenantId: number;
  createdAt: string;
  deliveredAt: string | null;
};

export type DashboardStats = {
  totalUsers: number;
  totalCustomers: number;
  totalSellers: number;
  totalDeliveryBoys: number;
  pendingShops: number;
  approvedShops: number;
  totalOrders: number;
  ordersToday: number;
  totalRevenue: number;
};

export type ShopRejectRequest = { reason: string };