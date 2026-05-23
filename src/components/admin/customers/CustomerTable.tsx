"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  UserX,
  UserCheck,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Customer, CustomerRole, CustomerStatus } from "@/lib/data/customers";

interface CustomerTableProps {
  customers: Customer[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onSendEmail?: (customer: Customer) => void;
  onToggleStatus?: (customer: Customer) => void;
}

const ROLE_COLORS: Record<CustomerRole, string> = {
  CUSTOMER: "bg-[#6b8e6b] text-black",
  ARTIST: "bg-[#60a5fa] text-black",
  ADMIN: "bg-[#4ade80] text-black",
  SUPER_ADMIN: "bg-[#dc2626] text-white",
  DEVELOPER: "bg-[#a78bfa] text-black",
};

const STATUS_COLORS: Record<CustomerStatus, string> = {
  active: "bg-[#4ade80] text-black",
  inactive: "bg-[#6b8e6b] text-black",
  suspended: "bg-[#dc2626] text-white",
  pending: "bg-[#fbbf24] text-black",
};

function SortHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  column: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
}) {
  const isActive = sortBy === column;

  return (
    <button
      onClick={() => onSort(column)}
      className="flex items-center gap-1 hover:text-[#4ade80] transition-colors"
    >
      <span>{label}</span>
      <span className="flex flex-col">
        <ChevronUp
          className={cn(
            "w-3 h-3 -mb-1",
            isActive && sortOrder === "asc" ? "text-[#4ade80]" : "text-[#1a2e1a]"
          )}
        />
        <ChevronDown
          className={cn(
            "w-3 h-3",
            isActive && sortOrder === "desc" ? "text-[#4ade80]" : "text-[#1a2e1a]"
          )}
        />
      </span>
    </button>
  );
}

export function CustomerTable({
  customers,
  selectedIds,
  onSelect,
  onSelectAll,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  onSendEmail,
  onToggleStatus,
}: CustomerTableProps) {
  const allSelected = customers.length > 0 && customers.every(c => selectedIds.includes(c.id));
  const someSelected = customers.some(c => selectedIds.includes(c.id)) && !allSelected;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1a2e1a] bg-[#050805]">
            <th className="py-4 px-4 text-left">
              <Checkbox
                checked={allSelected}
                data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                onCheckedChange={onSelectAll}
                className="border-[#1a2e1a] data-[state=checked]:bg-[#4ade80] data-[state=checked]:border-[#4ade80]"
              />
            </th>
            <th className="py-4 px-4 text-left text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
              Customer
            </th>
            <th className="py-4 px-4 text-left text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
              <SortHeader
                label="Role"
                column="role"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            </th>
            <th className="py-4 px-4 text-left text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
              <SortHeader
                label="Status"
                column="status"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            </th>
            <th className="py-4 px-4 text-left text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
              <SortHeader
                label="Orders"
                column="totalOrders"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            </th>
            <th className="py-4 px-4 text-left text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
              <SortHeader
                label="Spent"
                column="totalSpent"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            </th>
            <th className="py-4 px-4 text-left text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
              <SortHeader
                label="Joined"
                column="joinedAt"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            </th>
            <th className="py-4 px-4 text-right text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className={cn(
                "border-b border-[#1a2e1a]/50 transition-colors",
                selectedIds.includes(customer.id)
                  ? "bg-[#4ade80]/5"
                  : "hover:bg-[#1a2e1a]/30"
              )}
            >
              <td className="py-4 px-4">
                <Checkbox
                  checked={selectedIds.includes(customer.id)}
                  onCheckedChange={() => onSelect(customer.id)}
                  className="border-[#1a2e1a] data-[state=checked]:bg-[#4ade80] data-[state=checked]:border-[#4ade80]"
                />
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/customers/${customer.id}`}>
                    <div className="relative w-10 h-10 overflow-hidden bg-[#1a2e1a]">
                      {customer.avatar ? (
                        <Image
                          src={customer.avatar}
                          alt={customer.fullName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#4ade80] text-black font-bold text-sm">
                          {customer.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div>
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-sm font-medium text-[#e8f5e8] hover:text-[#4ade80] transition-colors"
                    >
                      {customer.fullName}
                    </Link>
                    <p className="text-xs text-[#6b8e6b]">{customer.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <Badge
                  className={cn(
                    "rounded-none font-mono text-[10px] font-bold uppercase",
                    ROLE_COLORS[customer.role]
                  )}
                >
                  {customer.role.replace("_", " ")}
                </Badge>
              </td>
              <td className="py-4 px-4">
                <Badge
                  className={cn(
                    "rounded-none font-mono text-[10px] font-bold uppercase",
                    STATUS_COLORS[customer.status]
                  )}
                >
                  {customer.status}
                </Badge>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-[#e8f5e8]">{customer.totalOrders}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-mono text-[#e8f5e8]">
                  {formatCurrency(customer.totalSpent)}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-[#6b8e6b]">{formatDate(customer.joinedAt)}</span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]"
                    asChild
                  >
                    <Link href={`/admin/customers/${customer.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8]"
                    >
                      <DropdownMenuItem
                        onClick={() => onEdit?.(customer)}
                        className="hover:bg-[#1a2e1a] focus:bg-[#1a2e1a] cursor-pointer"
                      >
                        <Edit className="w-4 h-4 text-[#4ade80] mr-2" />
                        Edit Role
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onSendEmail?.(customer)}
                        className="hover:bg-[#1a2e1a] focus:bg-[#1a2e1a] cursor-pointer"
                      >
                        <Mail className="w-4 h-4 text-[#60a5fa] mr-2" />
                        Send Email
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-[#1a2e1a]" />

                      {customer.status === "active" ? (
                        <DropdownMenuItem
                          onClick={() => onToggleStatus?.(customer)}
                          className="hover:bg-[#1a2e1a] focus:bg-[#1a2e1a] cursor-pointer text-[#fbbf24]"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onToggleStatus?.(customer)}
                          className="hover:bg-[#1a2e1a] focus:bg-[#1a2e1a] cursor-pointer text-[#4ade80]"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="bg-[#1a2e1a]" />

                      <DropdownMenuItem
                        onClick={() => onDelete?.(customer)}
                        className="hover:bg-[#dc2626]/10 focus:bg-[#dc2626]/10 cursor-pointer text-[#dc2626]"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerTable;
