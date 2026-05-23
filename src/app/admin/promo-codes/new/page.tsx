"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/Breadcrumb";
import { PromoForm } from "@/components/admin/promo/PromoForm";
import { CreatePromoCodeInput } from "@/app/admin/promo-codes/types";

export default function NewPromoCodePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreatePromoCodeInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create promo code");
        setIsLoading(false);
        return;
      }

      // Redirect to promo codes list on success
      router.push("/admin/promo-codes");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/promo-codes");
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/promo-codes">
          <Button
            variant="outline"
            size="icon"
            className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none mt-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <PageHeader
            title="Create Promo Code"
            description="Create a new discount code for your customers."
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626]"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <PromoForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <div className="space-y-4">
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#4ade80]" />
                <h3 className="font-bold text-[#e8f5e8]">Tips</h3>
              </div>
              <ul className="space-y-3 text-sm text-[#6b8e6b]">
                <li className="flex items-start gap-2">
                  <span className="text-[#4ade80] mt-1">•</span>
                  <span>Use short, memorable codes like SUMMER25 or FLASH50</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ade80] mt-1">•</span>
                  <span>Set a usage limit to create urgency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ade80] mt-1">•</span>
                  <span>Minimum order amounts help protect margins</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4ade80] mt-1">•</span>
                  <span>"One per customer" prevents abuse</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <h3 className="font-bold text-[#e8f5e8] mb-4">Discount Types</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-[#22d3ee]" />
                    <span className="text-sm font-medium text-[#e8f5e8]">Percentage</span>
                  </div>
                  <p className="text-xs text-[#6b8e6b] pl-5">
                    Best for: Store-wide sales, seasonal promotions
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-[#4ade80]" />
                    <span className="text-sm font-medium text-[#e8f5e8]">Fixed Amount</span>
                  </div>
                  <p className="text-xs text-[#6b8e6b] pl-5">
                    Best for: Welcome discounts, specific campaigns
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-[#a78bfa]" />
                    <span className="text-sm font-medium text-[#e8f5e8]">Free Shipping</span>
                  </div>
                  <p className="text-xs text-[#6b8e6b] pl-5">
                    Best for: Abandoned cart recovery, high-value orders
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
