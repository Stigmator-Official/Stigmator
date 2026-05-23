"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  BarChart3,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/Breadcrumb";
import { StatCard, StatCardCompact } from "@/components/admin/StatCard";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Development-only mock fallback
const devMockStats = typeof window !== 'undefined' && process.env.NODE_ENV === 'development' ? {
  revenue: { value: 4829400, change: 12.5, sparkline: [35, 42, 38, 45, 48, 52, 49, 58, 62, 55, 68, 72] },
  orders: { value: 1284, change: 8.2, sparkline: [120, 135, 128, 142, 156, 148, 162, 175, 168, 182, 195, 210] },
  customers: { value: 3642, change: -2.4, sparkline: [320, 335, 342, 338, 345, 352, 348, 355, 362, 358, 365, 372] },
  products: { value: 892, change: 24.8, sparkline: [45, 48, 52, 55, 58, 62, 68, 72, 78, 82, 85, 92] },
} : null;

const devRecentOrders = typeof window !== 'undefined' && process.env.NODE_ENV === 'development' ? [
  { id: "ORD-001", customer: "Alex Chen", amount: 129.99, status: "completed", date: "2 min ago" },
  { id: "ORD-002", customer: "Sarah Miller", amount: 89.50, status: "processing", date: "15 min ago" },
  { id: "ORD-003", customer: "Marcus Johnson", amount: 245.00, status: "pending", date: "1 hour ago" },
  { id: "ORD-004", customer: "Emma Wilson", amount: 67.25, status: "completed", date: "2 hours ago" },
  { id: "ORD-005", customer: "James Brown", amount: 189.99, status: "shipped", date: "3 hours ago" },
] : [];

const devArtistApplications = typeof window !== 'undefined' && process.env.NODE_ENV === 'development' ? [
  { id: "APP-001", name: "Marcus Chen", location: "Portland, OR", submittedAt: "2 hours ago", status: "pending" },
  { id: "APP-002", name: "Sofia Rodriguez", location: "Miami, FL", submittedAt: "5 hours ago", status: "pending" },
  { id: "APP-003", name: "James Wilson", location: "Austin, TX", submittedAt: "1 day ago", status: "under_review" },
] : [];

const activityLog = typeof window !== 'undefined' && process.env.NODE_ENV === 'development' ? [
  { id: 1, action: "New order received", time: "2 min ago", type: "order" },
  { id: 2, action: "Artist application submitted", time: "15 min ago", type: "artist" },
  { id: 3, action: "Product 'Urban Wolf Tee' updated", time: "1 hour ago", type: "product" },
  { id: 4, action: "Payment processed for ORD-8923", time: "2 hours ago", type: "payment" },
  { id: 5, action: "New customer registration", time: "3 hours ago", type: "customer" },
] : [];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    completed: "bg-[#4ade80] text-black",
    processing: "bg-[#60a5fa] text-black",
    pending: "bg-[#fbbf24] text-black",
    shipped: "bg-[#a78bfa] text-black",
    cancelled: "bg-[#dc2626] text-white",
    confirmed: "bg-[#4ade80] text-black",
    pending_payment: "bg-[#fbbf24] text-black",
    refunded: "bg-[#6b8e6b] text-white",
  };
  return styles[status] || "bg-[#6b8e6b] text-white";
};

