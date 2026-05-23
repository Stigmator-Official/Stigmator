import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { generalRateLimit } from "@/lib/rate-limit";
import { isAdminRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// GET - List orders assigned to manufacturer/fulfillment partner
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success: limitOk } = await generalRateLimit(user.id);
    if (!limitOk) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Look up the manufacturer record for this user (admins bypass this check)
    const { data: manufacturer } = await supabase
      .from("fulfillment_partners")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = isAdminRole(userData?.role as any);
    if (!manufacturer && !isAdmin) {
      return NextResponse.json({ error: "Manufacturer access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        total,
        created_at,
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
}

// POST - Accept an order for fulfillment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success: limitOk } = await generalRateLimit(user.id);
    if (!limitOk) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Look up the manufacturer record for this user
    const { data: manufacturer } = await supabase
      .from("fulfillment_partners")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = isAdminRole(userData?.role as any);
    const manufacturerId = manufacturer?.id;
    if (!manufacturerId && !isAdmin) {
      return NextResponse.json({ error: "Manufacturer access required" }, { status: 403 });
    }

    const body = await request.json();
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

    // For non-admins, verify this manufacturer is assigned to these items
    if (!isAdmin && manufacturerId) {
      const { data: assignedItems } = await supabase
        .from("order_items")
        .select("id, product_design:product_design_id(manufacturing_attempts!inner(manufacturer_id))")
        .eq("order_id", orderId)
        .in("id", itemIds)
        .eq("product_design.manufacturing_attempts.manufacturer_id", manufacturerId);
      
      if (!assignedItems || assignedItems.length !== itemIds.length) {
        return NextResponse.json(
          { error: "You are not assigned to fulfill these items" },
          { status: 403 }
        );
      }
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
}
