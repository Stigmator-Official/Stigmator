"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  Search,
  Plus,
  Download,
  Trash2,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  Filter,
  Copy,
  Check,
  Grid3X3,
  List,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/Breadcrumb";
import { PromoCodeCard } from "@/components/admin/promo/PromoCodeCard";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PromoCode, PromoCodeType, promoTypeLabels } from "./types";
import { cn } from "@/lib/utils";

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean;
    action: "activate" | "deactivate" | "delete" | null;
  }>({ open: false, action: null });

  const fetchPromoCodes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (searchQuery) params.set("search", searchQuery);
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());

      const response = await fetch(`/api/admin/promo-codes?${params}`);
      const data = await response.json();

      if (data.success) {
        setPromoCodes(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setPromoCodes((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive } : p))
        );
      }
    } catch (error) {
      console.error("Error toggling promo code:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPromoCodes((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting promo code:", error);
    }
  };

  const handleSelectAll = () => {
    if (selectedCodes.size === promoCodes.length) {
      setSelectedCodes(new Set());
    } else {
      setSelectedCodes(new Set(promoCodes.map((p) => p.id)));
    }
  };

  const handleSelectCode = (id: string) => {
    const newSelected = new Set(selectedCodes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCodes(newSelected);
  };

  const handleBulkAction = async () => {
    if (!bulkActionDialog.action || selectedCodes.size === 0) return;

    try {
      const promises = Array.from(selectedCodes).map((id) => {
        if (bulkActionDialog.action === "delete") {
          return fetch(`/api/admin/promo-codes/${id}`, { method: "DELETE" });
        } else {
          return fetch(`/api/admin/promo-codes/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              isActive: bulkActionDialog.action === "activate",
            }),
          });
        }
      });

      await Promise.all(promises);
      await fetchPromoCodes();
      setSelectedCodes(new Set());
      setBulkActionDialog({ open: false, action: null });
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const isExpired = (promoCode: PromoCode) => {
    return promoCode.expiryDate && new Date(promoCode.expiryDate) < new Date();
  };

  const stats = {
    total: promoCodes.length,
    active: promoCodes.filter((p) => p.isActive && !isExpired(p)).length,
    expired: promoCodes.filter((p) => isExpired(p)).length,
    usage: promoCodes.reduce((acc, p) => acc + p.usageCount, 0),
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Promo Codes"
        description="Create and manage discount codes for your customers."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none hidden sm:flex"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Link href="/admin/promo-codes/new">
              <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-black rounded-none">
                <Plus className="w-4 h-4 mr-2" />
                New Code
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#6b8e6b] uppercase tracking-wider font-mono mb-1">
              Total Codes
            </p>
            <p className="text-2xl font-black text-[#e8f5e8]">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#6b8e6b] uppercase tracking-wider font-mono mb-1">
              Active
            </p>
            <p className="text-2xl font-black text-[#4ade80]">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#6b8e6b] uppercase tracking-wider font-mono mb-1">
              Expired
            </p>
            <p className="text-2xl font-black text-[#dc2626]">{stats.expired}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#6b8e6b] uppercase tracking-wider font-mono mb-1">
              Total Usage
            </p>
            <p className="text-2xl font-black text-[#e8f5e8]">{stats.usage}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8e6b]" />
              <input
                type="text"
                placeholder="Search codes, descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-[#050805] border border-[#1a2e1a] text-[#e8f5e8] text-sm placeholder:text-[#6b8e6b] focus:border-[#4ade80] focus:outline-none transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] rounded-none">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px] rounded-none">
                  <Ticket className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="free_shipping">Free Shipping</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex items-center border border-[#1a2e1a]">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "list"
                      ? "bg-[#1a2e1a] text-[#e8f5e8]"
                      : "text-[#6b8e6b] hover:text-[#e8f5e8]"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "grid"
                      ? "bg-[#1a2e1a] text-[#e8f5e8]"
                      : "text-[#6b8e6b] hover:text-[#e8f5e8]"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedCodes.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1a2e1a]"
            >
              <span className="text-sm text-[#6b8e6b]">
                {selectedCodes.size} selected
              </span>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                className="border-[#1a2e1a] text-[#4ade80] hover:text-[#4ade80] hover:bg-[#4ade80]/10 rounded-none"
                onClick={() => setBulkActionDialog({ open: true, action: "activate" })}
              >
                <Power className="w-4 h-4 mr-2" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
                onClick={() => setBulkActionDialog({ open: true, action: "deactivate" })}
              >
                <PowerOff className="w-4 h-4 mr-2" />
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#1a2e1a] text-[#dc2626] hover:text-[#dc2626] hover:bg-[#dc2626]/10 rounded-none"
                onClick={() => setBulkActionDialog({ open: true, action: "delete" })}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Promo Codes List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#4ade80] border-t-transparent animate-spin" />
        </div>
      ) : promoCodes.length === 0 ? (
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-12 text-center">
            <Ticket className="w-12 h-12 text-[#1a2e1a] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#e8f5e8] mb-2">
              No promo codes found
            </h3>
            <p className="text-sm text-[#6b8e6b] mb-4">
              Get started by creating your first promo code
            </p>
            <Link href="/admin/promo-codes/new">
              <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-black rounded-none">
                <Plus className="w-4 h-4 mr-2" />
                Create Promo Code
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {promoCodes.map((promoCode) => (
              <PromoCodeCard
                key={promoCode.id}
                promoCode={promoCode}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                onCopy={handleCopyCode}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        // List View (Table)
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a2e1a] bg-[#050805]">
                  <th className="text-left py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedCodes.size === promoCodes.length && promoCodes.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 border border-[#1a2e1a] bg-[#050805] rounded-none accent-[#4ade80]"
                    />
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                    Code
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                    Value
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((promoCode) => {
                  const expired = isExpired(promoCode);
                  return (
                    <tr
                      key={promoCode.id}
                      className="border-b border-[#1a2e1a]/50 hover:bg-[#1a2e1a]/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedCodes.has(promoCode.id)}
                          onChange={() => handleSelectCode(promoCode.id)}
                          className="w-4 h-4 border border-[#1a2e1a] bg-[#050805] rounded-none accent-[#4ade80]"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/promo-codes/${promoCode.id}/edit`}
                            className="font-mono text-sm text-[#4ade80] hover:underline"
                          >
                            {promoCode.code}
                          </Link>
                          <button
                            onClick={() => handleCopyCode(promoCode.code)}
                            className="p-1 text-[#6b8e6b] hover:text-[#4ade80] transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === promoCode.code ? (
                              <Check className="w-3.5 h-3.5 text-[#4ade80]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className={cn(
                            "rounded-none text-xs font-mono",
                            promoCode.type === "percentage" && "bg-[#22d3ee] text-black",
                            promoCode.type === "fixed" && "bg-[#4ade80] text-black",
                            promoCode.type === "free_shipping" && "bg-[#a78bfa] text-black"
                          )}
                        >
                          {promoTypeLabels[promoCode.type].toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-bold text-[#e8f5e8]">
                          {promoCode.type === "percentage"
                            ? `${promoCode.value}%`
                            : promoCode.type === "fixed"
                            ? `$${promoCode.value}`
                            : "FREE"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-[#e8f5e8]">
                          {promoCode.usageCount}
                          {promoCode.usageLimit && (
                            <span className="text-[#6b8e6b]">/{promoCode.usageLimit}</span>
                          )}
                        </span>
                        {promoCode.usageLimit && (
                          <div className="w-20 h-1 bg-[#1a2e1a] mt-1">
                            <div
                              className={cn(
                                "h-full",
                                (promoCode.usageCount / promoCode.usageLimit) >= 0.9
                                  ? "bg-[#dc2626]"
                                  : "bg-[#4ade80]"
                              )}
                              style={{
                                width: `${Math.min(
                                  (promoCode.usageCount / promoCode.usageLimit) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={cn("text-sm", expired && "text-[#dc2626]")}>
                          {promoCode.expiryDate
                            ? new Date(promoCode.expiryDate).toLocaleDateString()
                            : "Never"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className={cn(
                            "rounded-none text-xs font-mono",
                            promoCode.isActive && !expired
                              ? "bg-[#4ade80] text-black"
                              : expired
                              ? "bg-[#6b8e6b] text-black"
                              : "bg-[#dc2626] text-white"
                          )}
                        >
                          {expired ? "EXPIRED" : promoCode.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8",
                              promoCode.isActive
                                ? "text-[#4ade80] hover:text-[#dc2626]"
                                : "text-[#6b8e6b] hover:text-[#4ade80]"
                            )}
                            onClick={() => handleToggleActive(promoCode.id, !promoCode.isActive)}
                          >
                            {promoCode.isActive ? (
                              <Power className="w-4 h-4" />
                            ) : (
                              <PowerOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Link href={`/admin/promo-codes/${promoCode.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#6b8e6b] hover:text-[#e8f5e8]"
                            >
                              <Ticket className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#6b8e6b] hover:text-[#dc2626]"
                            onClick={() => handleDelete(promoCode.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-[#1a2e1a]">
            <p className="text-sm text-[#6b8e6b]">
              Showing{" "}
              <span className="text-[#e8f5e8]">
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="text-[#e8f5e8]">{pagination.total}</span> codes
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-[#1a2e1a] rounded-none"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-[#6b8e6b] px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-[#1a2e1a] rounded-none"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Bulk Action Dialog */}
      <Dialog
        open={bulkActionDialog.open}
        onOpenChange={(open) => !open && setBulkActionDialog({ open: false, action: null })}
      >
        <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8] rounded-none">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tighter flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#fbbf24]" />
              Confirm Bulk Action
            </DialogTitle>
            <DialogDescription className="text-[#6b8e6b]">
              You are about to {bulkActionDialog.action} {selectedCodes.size} promo codes.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setBulkActionDialog({ open: false, action: null })}
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              className={cn(
                "rounded-none font-black",
                bulkActionDialog.action === "delete"
                  ? "bg-[#dc2626] hover:bg-[#dc2626]/90 text-white"
                  : "bg-[#4ade80] hover:bg-[#3ec46e] text-black"
              )}
            >
              {bulkActionDialog.action === "delete" ? (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              ) : bulkActionDialog.action === "activate" ? (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  Activate
                </>
              ) : (
                <>
                  <PowerOff className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
