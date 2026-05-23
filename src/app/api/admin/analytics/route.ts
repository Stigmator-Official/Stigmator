import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { withAdmin } from "@/lib/api/admin-middleware";

export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const supabase = await createRouteHandlerClient();

    // Fetch real summary data
    const [
      { count: totalOrders },
      { data: revenueData },
      { count: totalCustomers },
      { count: totalProducts },
    ] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total").eq("status", "confirmed"),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "CUSTOMER"),
      supabase.from("product_designs").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);

    const totalRevenue = (revenueData || []).reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    const avgOrderValue = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // In production without sufficient data, return empty states instead of mock data
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      return NextResponse.json({
        summary: {
          revenue: { value: totalRevenue, change: 0 },
          orders: { value: totalOrders || 0, change: 0 },
          avgOrderValue: { value: avgOrderValue, change: 0 },
          conversionRate: { value: 0, change: 0 },
          visitors: { value: totalCustomers || 0, change: 0 },
        },
        dailyMetrics: [],
        orderStatusBreakdown: { completed: 0, processing: 0, pending: 0, cancelled: 0 },
        topProducts: [],
        trafficSources: [],
        recentActivity: [],
      });
    }

    // Development-only mock fallback
    const dailyMetrics = [];
    const now = new Date();
    const baseRevenue = 2500;
    const baseOrders = 35;
    const baseVisitors = 1200;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendMultiplier = isWeekend ? 0.7 : 1.2;
      const randomFactor = 0.8 + Math.random() * 0.4;
      const trendFactor = 1 + ((days - i) / days) * 0.2;

      const revenue = Math.round(baseRevenue * weekendMultiplier * randomFactor * trendFactor);
      const profit = Math.round(revenue * (0.35 + Math.random() * 0.15));
      const orders = Math.round(baseOrders * weekendMultiplier * randomFactor * trendFactor);
      const visitors = Math.round(baseVisitors * weekendMultiplier * randomFactor * trendFactor);
      const conversionRate = parseFloat(((orders / visitors) * 100).toFixed(2));

      dailyMetrics.push({
        date: date.toISOString().split("T")[0],
        revenue,
        profit,
        orders,
        visitors,
        conversionRate,
      });
    }

    const devTotalRevenue = dailyMetrics.reduce((sum: number, d: any) => sum + d.revenue, 0);
    const devTotalOrders = dailyMetrics.reduce((sum: number, d: any) => sum + d.orders, 0);
    const devTotalVisitors = dailyMetrics.reduce((sum: number, d: any) => sum + d.visitors, 0);

    return NextResponse.json({
      summary: {
        revenue: { value: devTotalRevenue, change: 12.5 },
        orders: { value: devTotalOrders, change: 8.2 },
        avgOrderValue: { value: devTotalOrders > 0 ? devTotalRevenue / devTotalOrders : 0, change: 3.1 },
        conversionRate: { value: devTotalVisitors > 0 ? (devTotalOrders / devTotalVisitors) * 100 : 0, change: -1.2 },
        visitors: { value: devTotalVisitors, change: 15.3 },
      },
      dailyMetrics,
      orderStatusBreakdown: { completed: 856, processing: 124, pending: 89, cancelled: 45 },
      topProducts: [
        { id: "1", name: "Urban Wolf Tee", image: "", sales: 234, revenue: 18720, growth: 24.5 },
        { id: "2", name: "Neon Dragon Hoodie", image: "", sales: 189, revenue: 28350, growth: 18.2 },
        { id: "3", name: "Minimal Ink Crewneck", image: "", sales: 156, revenue: 12480, growth: 12.8 },
      ],
      trafficSources: [
        { name: "Direct", visitors: 4520, percentage: 35.2 },
        { name: "Instagram", visitors: 3890, percentage: 30.3 },
        { name: "Google", visitors: 2340, percentage: 18.2 },
        { name: "TikTok", visitors: 1560, percentage: 12.1 },
        { name: "Referral", visitors: 520, percentage: 4.2 },
      ],
      recentActivity: [
        { id: "1", type: "order", description: "New order #ORD-8923", timestamp: new Date().toISOString(), value: 129.99 },
        { id: "2", type: "artist", description: "Artist application from Marcus Chen", timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: "3", type: "product", description: "Product 'Urban Wolf Tee' updated", timestamp: new Date(Date.now() - 7200000).toISOString() },
      ],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
});
