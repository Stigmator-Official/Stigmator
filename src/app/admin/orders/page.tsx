"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/Breadcrumb";
import { StatCardCompact } from "@/components/admin/StatCard";
import { cn } from "@/lib/utils";

// Mock orders data
const mockOrders = [
  { id: "ORD-7829", customer: "Alex Chen", email: "alex@example.com", amount: 129.99, status: "completed", date: "2025-04-08", items: 2 },
  { id: "ORD-7828", customer: "Sarah Miller", email: "sarah@example.com", amount: 89.50, status: "processing", date: "2025-04-08", items: 1 },
  { id: "ORD-7827", customer: "Marcus Johnson", email: "marcus@example.com", amount: 245.00, status: "pending", date: "2025-04-07", items: 3 },
  { id: "ORD-7826", customer: "Emma Wilson", email: "emma@example.com", amount: 67.25, status: "completed", date: "2025-04-07", items: 1 },
  { id: "ORD-7825", customer: "James Brown", email: "james@example.com", amount: 189.99, status: "shipped", date: "2025-04-07", items: 2 },
  { id: "ORD-7824", customer: "Lisa Davis", email: "lisa@example.com", amount: 156.00, status: "cancelled", date: "2025-04-06", items: 2 },
  { id: "ORD-7823", customer: "Michael Lee", email: "michael@example.com", amount: 299.99, status: "completed", date: "2025-04-06", items: 4 },
  { id: "ORD-7822", customer: "Jennifer Taylor", email: "jen@example.com", amount: 78.50, status: "processing", date: "2025-04-05", items: 1 },
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    completed: "bg-[#4ade80] text-black",
    processing: "bg-[#60a5fa] text-black",
    pending: "bg-[#fbbf24] text-black",
    shipped: "bg-[#a78bfa] text-black",
    cancelled: "bg-[#dc2626] text-white",
  };
  return (
    <Badge className={cn("rounded-none font-mono text-xs", styles[status] || "bg-[#6b8e6b] text-black")}>
      {status.toUpperCase()}
    </Badge>
  );
};

const orderStats = [
  { title: "Total Orders", value: "1,284", change: 8.2, variant: "default" as const },
  { title: "Revenue", value: "$48,294", change: 12.5, variant: "success" as const },
  { title: "Pending", value: "23", change: -5.4, variant: "warning" as const },
  { title: "Cancelled", value: "12", change: 2.1, variant: "error" as const },
];

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Orders"
        description="Manage and track all orders across the platform."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-black rounded-none">
              <ShoppingBag className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {orderStats.map((stat) => (
          <StatCardCompact
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={ShoppingBag}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8e6b]" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full h-10 pl-10 pr-4 bg-[#050805] border border-[#1a2e1a]",
                  "text-[#e8f5e8] text-sm placeholder:text-[#6b8e6b]",
                  "focus:border-[#4ade80] focus:outline-none transition-colors"
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "border-[#1a2e1a] rounded-none",
                  statusFilter === null && "bg-[#1a2e1a] text-[#e8f5e8]"
                )}
                onClick={() => setStatusFilter(null)}
              >
                All
              </Button>
              {["pending", "processing", "shipped", "completed", "cancelled"].map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "border-[#1a2e1a] rounded-none hidden sm:flex capitalize",
                    statusFilter === status && "bg-[#1a2e1a] text-[#e8f5e8]"
                  )}
                  onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                >
                  {status}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="border-[#1a2e1a] rounded-none sm:hidden"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a2e1a] bg-[#050805]">
                <th className="text-left py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                  Order ID
                </th>
                <th className="text-left py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                  Items
                </th>
                <th className="text-left py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right py-4 px-4 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#1a2e1a]/50 hover:bg-[#1a2e1a]/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-sm text-[#4ade80] hover:underline"
                    >
                      {order.id}
                    </Link>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-medium text-[#e8f5e8]">
                        {order.customer}
                      </p>
                      <p className="text-xs text-[#6b8e6b]">{order.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-[#e8f5e8]">{order.items}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-bold text-[#e8f5e8]">
                      ${order.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-[#6b8e6b]">{order.date}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#6b8e6b] hover:text-[#dc2626] hover:bg-[#dc2626]/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t border-[#1a2e1a]">
          <p className="text-sm text-[#6b8e6b]">
            Showing <span className="text-[#e8f5e8]">1-8</span> of{" "}
            <span className="text-[#e8f5e8]">1,284</span> orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#1a2e1a] rounded-none"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#1a2e1a] rounded-none"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
