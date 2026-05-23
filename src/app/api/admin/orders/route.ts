import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { withOrderManagement, canAny } from "@/lib/api/admin-middleware";

function sanitizeSearch(input: string): string {
  // Remove characters that could interfere with PostgREST filter syntax
  // % and _ are SQL wildcards inside ilike
  return input.replace(/[,%_&()"\\]/g, "");
}

// ============================================
// GET /api/admin/orders - List orders with filtering and pagination
// ============================================
export const GET = withOrderManagement(async (request) => {
  try {
    const supabase = await createRouteHandlerClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.getAll("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const sortField = searchParams.get("sortField") || "created_at";
    const sortDirection = searchParams.get("sortDirection") || "desc";

    // Build query
    let query = supabase
      .from("orders")
      .select(
        `*,
        items:order_items(
          *,
          product_design:product_design_id(
            design:design_id(title, images, artist:artist_id(id, display_name)),
            product:product_id(name)
          )
        )`,
        { count: "exact" }
      );

    // Status filter
    if (statusFilter.length > 0) {
      query = query.in("status", statusFilter);
    }

    // Date range
    if (dateFrom) {
      query = query.gte("created_at", new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      query = query.lte("created_at", toDate.toISOString());
    }

    // Amount range (in cents)
    if (minAmount) {
      query = query.gte("total", parseFloat(minAmount) * 100);
    }
    if (maxAmount) {
      query = query.lte("total", parseFloat(maxAmount) * 100);
    }

    // Search
    const safeSearch = sanitizeSearch(search);
    if (safeSearch) {
      query = query.or(
        `id.ilike.%${safeSearch}%,shipping_address->>first_name.ilike.%${safeSearch}%,shipping_address->>last_name.ilike.%${safeSearch}%,shipping_address->>email.ilike.%${safeSearch}%`
      );
    }

    // Sorting
    const validSortFields = ["id", "created_at", "total", "status"];
    const orderField = validSortFields.includes(sortField) ? sortField : "created_at";
    query = query.order(orderField, { ascending: sortDirection === "asc" });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: orders, count: total, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    const totalPages = total ? Math.ceil(total / limit) : 1;

    return NextResponse.json({
      success: true,
      data: {
        orders: orders || [],
        pagination: {
          page,
          limit,
          total: total || 0,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});

// ============================================
// DELETE /api/admin/orders - Bulk delete orders
// ============================================
export const DELETE = withOrderManagement(async (request, context) => {
  if (!canAny(context, ["orders:manage", "orders:delete"])) {
    return NextResponse.json(
      { success: false, error: "Permission denied", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order IDs are required" },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    // Delete order items first (cascade should handle this, but being explicit)
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .in("order_id", ids);

    // Order items deletion error handled by cascade or subsequent order delete

    // Delete orders
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .in("id", ids);

    if (ordersError) {
      return NextResponse.json(
        { success: false, error: "Failed to delete orders" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deleted: ids.length },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});