const formatCurrency = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`;
};

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(devMockStats);
  const [recentOrders, setRecentOrders] = useState<any[]>(devRecentOrders);
  const [artistApplications, setArtistApplications] = useState<any[]>(devArtistApplications);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setStats(data.stats || devMockStats);
        setRecentOrders(data.recentOrders?.length ? data.recentOrders : devRecentOrders);
        setArtistApplications(data.artistApplications?.length ? data.artistApplications : devArtistApplications);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        // Keep fallback data if available
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = [
    { title: "Total Revenue", value: stats ? formatCurrency(stats.revenue?.value || 0) : "—", change: stats?.revenue?.change || 0, icon: DollarSign },
    { title: "Total Orders", value: stats ? String(stats.orders?.value || 0) : "—", change: stats?.orders?.change || 0, icon: ShoppingBag },
    { title: "Total Customers", value: stats ? String(stats.customers?.value || 0) : "—", change: stats?.customers?.change || 0, icon: Users },
    { title: "Active Products", value: stats ? String(stats.products?.value || 0) : "—", change: stats?.products?.change || 0, icon: Package },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your platform performance"
      />

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#4ade80]" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-7">
            {/* Left Column - Charts & Activity */}
            <div className="lg:col-span-4 space-y-6">
              {/* Revenue Chart */}
              <Card className="bg-[#0a0f0a] border-[#1a2e1a]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#e8f5e8] text-lg font-black tracking-tight">
                      REVENUE OVERVIEW
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-[#1a2e1a] text-[#6b8e6b]">
                        <Calendar className="h-3 w-3 mr-1" />
                        Last 30 Days
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px] flex items-center justify-center border border-dashed border-[#1a2e1a]">
                    <div className="text-center">
                      <BarChart3 className="h-10 w-10 text-[#1a2e1a] mx-auto mb-3" />
                      <p className="text-sm text-[#6b8e6b]">Revenue chart integration</p>
                      <p className="text-xs text-[#4a6b4a] mt-1">Connect analytics provider for visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card className="bg-[#0a0f0a] border-[#1a2e1a]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#e8f5e8] text-lg font-black tracking-tight">
                      RECENT ORDERS
                    </CardTitle>
                    <Link href="/admin/orders">
                      <Button variant="ghost" size="sm" className="text-[#4ade80] hover:text-[#3ec46e]">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentOrders?.length > 0 ? (
                      recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-[#050805] border border-[#1a2e1a] hover:border-[#2a3e2a] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#1a2e1a] flex items-center justify-center">
                              <ShoppingBag className="h-4 w-4 text-[#4ade80]" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#e8f5e8]">{order.id}</p>
                              <p className="text-xs text-[#6b8e6b]">{order.customer}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#e8f5e8]">
                              {typeof order.amount === 'number' ? `$${order.amount.toFixed(2)}` : order.amount}
                            </p>
                            <Badge className={cn("text-xs rounded-none", getStatusBadge(order.status))}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-[#6b8e6b]">
                        No orders yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Activity & Applications */}
            <div className="lg:col-span-3 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <StatCardCompact
                  title="Pending Orders"
                  value={String(recentOrders?.filter((o) => o.status === "pending" || o.status === "pending_payment").length || 0)}
                  icon={Clock}
                  className="border-l-4 border-l-[#fbbf24]"
                />
                <StatCardCompact
                  title="Completed Today"
                  value={String(recentOrders?.filter((o) => o.status === "completed" || o.status === "confirmed").length || 0)}
                  icon={CheckCircle}
                  className="border-l-4 border-l-[#4ade80]"
                />
              </div>

              {/* Artist Applications */}
              <Card className="bg-[#0a0f0a] border-[#1a2e1a]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#e8f5e8] text-lg font-black tracking-tight">
                      ARTIST APPLICATIONS
                    </CardTitle>
                    <Link href="/admin/artists">
                      <Button variant="ghost" size="sm" className="text-[#4ade80] hover:text-[#3ec46e]">
                        Review
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {artistApplications?.length > 0 ? (
                      artistApplications.map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between p-3 bg-[#050805] border border-[#1a2e1a]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#1a2e1a] flex items-center justify-center">
                              <UserPlus className="h-4 w-4 text-[#4ade80]" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#e8f5e8]">{app.name}</p>
                              <p className="text-xs text-[#6b8e6b]">{app.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[#6b8e6b]">{app.submittedAt}</p>
                            <Badge className="bg-[#fbbf24] text-black text-xs rounded-none">
                              {app.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-[#6b8e6b]">
                        No pending applications
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Log */}
              <Card className="bg-[#0a0f0a] border-[#1a2e1a]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#e8f5e8] text-lg font-black tracking-tight">
                    ACTIVITY LOG
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityLog.length > 0 ? (
                      activityLog.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-2">
                          <div className="w-2 h-2 bg-[#4ade80] mt-2" />
                          <div>
                            <p className="text-sm text-[#a3c9a3]">{activity.action}</p>
                            <p className="text-xs text-[#6b8e6b]">{activity.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-[#6b8e6b]">
                        No recent activity
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
