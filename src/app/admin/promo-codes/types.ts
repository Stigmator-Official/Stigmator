export type PromoCodeType = "percentage" | "fixed" | "free_shipping";

export interface PromoCode {
  id: string;
  code: string;
  type: PromoCodeType;
  value: number;
  usageCount: number;
  usageLimit: number | null;
  minOrderAmount: number | null;
  expiryDate: string | null;
  isActive: boolean;
  onePerCustomer: boolean;
  applicableProducts: "all" | string[];
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface CreatePromoCodeInput {
  code: string;
  type: PromoCodeType;
  value: number;
  usageLimit: number | null;
  minOrderAmount: number | null;
  expiryDate: string | null;
  isActive: boolean;
  onePerCustomer: boolean;
  applicableProducts: "all" | string[];
  description?: string;
}

export interface UpdatePromoCodeInput extends Partial<CreatePromoCodeInput> {}

export const promoTypeLabels: Record<PromoCodeType, string> = {
  percentage: "Percentage (%)",
  fixed: "Fixed Amount ($)",
  free_shipping: "Free Shipping",
};

export const promoTypeColors: Record<PromoCodeType, string> = {
  percentage: "bg-[#22d3ee] text-black",
  fixed: "bg-[#4ade80] text-black",
  free_shipping: "bg-[#a78bfa] text-black",
};
