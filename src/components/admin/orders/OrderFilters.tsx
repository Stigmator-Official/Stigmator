"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  X,
  Calendar,
  DollarSign,
  User,
  Package,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import type { OrderStatus } from "@/lib/api/orders";

export interface OrderFilters {
  search: string;
  status: OrderStatus[];
  dateFrom: string;
  dateTo: string;
  minAmount: number | null;
  maxAmount: number | null;
  customer: string;
}

interface OrderFiltersProps {
  filters: OrderFilters;
  onChange: (filters: OrderFilters) => void;
  onReset: () => void;
  className?: string;
}

const allStatuses: OrderStatus[] = [
  "pending_payment",
  "payment_failed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  payment_failed: "Payment Failed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const statusColors: Record<OrderStatus, string> = {
  pending_payment: "#fbbf24",
  payment_failed: "#dc2626",
  confirmed: "#60a5fa",
  processing: "#a78bfa",
  shipped: "#4ade80",
  delivered: "#22c55e",
  cancelled: "#6b7280",
  refunded: "#f97316",
};

export function OrderFiltersPanel({
  filters,
  onChange,
  onReset,
  className,
}: OrderFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount = [
    filters.search,
    filters.status.length > 0,
    filters.dateFrom,
    filters.dateTo,
    filters.minAmount !== null,
    filters.maxAmount !== null,
    filters.customer,
  ].filter(Boolean).length;

  const toggleStatus = (status: OrderStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onChange({ ...filters, status: newStatus });
  };

  const presetDateRanges = [
    { label: "Today", days: 0 },
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
  ];

  const applyDatePreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    
    onChange({
      ...filters,
      dateFrom: from.toISOString().split("T")[0],
      dateTo: to.toISOString().split("T")[0],
    });
  };

  const presetAmountRanges = [
    { label: "Under $50", min: 0, max: 50 },
    { label: "$50 - $100", min: 50, max: 100 },
    { label: "$100 - $250", min: 100, max: 250 },
    { label: "$250+", min: 250, max: null },
  ];

  const applyAmountPreset = (min: number, max: number | null) => {
    onChange({
      ...filters,
      minAmount: min,
      maxAmount: max,
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
          <Input
            placeholder="Search orders by ID, customer, or items..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-10 bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] placeholder:text-[#6b8e6b]/50 focus:border-[#4ade80]"
          />
        </div>

        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] min-w-[140px]",
            isExpanded && "bg-[#1a2e1a] text-[#e8f5e8]",
            activeFiltersCount > 0 && "border-[#4ade80]/50 text-[#4ade80]"
          )}
        >
          <Filter className="mr-2 h-4 w-4" />
          FILTERS
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-[#4ade80] text-black rounded-none text-[10px]">
              {activeFiltersCount}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              "ml-2 h-4 w-4 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </Button>

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={onReset}
            className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            RESET
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[#050805] border border-[#1a2e1a] space-y-6">
              {/* Status Filter */}
              <div>
                <label className="text-xs font-mono text-[#6b8e6b] tracking-wider mb-3 block">
                  ORDER STATUS
                </label>
                <div className="flex flex-wrap gap-2">
                  {allStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-mono border transition-all duration-200",
                        filters.status.includes(status)
                          ? "bg-[#1a2e1a] border-[#4ade80]/50 text-[#e8f5e8]"
                          : "bg-transparent border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]/30"
                      )}
                      style={{
                        borderLeftColor: filters.status.includes(status) ? statusColors[status] : undefined,
                        borderLeftWidth: filters.status.includes(status) ? "3px" : "1px",
                      }}
                    >
                      {statusLabels[status].toUpperCase()}
                    </button>
                  ))}
                </div>
                {filters.status.length > 0 && (
                  <button
                    onClick={() => onChange({ ...filters, status: [] })}
                    className="text-xs text-[#6b8e6b] hover:text-[#4ade80] mt-2 underline"
                  >
                    Clear status filters
                  </button>
                )}
              </div>

              {/* Date Range */}
              <div>
                <label className="text-xs font-mono text-[#6b8e6b] tracking-wider mb-3 block">
                  DATE RANGE
                </label>
                
                {/* Date Presets */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {presetDateRanges.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => applyDatePreset(preset.days)}
                      className="px-3 py-1 text-xs font-mono bg-[#0a0f0a] border border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]/30 hover:text-[#e8f5e8] transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                      className="pl-10 bg-[#0a0f0a] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80]"
                    />
                  </div>
                  <span className="text-[#6b8e6b] font-mono">TO</span>
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                      className="pl-10 bg-[#0a0f0a] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80]"
                    />
                  </div>
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <label className="text-xs font-mono text-[#6b8e6b] tracking-wider mb-3 block">
                  AMOUNT RANGE
                </label>
                
                {/* Amount Presets */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {presetAmountRanges.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => applyAmountPreset(preset.min, preset.max)}
                      className={cn(
                        "px-3 py-1 text-xs font-mono border transition-colors",
                        filters.minAmount === preset.min && filters.maxAmount === preset.max
                          ? "bg-[#4ade80]/10 border-[#4ade80]/50 text-[#4ade80]"
                          : "bg-[#0a0f0a] border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]/30 hover:text-[#e8f5e8]"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minAmount ?? ""}
                      onChange={(e) => onChange({
                        ...filters,
                        minAmount: e.target.value ? parseFloat(e.target.value) : null,
                      })}
                      className="pl-10 bg-[#0a0f0a] border-[#1a2e1a] rounded-none text-[#e8f5e8] placeholder:text-[#6b8e6b]/50 focus:border-[#4ade80]"
                    />
                  </div>
                  <span className="text-[#6b8e6b] font-mono">TO</span>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxAmount ?? ""}
                      onChange={(e) => onChange({
                        ...filters,
                        maxAmount: e.target.value ? parseFloat(e.target.value) : null,
                      })}
                      className="pl-10 bg-[#0a0f0a] border-[#1a2e1a] rounded-none text-[#e8f5e8] placeholder:text-[#6b8e6b]/50 focus:border-[#4ade80]"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Filter */}
              <div>
                <label className="text-xs font-mono text-[#6b8e6b] tracking-wider mb-3 block">
                  CUSTOMER
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                  <Input
                    placeholder="Search by customer name or email..."
                    value={filters.customer}
                    onChange={(e) => onChange({ ...filters, customer: e.target.value })}
                    className="pl-10 bg-[#0a0f0a] border-[#1a2e1a] rounded-none text-[#e8f5e8] placeholder:text-[#6b8e6b]/50 focus:border-[#4ade80]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Tags */}
      {activeFiltersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-xs font-mono text-[#6b8e6b]">ACTIVE:</span>
          
          {filters.search && (
            <FilterTag
              label={`Search: "${filters.search}"`}
              onRemove={() => onChange({ ...filters, search: "" })}
            />
          )}
          
          {filters.status.map((status) => (
            <FilterTag
              key={status}
              label={statusLabels[status]}
              color={statusColors[status]}
              onRemove={() => toggleStatus(status)}
            />
          ))}
          
          {(filters.dateFrom || filters.dateTo) && (
            <FilterTag
              label={`${filters.dateFrom || "..."} to ${filters.dateTo || "..."}`}
              onRemove={() => onChange({ ...filters, dateFrom: "", dateTo: "" })}
            />
          )}
          
          {(filters.minAmount !== null || filters.maxAmount !== null) && (
            <FilterTag
              label={`$${filters.minAmount ?? 0} - $${filters.maxAmount ?? "∞"}`}
              onRemove={() => onChange({ ...filters, minAmount: null, maxAmount: null })}
            />
          )}
          
          {filters.customer && (
            <FilterTag
              label={`Customer: "${filters.customer}"`}
              onRemove={() => onChange({ ...filters, customer: "" })}
            />
          )}
        </motion.div>
      )}
    </div>
  );
}

function FilterTag({
  label,
  onRemove,
  color,
}: {
  label: string;
  onRemove: () => void;
  color?: string;
}) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono bg-[#1a2e1a] text-[#e8f5e8] border border-[#4ade80]/30"
      style={color ? { borderLeftColor: color, borderLeftWidth: "3px" } : undefined}
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-1 text-[#6b8e6b] hover:text-[#dc2626] transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </motion.span>
  );
}
