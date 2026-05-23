"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  UserPlus,
  Package,
  DollarSign,
  CheckCircle,
  Palette,
  ArrowUpRight,
} from "lucide-react";

interface RecentActivityItem {
  id: string;
  type: "order" | "customer" | "product" | "artist" | "payment";
  description: string;
  timestamp: string;
  value?: number;
}

interface RecentActivityProps {
  activities: RecentActivityItem[];
  className?: string;
  maxItems?: number;
}

const activityConfig = {
  order: {
    icon: ShoppingBag,
    color: "#4ade80",
    bgColor: "bg-[#4ade80]/10",
    label: "Order",
  },
  customer: {
    icon: UserPlus,
    color: "#60a5fa",
    bgColor: "bg-[#60a5fa]/10",
    label: "Customer",
  },
  product: {
    icon: Package,
    color: "#fbbf24",
    bgColor: "bg-[#fbbf24]/10",
    label: "Product",
  },
  artist: {
    icon: Palette,
    color: "#a78bfa",
    bgColor: "bg-[#a78bfa]/10",
    label: "Artist",
  },
  payment: {
    icon: DollarSign,
    color: "#4ade80",
    bgColor: "bg-[#4ade80]/10",
    label: "Payment",
  },
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function RecentActivity({ activities, className, maxItems = 10 }: RecentActivityProps) {
  const displayActivities = activities.slice(0, maxItems);
  
  return (
    <div className={cn("bg-[#0a0f0a] border border-[#1a2e1a]", className)}>
      {/* Header */}
      <div className="p-6 border-b border-[#1a2e1a]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight text-[#e8f5e8]">
              Recent Activity
            </h3>
            <p className="text-xs font-mono text-[#6b8e6b] mt-1">
              Latest platform events
            </p>
          </div>
          <div className="p-2 bg-[#fbbf24]/10">
            <CheckCircle className="w-5 h-5 text-[#fbbf24]" />
          </div>
        </div>
      </div>
      
      {/* Activity List */}
      <div className="p-4">
        <div className="space-y-3">
          <AnimatePresence>
            {displayActivities.map((activity, index) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;
              const timeAgo = formatTimeAgo(activity.timestamp);
              const isRecent = index < 3;
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    "flex items-start gap-3 p-3",
                    "border border-[#1a2e1a]",
                    "hover:border-[#4ade80]/30 hover:bg-[#1a2e1a]/20",
                    "transition-all duration-200",
                    isRecent && "bg-[#1a2e1a]/10"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-9 h-9 flex items-center justify-center flex-shrink-0",
                      config.bgColor
                    )}
                  >
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#e8f5e8] leading-tight">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-xs font-mono"
                        style={{ color: config.color }}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs text-[#6b8e6b]">•</span>
                      <span className="text-xs text-[#6b8e6b]">{timeAgo}</span>
                    </div>
                  </div>
                  
                  {/* Value */}
                  {activity.value && (
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-mono font-bold text-[#4ade80]">
                        {formatCurrency(activity.value)}
                      </span>
                    </div>
                  )}
                  
                  {/* New Indicator */}
                  {isRecent && (
                    <span className="w-2 h-2 bg-[#4ade80] animate-pulse flex-shrink-0 mt-1" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* View All Button */}
        <button className="w-full mt-4 py-3 px-4 bg-[#050805] border border-[#1a2e1a] text-[#6b8e6b] text-sm font-mono hover:border-[#4ade80]/50 hover:text-[#e8f5e8] transition-all flex items-center justify-center gap-2">
          View All Activity
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default RecentActivity;
