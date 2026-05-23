"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/api/orders";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  showAnimation?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<OrderStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  pulseColor: string;
  icon: string;
}> = {
  pending_payment: {
    label: "PENDING PAYMENT",
    bgColor: "bg-[#fbbf24]/10",
    textColor: "text-[#fbbf24]",
    borderColor: "border-[#fbbf24]/50",
    pulseColor: "#fbbf24",
    icon: "⏳",
  },
  payment_failed: {
    label: "PAYMENT FAILED",
    bgColor: "bg-[#dc2626]/10",
    textColor: "text-[#dc2626]",
    borderColor: "border-[#dc2626]/50",
    pulseColor: "#dc2626",
    icon: "✕",
  },
  confirmed: {
    label: "CONFIRMED",
    bgColor: "bg-[#60a5fa]/10",
    textColor: "text-[#60a5fa]",
    borderColor: "border-[#60a5fa]/50",
    pulseColor: "#60a5fa",
    icon: "✓",
  },
  processing: {
    label: "PROCESSING",
    bgColor: "bg-[#a78bfa]/10",
    textColor: "text-[#a78bfa]",
    borderColor: "border-[#a78bfa]/50",
    pulseColor: "#a78bfa",
    icon: "⚙",
  },
  shipped: {
    label: "SHIPPED",
    bgColor: "bg-[#4ade80]/10",
    textColor: "text-[#4ade80]",
    borderColor: "border-[#4ade80]/50",
    pulseColor: "#4ade80",
    icon: "🚚",
  },
  delivered: {
    label: "DELIVERED",
    bgColor: "bg-[#22c55e]/20",
    textColor: "text-[#4ade80]",
    borderColor: "border-[#4ade80]/50",
    pulseColor: "#4ade80",
    icon: "📦",
  },
  cancelled: {
    label: "CANCELLED",
    bgColor: "bg-[#6b7280]/10",
    textColor: "text-[#9ca3af]",
    borderColor: "border-[#6b7280]/50",
    pulseColor: "#6b7280",
    icon: "⊘",
  },
  refunded: {
    label: "REFUNDED",
    bgColor: "bg-[#f97316]/10",
    textColor: "text-[#fb923c]",
    borderColor: "border-[#f97316]/50",
    pulseColor: "#f97316",
    icon: "↺",
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
  lg: "px-4 py-1.5 text-sm",
};

export function OrderStatusBadge({
  status,
  className,
  showAnimation = true,
  size = "md",
}: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const isActive = ["pending_payment", "processing", "shipped"].includes(status);

  return (
    <motion.span
      initial={showAnimation ? { opacity: 0, scale: 0.95 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono font-bold tracking-wider border rounded-none relative overflow-hidden",
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeClasses[size],
        className
      )}
    >
      {/* Animated pulse for active statuses */}
      {showAnimation && isActive && (
        <motion.span
          className="absolute inset-0 opacity-30"
          style={{ backgroundColor: config.pulseColor }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      
      <span className="relative z-10">{config.icon}</span>
      <span className="relative z-10">{config.label}</span>
    </motion.span>
  );
}

// Simple dot variant for table use
export function OrderStatusDot({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const config = statusConfig[status];
  const isActive = ["pending_payment", "processing", "shipped"].includes(status);

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <motion.span
        className={cn("w-2 h-2 rounded-full", config.bgColor.replace("/10", ""))}
        animate={isActive ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          backgroundColor: isActive ? config.pulseColor : undefined,
        }}
      />
      <span className={cn("text-xs font-mono", config.textColor)}>
        {config.label}
      </span>
    </span>
  );
}

// Timeline variant for order detail
export function OrderStatusTimeline({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const config = statusConfig[status];
  
  const statusOrder: OrderStatus[] = [
    "pending_payment",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];

  const currentIndex = statusOrder.indexOf(status);
  const isTerminal = ["cancelled", "refunded", "payment_failed"].includes(status);

  if (isTerminal) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("w-10 h-10 flex items-center justify-center border-2", config.borderColor, config.bgColor)}>
          <span className="text-xl">{config.icon}</span>
        </div>
        <div>
          <p className={cn("font-black font-mono tracking-wider", config.textColor)}>
            {config.label}
          </p>
          <p className="text-xs text-[#6b8e6b]">Order is no longer active</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {statusOrder.map((s, index) => {
        const sConfig = statusConfig[s];
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={s} className="flex items-center">
            <motion.div
              className={cn(
                "w-8 h-8 flex items-center justify-center border-2 transition-colors duration-300",
                isCompleted ? sConfig.borderColor : "border-[#1a2e1a]",
                isCompleted ? sConfig.bgColor : "bg-[#050805]",
                isCurrent && "ring-2 ring-offset-1 ring-offset-[#0a0f0a]",
                isCurrent && sConfig.borderColor.replace("/50", "")
              )}
              animate={isCurrent ? {
                scale: [1, 1.05, 1],
              } : {}}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <span className={cn(
                "text-sm",
                isCompleted ? sConfig.textColor : "text-[#1a2e1a]"
              )}>
                {sConfig.icon}
              </span>
            </motion.div>
            {index < statusOrder.length - 1 && (
              <div className={cn(
                "w-4 h-0.5",
                index < currentIndex ? sConfig.bgColor.replace("/10", "") : "bg-[#1a2e1a]"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
