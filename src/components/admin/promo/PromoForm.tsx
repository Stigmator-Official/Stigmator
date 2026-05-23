"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Ticket,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Users,
  ShoppingBag,
  Shuffle,
  AlertCircle,
  Check,
  Info,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PromoCode, PromoCodeType, CreatePromoCodeInput } from "@/app/admin/promo-codes/types";
import { cn } from "@/lib/utils";

interface PromoFormProps {
  initialData?: PromoCode;
  onSubmit: (data: CreatePromoCodeInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  code?: string;
  value?: string;
  usageLimit?: string;
  minOrderAmount?: string;
}

export function PromoForm({ initialData, onSubmit, onCancel, isLoading }: PromoFormProps) {
  const [formData, setFormData] = useState<CreatePromoCodeInput>({
    code: "",
    type: "percentage",
    value: 10,
    usageLimit: null,
    minOrderAmount: null,
    expiryDate: null,
    isActive: true,
    onePerCustomer: false,
    applicableProducts: "all",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewOrderTotal, setPreviewOrderTotal] = useState(100);

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code,
        type: initialData.type,
        value: initialData.value,
        usageLimit: initialData.usageLimit,
        minOrderAmount: initialData.minOrderAmount,
        expiryDate: initialData.expiryDate,
        isActive: initialData.isActive,
        onePerCustomer: initialData.onePerCustomer,
        applicableProducts: initialData.applicableProducts,
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code: result }));
    if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code || formData.code.trim().length < 3) {
      newErrors.code = "Code must be at least 3 characters";
    }

    if (formData.type !== "free_shipping") {
      if (typeof formData.value !== "number" || formData.value < 0) {
        newErrors.value = "Value must be a positive number";
      } else if (formData.type === "percentage" && formData.value > 100) {
        newErrors.value = "Percentage cannot exceed 100%";
      }
    }

    if (formData.usageLimit !== null && formData.usageLimit < 1) {
      newErrors.usageLimit = "Usage limit must be at least 1";
    }

    if (formData.minOrderAmount !== null && formData.minOrderAmount < 0) {
      newErrors.minOrderAmount = "Minimum order amount cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const calculateDiscount = () => {
    if (formData.type === "free_shipping") return { discount: 0, final: previewOrderTotal };
    
    let discount = 0;
    if (formData.type === "percentage") {
      discount = (previewOrderTotal * formData.value) / 100;
    } else if (formData.type === "fixed") {
      discount = formData.value;
    }
    
    // Don't discount more than the order total
    discount = Math.min(discount, previewOrderTotal);
    
    return {
      discount,
      final: previewOrderTotal - discount,
    };
  };

  const preview = calculateDiscount();
  const isValidForOrder = !formData.minOrderAmount || previewOrderTotal >= formData.minOrderAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Code Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#e8f5e8]">
          Promo Code <span className="text-[#dc2626]">*</span>
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8e6b]" />
            <input
              type="text"
              value={formData.code}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }));
                if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
              }}
              placeholder="Enter code (e.g., SUMMER25)"
              className={cn(
                "w-full h-10 pl-10 pr-4 bg-[#050805] border text-[#e8f5e8] text-sm font-mono tracking-wider uppercase",
                "placeholder:text-[#6b8e6b] placeholder:normal-case placeholder:tracking-normal",
                "focus:border-[#4ade80] focus:outline-none transition-colors",
                errors.code ? "border-[#dc2626]" : "border-[#1a2e1a]"
              )}
              maxLength={20}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={generateRandomCode}
            className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Random
          </Button>
        </div>
        {errors.code && (
          <p className="text-xs text-[#dc2626] flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.code}
          </p>
        )}
      </div>

      {/* Type and Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#e8f5e8]">Type</label>
          <Select
            value={formData.type}
            onValueChange={(value: string) =>
              setFormData((prev) => ({
                ...prev,
                type: value as PromoCodeType,
                value: value === "free_shipping" ? 0 : prev.value || 10,
              }))
            }
          >
            <SelectTrigger className="rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">
                <span className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Percentage (%)
                </span>
              </SelectItem>
              <SelectItem value="fixed">
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Fixed Amount ($)
                </span>
              </SelectItem>
              <SelectItem value="free_shipping">
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Free Shipping
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.type !== "free_shipping" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#e8f5e8]">
              {formData.type === "percentage" ? "Percentage (%)" : "Amount ($)"}
            </label>
            <div className="relative">
              {formData.type === "percentage" ? (
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8e6b]" />
              ) : (
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8e6b]" />
              )}
              <input
                type="number"
                value={formData.value}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, value: parseFloat(e.target.value) || 0 }));
                  if (errors.value) setErrors((prev) => ({ ...prev, value: undefined }));
                }}
                min={0}
                max={formData.type === "percentage" ? 100 : undefined}
                step={formData.type === "percentage" ? 1 : 0.01}
                className={cn(
                  "w-full h-10 pl-10 pr-4 bg-[#050805] border text-[#e8f5e8] text-sm",
                  "focus:border-[#4ade80] focus:outline-none transition-colors",
                  errors.value ? "border-[#dc2626]" : "border-[#1a2e1a]"
                )}
              />
            </div>
            {errors.value && (
              <p className="text-xs text-[#dc2626] flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.value}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#e8f5e8]">Usage Limit</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8e6b]" />
            <input
              type="number"
              value={formData.usageLimit ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  usageLimit: value === "" ? null : parseInt(value),
                }));
                if (errors.usageLimit) setErrors((prev) => ({ ...prev, usageLimit: undefined }));
              }}
              placeholder="Unlimited"
              min={1}
              className={cn(
                "w-full h-10 pl-10 pr-4 bg-[#050805] border text-[#e8f5e8] text-sm",
                "focus:border-[#4ade80] focus:outline-none transition-colors",
                errors.usageLimit ? "border-[#dc2626]" : "border-[#1a2e1a]"
              )}
            />
          </div>
          <p className="text-xs text-[#6b8e6b]">Leave empty for unlimited usage</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#e8f5e8]">Min Order Amount ($)</label>
          <div className="relative">
            <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8e6b]" />
            <input
              type="number"
              value={formData.minOrderAmount ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  minOrderAmount: value === "" ? null : parseFloat(value),
                }));
                if (errors.minOrderAmount) setErrors((prev) => ({ ...prev, minOrderAmount: undefined }));
              }}
              placeholder="No minimum"
              min={0}
              step={0.01}
              className={cn(
                "w-full h-10 pl-10 pr-4 bg-[#050805] border text-[#e8f5e8] text-sm",
                "focus:border-[#4ade80] focus:outline-none transition-colors",
                errors.minOrderAmount ? "border-[#dc2626]" : "border-[#1a2e1a]"
              )}
            />
          </div>
        </div>
      </div>

      {/* Expiry Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#e8f5e8]">Expiry Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8e6b]" />
          <input
            type="date"
            value={formData.expiryDate || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                expiryDate: e.target.value || null,
              }))
            }
            min={new Date().toISOString().split("T")[0]}
            className="w-full h-10 pl-10 pr-4 bg-[#050805] border border-[#1a2e1a] text-[#e8f5e8] text-sm focus:border-[#4ade80] focus:outline-none transition-colors"
          />
        </div>
        <p className="text-xs text-[#6b8e6b]">Leave empty for no expiry</p>
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between p-3 border border-[#1a2e1a] bg-[#050805]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1a2e1a] flex items-center justify-center">
              <Power className="w-4 h-4 text-[#4ade80]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#e8f5e8]">Active</p>
              <p className="text-xs text-[#6b8e6b]">Code can be used immediately</p>
            </div>
          </div>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isActive: checked }))
            }
          />
        </div>

        <div className="flex items-center justify-between p-3 border border-[#1a2e1a] bg-[#050805]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1a2e1a] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#a78bfa]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#e8f5e8]">One Per Customer</p>
              <p className="text-xs text-[#6b8e6b]">Limit to one use per customer</p>
            </div>
          </div>
          <Switch
            checked={formData.onePerCustomer}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, onePerCustomer: checked }))
            }
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#e8f5e8]">Description</label>
        <textarea
          value={formData.description || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Internal notes about this promo code..."
          rows={3}
          className="w-full px-3 py-2 bg-[#050805] border border-[#1a2e1a] text-[#e8f5e8] text-sm placeholder:text-[#6b8e6b] focus:border-[#4ade80] focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Preview */}
      <Card className="bg-[#050805] border-[#1a2e1a] rounded-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-[#4ade80]" />
            <h4 className="font-medium text-[#e8f5e8]">Discount Preview</h4>
          </div>

          {/* Order Total Slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#6b8e6b]">Order Total</span>
              <span className="font-mono text-[#e8f5e8]">${previewOrderTotal}</span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={previewOrderTotal}
              onChange={(e) => setPreviewOrderTotal(parseInt(e.target.value))}
              className="w-full h-2 bg-[#1a2e1a] appearance-none cursor-pointer accent-[#4ade80]"
            />
          </div>

          {/* Preview Calculation */}
          <div className="space-y-2 p-3 border border-[#1a2e1a] bg-[#0a0f0a]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6b8e6b]">Subtotal</span>
              <span className="font-mono text-[#e8f5e8]">${previewOrderTotal.toFixed(2)}</span>
            </div>
            
            {formData.minOrderAmount && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b8e6b]">Minimum Required</span>
                <span className={cn(
                  "font-mono",
                  isValidForOrder ? "text-[#4ade80]" : "text-[#dc2626]"
                )}>
                  ${formData.minOrderAmount}
                  {!isValidForOrder && " (not met)"}
                </span>
              </div>
            )}

            {formData.type === "free_shipping" ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#4ade80]">Shipping</span>
                <span className="font-mono text-[#4ade80]">FREE</span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#4ade80]">Discount</span>
                <span className="font-mono text-[#4ade80]">
                  -${preview.discount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="border-t border-[#1a2e1a] pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#e8f5e8]">Total</span>
                <span className={cn(
                  "font-mono font-bold text-lg",
                  isValidForOrder ? "text-[#4ade80]" : "text-[#6b8e6b]"
                )}>
                  ${isValidForOrder ? preview.final.toFixed(2) : previewOrderTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {!isValidForOrder && (
            <p className="text-xs text-[#dc2626] mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Order does not meet minimum amount requirement
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1a2e1a]">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-black rounded-none"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              {initialData ? "Update Code" : "Create Code"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default PromoForm;
