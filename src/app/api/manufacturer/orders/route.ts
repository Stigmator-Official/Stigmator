import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { withAuth, forbiddenResponse } from "@/lib/api/admin-middleware";
import { generalRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MANUFACTURER_ROLES = ["MANUFACTURER", "ADMIN", "SUPER_ADMIN"];

// GET - List orders assigned to manufacturer/fulfillment partner
export async function GET(request: NextRequest) {
  return withAuth(async (req, context) => {
    // Rate limit
    const { success: limitOk } = await generalRateLimit(context.user.id);
    if (!limitOk) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Authorization: manufacturer, admin, or super admin only
    if (!MANUFACTURER_ROLES.includes(context.role)) {
      return forbiddenResponse("Manufacturer access required");
    }

    const supabase = await createRouteHandlerClient();

    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status") || "pending";

      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          total,
          created_at,
          customer:customer_id(email, full_name),
          items:order_items(
            id,
            quantity,
            size,
            color,
            production_status,
            fulfillment_status,
            product_design:product_design_id(
              design:design_id(title, images),
              product:product_id(name)
            )
          )
        `)
        .eq("status", status === "pending" ? "confirmed" : status)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return NextResponse.json({ orders: orders || [] });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Accept an order for fulfillment
export async function POST(request: NextRequest) {
  return withAuth(async (req, context) => {
    // Rate limit
    const { success: limitOk } = await generalRateLimit(context.user.id);
    if (!limitOk) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Authorization: manufacturer, admin, or super admin only
    if (!MANUFACTURER_ROLES.includes(context.role)) {
      return forbiddenResponse("Manufacturer access required");
    }

    const supabase = await createRouteHandlerClient();

    try {
      const body = await req.json();
      const { orderId, itemIds } = body;

      if (!orderId || !itemIds || !Array.isArray(itemIds)) {
        return NextResponse.json(
          { error: "Order ID and item IDs are required" },
          { status: 400 }
        );
      }

      // Verify the order items belong to the specified order before updating
      const { data: validItems, error: verifyError } = await supabase
        .from("order_items")
        .select("id")
        .eq("order_id", orderId)
        .in("id", itemIds);

      if (verifyError || !validItems || validItems.length !== itemIds.length) {
        return NextResponse.json(
          { error: "One or more items do not belong to the specified order" },
          { status: 403 }
        );
      }

      // Update order items to in_production
      const { error } = await supabase
        .from("order_items")
        .update({
          production_status: "IN_PRODUCTION",
          fulfillment_status: "assigned",
        })
        .in("id", itemIds);

      if (error) throw error;

      // Update order status
      await supabase
        .from("orders")
        .update({ status: "in_production" })
        .eq("id", orderId);

      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json(
        { error: "Failed to accept order" },
        { status: 500 }
      );
    }
  })(request);
}
