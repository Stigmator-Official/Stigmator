import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/api/admin-middleware";

export const dynamic = "force-dynamic";

// GET - Get fulfillment status for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, context) => {
    const supabase = await createRouteHandlerClient();
    const { id } = await params;

    try {
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
          .eq("id", itemId);

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
