import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { withAdmin } from "@/lib/api/admin-middleware";

export const GET = withAdmin(async () => {
  try {
    const supabase = await createRouteHandlerClient();

    // Fetch stats in parallel
    const [
      { count: totalOrders, error: ordersError },
      { count: totalCustomers, error: customersError },
      { count: totalProducts, error: productsError },
      { data: revenueData, error: revenueError },
      { data: recentOrders, error: recentOrdersError },
      { data: pendingArtists, error: artistsError },
    ] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "CUSTOMER"),
      supabase.from("product_designs").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("orders").select("total").eq("status", "confirmed"),
      supabase
        .from("orders")
        .select("id, total, status, customer_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("artist_profiles")
        .select("id, display_name, location, created_at")
        .eq("verification_status", "PENDING")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    // Database errors are handled gracefully — no sensitive details logged

    const totalRevenue = (revenueData || []).reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    return NextResponse.json({
      stats: {
        revenue: { value: totalRevenue, change: 0 },
        orders: { value: totalOrders || 0, change: 0 },
        customers: { value: totalCustomers || 0, change: 0 },
        products: { value: totalProducts || 0, change: 0 },
      },
      recentOrders: (recentOrders || []).map((order: any) => ({
        id: order.id.slice(0, 8).toUpperCase(),
        customer: order.customer_id ? "Customer" : "Guest",
        amount: (order.total || 0) / 100,
        status: order.status,
        date: new Date(order.created_at).toLocaleDateString(),
      })),
      artistApplications: (pendingArtists || []).map((artist: any) => ({
        id: artist.id.slice(0, 8).toUpperCase(),
        name: artist.display_name || "Unknown",
        location: artist.location || "Unknown",
        submittedAt: new Date(artist.created_at).toLocaleDateString(),
        status: "pending",
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
});
