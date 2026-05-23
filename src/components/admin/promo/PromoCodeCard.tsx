"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Ticket,
  Copy,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Users,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PromoCode, promoTypeLabels, promoTypeColors } from "@/app/admin/promo-codes/types";
import { cn } from "@/lib/utils";

interface PromoCodeCardProps {
  promoCode: PromoCode;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onCopy: (code: string) => void;
}

export function PromoCodeCard({
  promoCode,
  onToggleActive,
  onDelete,
  onCopy,
}: PromoCodeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isExpired = promoCode.expiryDate && new Date(promoCode.expiryDate) < new Date();
  const usagePercentage = promoCode.usageLimit
    ? Math.round((promoCode.usageCount / promoCode.usageLimit) * 100)
    : null;

  const getTypeIcon = () => {
    switch (promoCode.type) {
      case "percentage":
        return <Percent className="w-4 h-4" />;
      case "fixed":
        return <DollarSign className="w-4 h-4" />;
      case "free_shipping":
        return <Truck className="w-4 h-4" />;
    }
  };

  const getValueDisplay = () => {
    switch (promoCode.type) {
      case "percentage":
        return `${promoCode.value}%`;
      case "fixed":
        return `$${promoCode.value}`;
      case "free_shipping":
        return "FREE";
    }
  };

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
      return;
    }
    setIsDeleting(true);
    onDelete(promoCode.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden",
          "hover:border-[#4ade80]/30 transition-colors duration-200",
          !promoCode.isActive && "opacity-75 border-[#1a2e1a]/50"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#1a2e1a]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "w-10 h-10 flex items-center justify-center flex-shrink-0",
                  promoTypeColors[promoCode.type]
                )}
              >
                {getTypeIcon()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-bold text-lg text-[#e8f5e8] tracking-wider">
                    {promoCode.code}
                  </h3>
                  <button
                    onClick={() => onCopy(promoCode.code)}
                    className="p-1 text-[#6b8e6b] hover:text-[#4ade80] transition-colors"
                    title="Copy code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-[#6b8e6b] truncate">
                  {promoCode.description || promoTypeLabels[promoCode.type]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  promoCode.isActive
                    ? "text-[#4ade80] hover:text-[#dc2626] hover:bg-[#dc2626]/10"
                    : "text-[#6b8e6b] hover:text-[#4ade80] hover:bg-[#4ade80]/10"
                )}
                onClick={() => onToggleActive(promoCode.id, !promoCode.isActive)}
                title={promoCode.isActive ? "Deactivate" : "Activate"}
              >
                {promoCode.isActive ? (
                  <Power className="w-4 h-4" />
                ) : (
                  <PowerOff className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Value Display */}
        <CardContent className="p-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[#6b8e6b] uppercase tracking-wider font-mono">Discount</p>
              <p className="text-2xl font-black text-[#4ade80]">{getValueDisplay()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#6b8e6b] uppercase tracking-wider font-mono">Status</p>
              <Badge
                className={cn(
                  "rounded-none text-xs font-mono mt-1",
                  promoCode.isActive && !isExpired
                    ? "bg-[#4ade80] text-black"
                    : isExpired
                    ? "bg-[#6b8e6b] text-black"
                    : "bg-[#dc2626] text-white"
                )}
              >
                {isExpired ? "EXPIRED" : promoCode.isActive ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </div>
          </div>

          {/* Usage Progress */}
          {promoCode.usageLimit && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#6b8e6b]">Usage</span>
                <span className="text-[#e8f5e8] font-mono">
                  {promoCode.usageCount} / {promoCode.usageLimit}
                </span>
              </div>
              <div className="h-2 bg-[#1a2e1a] rounded-none overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(usagePercentage || 0, 100)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "h-full",
                    (usagePercentage || 0) >= 90
                      ? "bg-[#dc2626]"
                      : (usagePercentage || 0) >= 70
                      ? "bg-[#fbbf24]"
                      : "bg-[#4ade80]"
                  )}
                />
              </div>
              <p className="text-xs text-[#6b8e6b] mt-1">
                {usagePercentage}% used
                {(usagePercentage || 0) >= 90 && (
                  <span className="text-[#dc2626] ml-1">- Almost depleted</span>
                )}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-2 text-xs">
            {promoCode.minOrderAmount && (
              <div className="flex items-center gap-2 text-[#6b8e6b]">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Min order: ${promoCode.minOrderAmount}</span>
              </div>
            )}
            {promoCode.expiryDate && (
              <div className="flex items-center gap-2 text-[#6b8e6b]">
                <Calendar className="w-3.5 h-3.5" />
                <span className={isExpired ? "text-[#dc2626]" : ""}>
                  {isExpired ? "Expired" : "Expires"}: {new Date(promoCode.expiryDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[#6b8e6b]">
              <Users className="w-3.5 h-3.5" />
              <span>
                {promoCode.usageCount} uses
                {promoCode.onePerCustomer && " (1 per customer)"}
              </span>
            </div>
          </div>
        </CardContent>

        {/* Actions */}
        <div className="px-4 pb-4 flex items-center gap-2">
          <Link href={`/admin/promo-codes/${promoCode.id}/edit`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "border-[#1a2e1a] rounded-none",
              showDeleteConfirm
                ? "bg-[#dc2626] text-white hover:bg-[#dc2626]/90"
                : "text-[#6b8e6b] hover:text-[#dc2626] hover:bg-[#dc2626]/10"
            )}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {showDeleteConfirm ? "Confirm" : "Delete"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export default PromoCodeCard;
