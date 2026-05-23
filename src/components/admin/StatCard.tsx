"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "error" | "info";
  showSparkline?: boolean;
  sparklineData?: number[];
  className?: string;
  loading?: boolean;
  onClick?: () => void;
}

const variantStyles = {
  default: {
    iconBg: "bg-[#1a2e1a]",
    iconColor: "text-[#6b8e6b]",
    accent: "#6b8e6b",
  },
  success: {
    iconBg: "bg-[#4ade80]/10",
    iconColor: "text-[#4ade80]",
    accent: "#4ade80",
  },
  warning: {
    iconBg: "bg-[#fbbf24]/10",
    iconColor: "text-[#fbbf24]",
    accent: "#fbbf24",
  },
  error: {
    iconBg: "bg-[#dc2626]/10",
    iconColor: "text-[#dc2626]",
    accent: "#dc2626",
  },
  info: {
    iconBg: "bg-[#60a5fa]/10",
    iconColor: "text-[#60a5fa]",
    accent: "#60a5fa",
  },
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 30;
  const padding = 2;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((value - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-8"
      preserveAspectRatio="none"
    >
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-60"
      />
      <defs>
        <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathD} L ${width - padding},${height} L ${padding},${height} Z`}
        fill={`url(#gradient-${color.replace("#", "")})`}
        stroke="none"
      />
    </svg>
  );
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon: Icon,
  variant = "default",
  showSparkline = false,
  sparklineData,
  className,
  loading = false,
  onClick,
}: StatCardProps) {
  const styles = variantStyles[variant];
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  const changeColor = isPositive
    ? "text-[#4ade80]"
    : isNegative
    ? "text-[#dc2626]"
    : "text-[#6b8e6b]";

  const ChangeIcon = isPositive
    ? TrendingUp
    : isNegative
    ? TrendingDown
    : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-[#0a0f0a] border border-[#1a2e1a] p-6",
        "hover:border-[#1a2e1a] hover:bg-[#0f1a0f]",
        "transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-lg hover:shadow-black/20",
        className
      )}
      onClick={onClick}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-[#1a2e1a] animate-pulse" />
            <div className="w-16 h-4 bg-[#1a2e1a] animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="w-24 h-8 bg-[#1a2e1a] animate-pulse" />
            <div className="w-32 h-4 bg-[#1a2e1a] animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={cn("p-2.5", styles.iconBg)}>
              <Icon className={cn("w-5 h-5", styles.iconColor)} />
            </div>
            {change !== undefined && (
              <div className={cn("flex items-center gap-1 text-sm", changeColor)}>
                <ChangeIcon className="w-4 h-4" />
                <span className="font-mono font-bold">
                  {isPositive ? "+" : ""}
                  {change}%
                </span>
              </div>
            )}
          </div>

          {/* Value */}
          <div className="space-y-1">
            <h3 className="text-3xl font-black tracking-tighter text-[#e8f5e8]">
              {value}
            </h3>
            <p className="text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
              {title}
            </p>
          </div>

          {/* Change Label */}
          {change !== undefined && (
            <p className="text-xs text-[#6b8e6b] mt-2">{changeLabel}</p>
          )}

          {/* Sparkline */}
          {showSparkline && sparklineData && (
            <div className="mt-4 -mx-2">
              <Sparkline data={sparklineData} color={styles.accent} />
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

// Compact variant for dense layouts
export function StatCardCompact({
  title,
  value,
  change,
  icon: Icon,
  variant = "default",
  className,
  loading = false,
}: Omit<StatCardProps, "showSparkline" | "sparklineData" | "changeLabel">) {
  const styles = variantStyles[variant];
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const changeColor = isPositive
    ? "text-[#4ade80]"
    : isNegative
    ? "text-[#dc2626]"
    : "text-[#6b8e6b]";

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 bg-[#0a0f0a] border border-[#1a2e1a]",
        "hover:border-[#1a2e1a] hover:bg-[#0f1a0f] transition-all duration-200",
        className
      )}
    >
      {loading ? (
        <>
          <div className="w-10 h-10 bg-[#1a2e1a] animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-20 h-4 bg-[#1a2e1a] animate-pulse" />
            <div className="w-12 h-6 bg-[#1a2e1a] animate-pulse" />
          </div>
        </>
      ) : (
        <>
          <div className={cn("p-2.5 flex-shrink-0", styles.iconBg)}>
            <Icon className={cn("w-5 h-5", styles.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-[#6b8e6b] uppercase tracking-wider truncate">
              {title}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-[#e8f5e8]">{value}</span>
              {change !== undefined && (
                <span className={cn("text-xs font-mono", changeColor)}>
                  {isPositive ? "+" : ""}
                  {change}%
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StatCard;
