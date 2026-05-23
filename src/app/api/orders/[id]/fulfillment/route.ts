import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { generalRateLimit } from "@/lib/rate-limit";
import { isAdminRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// GET - Get fulfillment status for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get user role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = isAdminRole(userData?.role as any);

    // Check if user is a manufacturer
    const { data: manufacturer } = await supabase
      .from("fulfillment_partners")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    const isManufacturer = !!manufacturer;

    // Verify access: admins and manufacturers can access any order; customers only their own
    if (!isAdmin && !isManufacturer) {
      const { data: order } = await supabase
        .from("orders")
        .select("customer_id")
        .eq("id", id)
        .single();
      if (order?.customer_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
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
}

// POST - Update fulfillment status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit
    const { success: limitOk } = await generalRateLimit(user.id);
    if (!limitOk) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { id } = await params;

    // Get user role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = isAdminRole(userData?.role as any);

    // Check if user is a manufacturer
    const { data: manufacturer } = await supabase
      .from("fulfillment_partners")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    const manufacturerId = manufacturer?.id;
    if (!manufacturerId && !isAdmin) {
      return NextResponse.json({ error: "Manufacturer access required" }, { status: 403 });
    }

    const body = await request.json();
    const { status, trackingNumber, itemId } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // For non-admins, verify this manufacturer is assigned to the item
    if (!isAdmin && manufacturerId && itemId) {
      const { data: assignment } = await supabase
        .from("order_items")
        .select("id, product_design:product_design_id(manufacturing_attempts!inner(manufacturer_id))")
        .eq("id", itemId)
        .eq("order_id", id)
        .eq("product_design.manufacturing_attempts.manufacturer_id", manufacturerId)
        .single();
      
      if (!assignment) {
        return NextResponse.json({ error: "You are not assigned to this item" }, { status: 403 });
      }
    }

    // Update order item fulfillment status
    if (itemId) {
      const updates: Record<string, unknown> = {
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

    const allShipped = items?.every((i: { fulfillment_status: string }) => i.fulfillment_status === "shipped");
    const allDelivered = items?.every((i: { fulfillment_status: string }) => i.fulfillment_status === "delivered");

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
}
