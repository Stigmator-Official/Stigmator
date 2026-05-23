import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { generalRateLimit } from "@/lib/rate-limit";

export type CreateOrderServerInput = {
  items: {
    product_design_id: string;
    quantity: number;
    size: string;
    color: string;
  }[];
  shipping_address: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Rate limit authenticated users
    if (user) {
      const { success: limitSuccess } = await generalRateLimit(user.id)
      if (!limitSuccess) {
        return NextResponse.json({ message: "Rate limit exceeded" }, { status: 429 })
      }
    }

    if (authError || !user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateOrderServerInput;
    const { items, shipping_address } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    if (!shipping_address || !shipping_address.email || !shipping_address.address) {
      return NextResponse.json(
        { message: "Valid shipping address is required" },
        { status: 400 }
      );
    }

    // Validate quantities
    for (const item of items) {
      if (!item.product_design_id || typeof item.quantity !== "number" || item.quantity < 1) {
        return NextResponse.json(
          { message: "Invalid item data" },
          { status: 400 }
        );
      }
    }

    // Fetch product designs to get product IDs and price overrides
    const productDesignIds = items.map((item) => item.product_design_id);
    const { data: productDesigns, error: pdError } = await supabase
      .from("product_designs")
      .select("id, price_override, product_id")
      .in("id", productDesignIds);

    if (pdError || !productDesigns || productDesigns.length !== productDesignIds.length) {
      return NextResponse.json(
        { message: "Failed to verify one or more products" },
        { status: 400 }
      );
    }

    // Fetch base prices from products
    const productIds = productDesigns.map((pd: any) => pd.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, base_price")
      .in("id", productIds);

    if (productsError || !products) {
      return NextResponse.json(
        { message: "Failed to verify product prices" },
        { status: 500 }
      );
    }

    const productPriceMap = new Map(products.map((p: any) => [p.id, p.base_price || 0]));
    const designPriceMap = new Map(
      productDesigns.map((pd: any) => {
        const basePrice = productPriceMap.get(pd.product_id) || 0;
        const finalPrice = pd.price_override ?? basePrice;
        return [pd.id, finalPrice];
      })
    );

    // Calculate totals server-side
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const unitPrice = designPriceMap.get(item.product_design_id);
      if (unitPrice == null || typeof unitPrice !== "number" || unitPrice < 0) {
        return NextResponse.json(
          { message: "Invalid product price detected" },
          { status: 400 }
        );
      }
      const itemTotal = (unitPrice as number) * item.quantity;
      subtotal += itemTotal;
      orderItems.push({
        product_design_id: item.product_design_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        unit_price: unitPrice,
        total_price: itemTotal,
      });
    }

    const shipping = subtotal >= 7500 ? 0 : 699;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + shipping + tax;

    // Create order and items atomically using a database function
    // Fallback: manual insert with rollback on failure
    let orderId: string | null = null;
    
    try {
      // Step 1: Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: user.id,
          status: "pending_payment",
          subtotal,
          shipping_amount: shipping,
          tax_amount: tax,
          total,
          shipping_address: shipping_address as unknown as undefined,
        })
        .select()
        .single();

      if (orderError || !order) {
        return NextResponse.json(
          { message: "Failed to create order" },
          { status: 500 }
        );
      }

      orderId = order.id;

      // Step 2: Create order items
      const { error: itemsError } = await supabase.from("order_items").insert(
        orderItems.map((item) => ({
          ...item,
          order_id: order.id,
        }))
      );

      if (itemsError) {
        // Rollback: delete the orphaned order
        await supabase.from("orders").delete().eq("id", order.id);
        return NextResponse.json(
          { message: "Failed to create order items" },
          { status: 500 }
        );
      }

      return NextResponse.json(order);
    } catch {
      // Ensure rollback if order was created before exception
      if (orderId) {
        await supabase.from("orders").delete().eq("id", orderId);
      }
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
