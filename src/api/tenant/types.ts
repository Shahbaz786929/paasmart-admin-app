export type Tenant = {
  id: number;
  slug: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
};

export type CreateTenantRequest = { slug: string; name: string };
export type CreateTenantAdminRequest = { name: string; phone: string };
export type TenantAdminUser = { id: number; name: string; phone: string; role: string };