"use client";

import { useState } from "react";
import { X, Filter, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { CustomerRole, CustomerStatus } from "@/lib/data/customers";

interface FilterState {
  roles: CustomerRole[];
  status: CustomerStatus[];
  dateFrom: string;
  dateTo: string;
  minSpent: string;
  maxSpent: string;
}

interface CustomerFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  className?: string;
}

const ROLE_OPTIONS: { value: CustomerRole; label: string; color: string }[] = [
  { value: "CUSTOMER", label: "Customer", color: "bg-[#6b8e6b]" },
  { value: "ARTIST", label: "Artist", color: "bg-[#60a5fa]" },
  { value: "ADMIN", label: "Admin", color: "bg-[#4ade80]" },
  { value: "SUPER_ADMIN", label: "Super Admin", color: "bg-[#dc2626]" },
  { value: "DEVELOPER", label: "Developer", color: "bg-[#a78bfa]" },
];

const STATUS_OPTIONS: { value: CustomerStatus; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "bg-[#4ade80]" },
  { value: "inactive", label: "Inactive", color: "bg-[#6b8e6b]" },
  { value: "suspended", label: "Suspended", color: "bg-[#dc2626]" },
  { value: "pending", label: "Pending", color: "bg-[#fbbf24]" },
];

export function CustomerFilters({ filters, onChange, onReset, className }: CustomerFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount =
    filters.roles.length +
    filters.status.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (filters.minSpent ? 1 : 0) +
    (filters.maxSpent ? 1 : 0);

  const toggleRole = (role: CustomerRole) => {
    const newRoles = filters.roles.includes(role)
      ? filters.roles.filter(r => r !== role)
      : [...filters.roles, role];
    onChange({ ...filters, roles: newRoles });
  };

  const toggleStatus = (status: CustomerStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onChange({ ...filters, status: newStatus });
  };

  return (
    <Card className={cn("bg-[#0a0f0a] border-[#1a2e1a] rounded-none", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-[#6b8e6b] flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-[#4ade80] text-black text-xs px-1.5 py-0.5 font-bold">
                {activeFiltersCount}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-7 text-xs text-[#dc2626] hover:text-[#dc2626] hover:bg-[#dc2626]/10"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 text-xs text-[#6b8e6b] hover:text-[#e8f5e8]"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Role Filter */}
        <div className="mb-4">
          <h4 className="text-xs font-mono uppercase text-[#6b8e6b] mb-2">Role</h4>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role.value}
                onClick={() => toggleRole(role.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-all border",
                  filters.roles.includes(role.value)
                    ? "bg-[#1a2e1a] border-[#4ade80] text-[#e8f5e8]"
                    : "bg-transparent border-[#1a2e1a] text-[#6b8e6b] hover:border-[#6b8e6b]"
                )}
              >
                <span className={cn("w-2 h-2", role.color)} />
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-4">
          <h4 className="text-xs font-mono uppercase text-[#6b8e6b] mb-2">Status</h4>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status.value}
                onClick={() => toggleStatus(status.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-all border",
                  filters.status.includes(status.value)
                    ? "bg-[#1a2e1a] border-[#4ade80] text-[#e8f5e8]"
                    : "bg-transparent border-[#1a2e1a] text-[#6b8e6b] hover:border-[#6b8e6b]"
                )}
              >
                <span className={cn("w-2 h-2 rounded-full", status.color)} />
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="pt-4 border-t border-[#1a2e1a] space-y-4">
            {/* Date Range */}
            <div>
              <h4 className="text-xs font-mono uppercase text-[#6b8e6b] mb-2 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Joined Date Range
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                  className={cn(
                    "flex-1 h-9 px-3 bg-[#050805] border border-[#1a2e1a]",
                    "text-[#e8f5e8] text-sm",
                    "focus:border-[#4ade80] focus:outline-none"
                  )}
                />
                <span className="text-[#6b8e6b]">to</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                  className={cn(
                    "flex-1 h-9 px-3 bg-[#050805] border border-[#1a2e1a]",
                    "text-[#e8f5e8] text-sm",
                    "focus:border-[#4ade80] focus:outline-none"
                  )}
                />
              </div>
            </div>

            {/* Spent Amount Range */}
            <div>
              <h4 className="text-xs font-mono uppercase text-[#6b8e6b] mb-2 flex items-center gap-2">
                <DollarSign className="w-3 h-3" />
                Total Spent Range
              </h4>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8e6b]">$</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minSpent}
                    onChange={(e) => onChange({ ...filters, minSpent: e.target.value })}
                    className={cn(
                      "w-full h-9 pl-7 pr-3 bg-[#050805] border border-[#1a2e1a]",
                      "text-[#e8f5e8] text-sm",
                      "focus:border-[#4ade80] focus:outline-none"
                    )}
                  />
                </div>
                <span className="text-[#6b8e6b]">to</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b8e6b]">$</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxSpent}
                    onChange={(e) => onChange({ ...filters, maxSpent: e.target.value })}
                    className={cn(
                      "w-full h-9 pl-7 pr-3 bg-[#050805] border border-[#1a2e1a]",
                      "text-[#e8f5e8] text-sm",
                      "focus:border-[#4ade80] focus:outline-none"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CustomerFilters;
