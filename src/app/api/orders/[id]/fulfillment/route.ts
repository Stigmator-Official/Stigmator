import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { withAuth, forbiddenResponse } from "@/lib/api/admin-middleware";
import { generalRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const FULFILLMENT_ROLES = ["MANUFACTURER", "ADMIN", "SUPER_ADMIN"];

async function canAccessOrder(
  supabase: any,
  orderId: string,
  userId: string,
  role: string
): Promise<boolean> {
  // Admins and manufacturers can access any order
  if (FULFILLMENT_ROLES.includes(role)) return true;
  // Customers can only access their own orders
  const { data: order } = await supabase
    .from("orders")
    .select("customer_id")
    .eq("id", orderId)
    .single();
  return order?.customer_id === userId;
}

// GET - Get fulfillment status for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, context) => {
    const supabase = await createRouteHandlerClient();
    const { id } = await params;

    try {
      // Verify access
      const hasAccess = await canAccessOrder(supabase, id, context.user.id, context.role);
      if (!hasAccess) {
        return forbiddenResponse("You do not have permission to view this order");
      }

      const { data: order, error } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          tracking_number,
          shipped_at,
          delivered_at,
          items:order_items(
            id,
            production_status,
            fulfillment_status,
            print_file_url,
            product_design:product_design_id(
              design:design_id(title)
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error || !order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      return NextResponse.json({ order });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch fulfillment status" },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Update fulfillment status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, context) => {
    // Rate limit
    const { success: limitOk } = await generalRateLimit(context.user.id);
    if (!limitOk) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Only manufacturer, admin, or super admin can update fulfillment
    if (!FULFILLMENT_ROLES.includes(context.role)) {
      return forbiddenResponse("Manufacturer access required");
    }

    const supabase = await createRouteHandlerClient();
    const { id } = await params;

    try {
      const body = await req.json();
      const { status, trackingNumber, itemId } = body;

      if (!status) {
        return NextResponse.json(
          { error: "Status is required" },
          { status: 400 }
        );
      }

      // Update order item fulfillment status
      if (itemId) {
        const updates: any = {
          fulfillment_status: status,
        };

        if (status === "shipped" && trackingNumber) {
          updates.tracking_number = trackingNumber;
        }

        const { error } = await supabase
          .from("order_items")
          .update(updates)
          .eq("id", itemId)
          .eq("order_id", id); // Ensure item belongs to this order

        if (error) throw error;
      }

      // Update overall order status if all items are shipped/delivered
      const { data: items } = await supabase
        .from("order_items")
        .select("fulfillment_status")
        .eq("order_id", id);

      const allShipped = items?.every((i: any) => i.fulfillment_status === "shipped");
      const allDelivered = items?.every((i: any) => i.fulfillment_status === "delivered");

      if (allDelivered) {
        await supabase
          .from("orders")
          .update({ status: "delivered", delivered_at: new Date().toISOString() })
          .eq("id", id);
      } else if (allShipped) {
        await supabase
          .from("orders")
          .update({ status: "shipped", shipped_at: new Date().toISOString() })
          .eq("id", id);
      }

      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json(
        { error: "Failed to update fulfillment status" },
        { status: 500 }
      );
    }
  })(request);
}
