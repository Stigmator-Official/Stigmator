"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  Download,
  FileText,
  Table,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/Breadcrumb";
import { StatCard } from "@/components/admin/StatCard";
import {
  DateRangePicker,
  DateRange,
  RevenueChart,
  OrdersChart,
  TopProducts,
  TrafficSources,
  RecentActivity,
} from "@/components/admin/analytics";
import { cn } from "@/lib/utils";

// Types matching the API response
interface AnalyticsSummary {
  revenue: { value: number; change: number };
  orders: { value: number; change: number };
  avgOrderValue: { value: number; change: number };
  conversionRate: { value: number; change: number };
  visitors: { value: number; change: number };
}

interface DailyMetric {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
  visitors: number;
  conversionRate: number;
}

interface OrderStatusBreakdown {
  completed: number;
  processing: number;
  pending: number;
  cancelled: number;
}

interface TopProduct {
  id: string;
  name: string;
  image: string;
  sales: number;
  revenue: number;
  growth: number;
}

interface TrafficSource {
  name: string;
  visitors: number;
  percentage: number;
}

interface RecentActivityItem {
  id: string;
  type: "order" | "customer" | "product" | "artist" | "payment";
  description: string;
  timestamp: string;
  value?: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  dailyMetrics: DailyMetric[];
  orderStatusBreakdown: OrderStatusBreakdown;
  topProducts: TopProduct[];
  trafficSources: TrafficSource[];
  recentActivity: RecentActivityItem[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [customStartDate, setCustomStartDate] = useState<string>();
  const [customEndDate, setCustomEndDate] = useState<string>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "csv" | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.set("range", dateRange);
      if (customStartDate) params.set("startDate", customStartDate);
      if (customEndDate) params.set("endDate", customEndDate);
      
      const response = await fetch(`/api/admin/analytics?${params.toString()}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch analytics");
      }
      
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStartDate, customEndDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDateRangeChange = (
    range: DateRange,
    startDate?: string,
    endDate?: string
  ) => {
    setDateRange(range);
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  const handleExport = async (format: "pdf" | "csv") => {
    setExporting(format);
    
    // Simulate export delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if (format === "csv" && data) {
      // Generate CSV
      const csvRows = [
        ["Date", "Revenue", "Profit", "Orders", "Visitors", "Conversion Rate"],
        ...data.dailyMetrics.map((d) => [
          d.date,
          d.revenue,
          d.profit,
          d.orders,
          d.visitors,
          d.conversionRate,
        ]),
      ];
      
      const csvContent = csvRows.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-report-${dateRange}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // Simulate PDF download
      alert(`PDF Report generated for ${dateRange} period. In production, this would download a PDF.`);
    }
    
    setExporting(null);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-[#dc2626]/10 flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-[#dc2626]" />
        </div>
        <h3 className="text-xl font-bold text-[#e8f5e8] mb-2">Failed to load analytics</h3>
        <p className="text-sm text-[#6b8e6b] mb-4">{error}</p>
        <Button
          onClick={fetchAnalytics}
          className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-bold rounded-none"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive insights into your platform performance and business metrics."
        actions={
          <div className="flex items-center gap-3">
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                onClick={() => handleExport("csv")}
                disabled={exporting !== null || loading}
                className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
              >
                {exporting === "csv" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Table className="w-4 h-4 mr-2" />
                )}
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport("pdf")}
                disabled={exporting !== null || loading}
                className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
              >
                {exporting === "pdf" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                PDF
              </Button>
            </div>
            <Button
              onClick={fetchAnalytics}
              disabled={loading}
              className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-black rounded-none"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={data ? formatCurrency(data.summary.revenue.value) : "$0"}
          change={data?.summary.revenue.change}
          changeLabel="vs previous period"
          icon={DollarSign}
          variant="success"
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={data ? formatNumber(data.summary.orders.value) : "0"}
          change={data?.summary.orders.change}
          changeLabel="vs previous period"
          icon={ShoppingBag}
          variant="info"
          loading={loading}
        />
        <StatCard
          title="Avg Order Value"
          value={data ? formatCurrency(data.summary.avgOrderValue.value) : "$0"}
          change={data?.summary.avgOrderValue.change}
          changeLabel="vs previous period"
          icon={TrendingUp}
          variant="default"
          loading={loading}
        />
        <StatCard
          title="Conversion Rate"
          value={data ? formatPercent(data.summary.conversionRate.value) : "0%"}
          change={data?.summary.conversionRate.change}
          changeLabel="vs previous period"
          icon={BarChart3}
          variant="warning"
          loading={loading}
        />
        <StatCard
          title="Visitors"
          value={data ? formatNumber(data.summary.visitors.value) : "0"}
          change={data?.summary.visitors.change}
          changeLabel="vs previous period"
          icon={Users}
          variant="default"
          loading={loading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {data && (
            <RevenueChart
              data={data.dailyMetrics}
              className="h-full"
            />
          )}
        </div>
        <div>
          {data && (
            <TrafficSources
              data={data.trafficSources}
              className="h-full"
            />
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {data && (
          <OrdersChart
            dailyData={data.dailyMetrics}
            statusBreakdown={data.orderStatusBreakdown}
          />
        )}
        {data && (
          <TopProducts
            products={data.topProducts}
          />
        )}
      </div>

      {/* Activity Feed */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {data && (
            <RecentActivity
              activities={data.recentActivity}
              maxItems={12}
            />
          )}
        </div>
        
        {/* Quick Insights Card */}
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardHeader>
            <CardTitle className="text-lg font-black tracking-tight text-[#e8f5e8]">
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data && (
              <>
                <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-[#4ade80]" />
                    <span className="text-xs font-mono text-[#6b8e6b] uppercase">Top Performer</span>
                  </div>
                  <p className="text-sm text-[#e8f5e8] font-medium">
                    {data.topProducts[0]?.name}
                  </p>
                  <p className="text-xs text-[#6b8e6b] mt-1">
                    {formatCurrency(data.topProducts[0]?.revenue)} revenue
                  </p>
                </div>
                
                <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-[#60a5fa]" />
                    <span className="text-xs font-mono text-[#6b8e6b] uppercase">Traffic Leader</span>
                  </div>
                  <p className="text-sm text-[#e8f5e8] font-medium">
                    {data.trafficSources[0]?.name}
                  </p>
                  <p className="text-xs text-[#6b8e6b] mt-1">
                    {data.trafficSources[0]?.percentage}% of total traffic
                  </p>
                </div>
                
                <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-[#fbbf24]" />
                    <span className="text-xs font-mono text-[#6b8e6b] uppercase">Orders</span>
                  </div>
                  <p className="text-sm text-[#e8f5e8] font-medium">
                    {formatNumber(data.orderStatusBreakdown.completed)} completed
                  </p>
                  <p className="text-xs text-[#6b8e6b] mt-1">
                    {(
                      (data.orderStatusBreakdown.completed /
                        (data.orderStatusBreakdown.completed +
                          data.orderStatusBreakdown.processing +
                          data.orderStatusBreakdown.pending +
                          data.orderStatusBreakdown.cancelled)) *
                      100
                    ).toFixed(0)}
                    % completion rate
                  </p>
                </div>
                
                <div className="p-4 bg-[#4ade80]/5 border border-[#4ade80]/20">
                  <p className="text-xs font-mono text-[#4ade80] uppercase mb-2">AI Insight</p>
                  <p className="text-sm text-[#e8f5e8]">
                    Revenue is trending{" "}
                    {data.summary.revenue.change >= 0 ? "up" : "down"} by{" "}
                    {Math.abs(data.summary.revenue.change).toFixed(1)}% compared to the previous
                    period. Consider{" "}
                    {data.summary.revenue.change >= 0
                      ? "capitalizing on this momentum with targeted promotions"
                      : "reviewing your marketing strategy to boost sales"}
                    .
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Summary Footer */}
      <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6b8e6b]">
          <div className="flex items-center gap-4">
            <span>
              Data range: <span className="text-[#e8f5e8]">{dateRange === "today" ? "Today" : dateRange}</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              Last updated: <span className="text-[#e8f5e8]">{new Date().toLocaleTimeString()}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#4ade80] animate-pulse" />
              Live data
            </span>
            <span>STIGMATOR Analytics v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
