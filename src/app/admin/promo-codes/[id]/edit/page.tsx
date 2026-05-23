"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/Breadcrumb";
import { PromoForm } from "@/components/admin/promo/PromoForm";
import { PromoCode, CreatePromoCodeInput } from "@/app/admin/promo-codes/types";

export default function EditPromoCodePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromoCode = async () => {
      try {
        const response = await fetch(`/api/admin/promo-codes/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to fetch promo code");
          return;
        }

        setPromoCode(data.data);
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromoCode();
  }, [id]);

  const handleSubmit = async (data: CreatePromoCodeInput) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to update promo code");
        setIsSaving(false);
        return;
      }

      // Redirect to promo codes list on success
      router.push("/admin/promo-codes");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/promo-codes");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#4ade80] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error && !promoCode) {
    return (
      <div className="space-y-8">
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
            <PageHeader title="Edit Promo Code" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626] text-center"
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">{error}</h3>
          <p className="text-sm mb-4">The promo code you&apos;re looking for might have been deleted.</p>
          <Link href="/admin/promo-codes">
            <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-black rounded-none">
              Back to Promo Codes
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
            title={`Edit ${promoCode?.code || "Promo Code"}`}
            description="Update the details of this promo code."
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
      {promoCode && (
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none max-w-3xl">
          <CardContent className="p-6">
            <PromoForm
              initialData={promoCode}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSaving}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
