"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  MoreHorizontal,
  UserCog,
  UserX,
  Mail,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/Breadcrumb";
import { StatCardCompact } from "@/components/admin/StatCard";
import { CustomerTable } from "@/components/admin/customers/CustomerTable";
import { CustomerFilters } from "@/components/admin/customers/CustomerFilters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { customers as mockCustomers, customerStats, type Customer, type CustomerRole } from "@/lib/data/customers";

const ROLE_OPTIONS: { value: CustomerRole; label: string }[] = [
  { value: "CUSTOMER", label: "Customer" },
  { value: "ARTIST", label: "Artist" },
  { value: "ADMIN", label: "Admin" },
  { value: "DEVELOPER", label: "Developer" },
];

interface Filters {
  roles: CustomerRole[];
  status: ("active" | "inactive" | "suspended" | "pending")[];
  dateFrom: string;
  dateTo: string;
  minSpent: string;
  maxSpent: string;
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("joinedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<Filters>({
    roles: [],
    status: [],
    dateFrom: "",
    dateTo: "",
    minSpent: "",
    maxSpent: "",
  });

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [bulkActionRole, setBulkActionRole] = useState<CustomerRole | "">("");

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let filtered = [...mockCustomers];

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.fullName.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.displayName.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (filters.roles.length > 0) {
      filtered = filtered.filter(c => filters.roles.includes(c.role));
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(c => filters.status.includes(c.status));
    }

    // Date range
    if (filters.dateFrom) {
      filtered = filtered.filter(c => new Date(c.joinedAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(c => new Date(c.joinedAt) <= new Date(filters.dateTo));
    }

    // Spent range
    if (filters.minSpent) {
      filtered = filtered.filter(c => c.totalSpent >= parseFloat(filters.minSpent));
    }
    if (filters.maxSpent) {
      filtered = filtered.filter(c => c.totalSpent <= parseFloat(filters.maxSpent));
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Customer];
      const bValue = b[sortBy as keyof Customer];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [searchQuery, filters, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleSelect = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === paginatedCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCustomers.map(c => c.id));
    }
  }, [selectedIds.length, paginatedCustomers]);

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  }, [sortBy]);

  const handleResetFilters = useCallback(() => {
    setFilters({
      roles: [],
      status: [],
      dateFrom: "",
      dateTo: "",
      minSpent: "",
      maxSpent: "",
    });
  }, []);

  const handleExportCSV = useCallback(() => {
    const headers = ["ID", "Name", "Email", "Role", "Status", "Orders", "Spent", "Joined"];
    const rows = filteredCustomers.map(c => [
      c.id,
      c.fullName,
      c.email,
      c.role,
      c.status,
      c.totalOrders.toString(),
      c.totalSpent.toString(),
      new Date(c.joinedAt).toISOString().split("T")[0],
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredCustomers]);

  const handleBulkRoleChange = useCallback(() => {
    if (!bulkActionRole || selectedIds.length === 0) return;
    console.log(`Changing role to ${bulkActionRole} for:`, selectedIds);
    setSelectedIds([]);
    setBulkActionRole("");
  }, [bulkActionRole, selectedIds]);

  const handleBulkDeactivate = useCallback(() => {
    console.log("Deactivating:", selectedIds);
    setSelectedIds([]);
  }, [selectedIds]);

  // Dialog handlers
  const openEditDialog = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  }, []);

  const openEmailDialog = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setEmailDialogOpen(true);
  }, []);

  const handleToggleStatus = useCallback((customer: Customer) => {
    console.log("Toggle status:", customer.id);
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Customers"
        description="Manage users, artists, and administrators across the platform."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
              onClick={handleExportCSV}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-black rounded-none">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardCompact
          title="Total Users"
          value={customerStats.total.toString()}
          change={12.5}
          icon={Users}
          variant="default"
        />
        <StatCardCompact
          title="Active"
          value={customerStats.active.toString()}
          change={8.2}
          icon={UserCog}
          variant="success"
        />
        <StatCardCompact
          title="Artists"
          value={customerStats.artists.toString()}
          change={15.3}
          icon={Users}
          variant="default"
        />
        <StatCardCompact
          title="New This Month"
          value="24"
          change={-5.4}
          icon={UserPlus}
          variant="warning"
        />
      </div>

      {/* Filters */}
      <CustomerFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Search and Bulk Actions */}
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8e6b]" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full h-10 pl-10 pr-4 bg-[#050805] border border-[#1a2e1a]",
                  "text-[#e8f5e8] text-sm placeholder:text-[#6b8e6b]",
                  "focus:border-[#4ade80] focus:outline-none transition-colors"
                )}
              />
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6b8e6b]">
                  {selectedIds.length} selected
                </span>

                <Select value={bulkActionRole} onValueChange={(v) => setBulkActionRole(v as CustomerRole)}>
                  <SelectTrigger className="w-32 h-10 border-[#1a2e1a] bg-[#050805] text-[#e8f5e8] rounded-none">
                    <SelectValue placeholder="Set Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f0a] border-[#1a2e1a]">
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem
                        key={role.value}
                        value={role.value}
                        className="text-[#e8f5e8] hover:bg-[#1a2e1a] focus:bg-[#1a2e1a]"
                      >
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkRoleChange}
                  disabled={!bulkActionRole}
                  className="border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80]/10 rounded-none"
                >
                  Apply
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDeactivate}
                  className="border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24]/10 rounded-none"
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Deactivate
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                  className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden">
        <CustomerTable
          customers={paginatedCustomers}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onSendEmail={openEmailDialog}
          onToggleStatus={handleToggleStatus}
        />

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-[#1a2e1a] gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-[#6b8e6b]">
              Showing{" "}
              <span className="text-[#e8f5e8]">
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredCustomers.length)}
              </span>{" "}
              of <span className="text-[#e8f5e8]">{filteredCustomers.length}</span> customers
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6b8e6b]">Per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(v) => {
                  setItemsPerPage(parseInt(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-16 h-8 border-[#1a2e1a] bg-[#050805] text-[#e8f5e8] rounded-none text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f0a] border-[#1a2e1a]">
                  {[10, 25, 50, 100].map((n) => (
                    <SelectItem
                      key={n}
                      value={n.toString()}
                      className="text-[#e8f5e8] hover:bg-[#1a2e1a] focus:bg-[#1a2e1a]"
                    >
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#1a2e1a] rounded-none"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              <ChevronLeft className="w-4 h-4 -ml-2" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#1a2e1a] rounded-none"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "h-8 w-8 rounded-none text-xs",
                      currentPage === page
                        ? "bg-[#4ade80] text-black border-[#4ade80]"
                        : "border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8]"
                    )}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#1a2e1a] rounded-none"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#1a2e1a] rounded-none"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
              <ChevronRight className="w-4 h-4 -ml-2" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8] rounded-none sm:rounded-none">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tighter">Edit Customer Role</DialogTitle>
            <DialogDescription className="text-[#6b8e6b]">
              Change the role for {selectedCustomer?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedCustomer?.role || ""}
              onValueChange={(v) => console.log("New role:", v)}
            >
              <SelectTrigger className="w-full h-10 border-[#1a2e1a] bg-[#050805] text-[#e8f5e8] rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f0a] border-[#1a2e1a]">
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem
                    key={role.value}
                    value={role.value}
                    className="text-[#e8f5e8] hover:bg-[#1a2e1a] focus:bg-[#1a2e1a]"
                  >
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setEditDialogOpen(false)}
              className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-bold rounded-none"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#0a0f0a] border-[#dc2626] text-[#e8f5e8] rounded-none sm:rounded-none">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tighter text-[#dc2626]">
              Delete Customer
            </DialogTitle>
            <DialogDescription className="text-[#6b8e6b]">
              Are you sure you want to delete {selectedCustomer?.fullName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold rounded-none"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8] rounded-none sm:rounded-none">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tighter">Send Email</DialogTitle>
            <DialogDescription className="text-[#6b8e6b]">
              Send an email to {selectedCustomer?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <input
              type="text"
              placeholder="Subject"
              className={cn(
                "w-full h-10 px-3 bg-[#050805] border border-[#1a2e1a]",
                "text-[#e8f5e8] text-sm placeholder:text-[#6b8e6b]",
                "focus:border-[#4ade80] focus:outline-none"
              )}
            />
            <textarea
              placeholder="Message"
              rows={4}
              className={cn(
                "w-full px-3 py-2 bg-[#050805] border border-[#1a2e1a]",
                "text-[#e8f5e8] text-sm placeholder:text-[#6b8e6b]",
                "focus:border-[#4ade80] focus:outline-none resize-none"
              )}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEmailDialogOpen(false)}
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setEmailDialogOpen(false)}
              className="bg-[#60a5fa] hover:bg-[#3b82f6] text-black font-bold rounded-none"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
