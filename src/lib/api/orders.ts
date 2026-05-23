import { supabaseBrowser } from "@/lib/supabase/client"

export type OrderStatus = 
  | "pending_payment"
  | "payment_failed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"

export type OrderItem = {
  id: string
  order_id: string
  product_design_id: string
  quantity: number
  unit_price: number
  total_price: number
  size: string
  color: string
  product_design: {
    design: {
      title: string
      images: string[]
      artist: {
        id: string
        display_name: string
      }
    }
    product: {
      name: string
    }
  }
}

export type Order = {
  id: string
  customer_id: string
  status: OrderStatus
  subtotal: number
  shipping_amount: number
  tax_amount: number
  total: number
  shipping_address: {
    first_name: string
    last_name: string
    email: string
    phone?: string
    address: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  stripe_payment_intent_id?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export type CreateOrderInput = {
  items: {
    product_design_id: string
    quantity: number
    size: string
    color: string
  }[]
  shipping_address: Order["shipping_address"]
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to create order")
  }

  return response.json()
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(
        *,
        product_design:product_design_id(
          design:design_id(
            title,
            images,
            artist:artist_id(id, display_name)
          ),
          product:product_id(name)
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Error fetching order:", error)
    throw error
  }

  return data
}

export async function getUserOrders(): Promise<Order[]> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(
        *,
        product_design:product_design_id(
          design:design_id(
            title,
            images,
            artist:artist_id(id, display_name)
          ),
          product:product_id(name)
        )
      )
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user orders:", error)
    throw error
  }

  return data || []
}

export async function updateOrderPayment(
  orderId: string,
  paymentIntentId: string,
  status: OrderStatus
): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { error } = await supabase
    .from("orders")
    .update({
      stripe_payment_intent_id: paymentIntentId,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)

  if (error) {
    console.error("Error updating order payment:", error)
    throw error
  }
}

export async function cancelOrder(orderId: string): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Verify order belongs to user
  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .single()

  if (!order) throw new Error("Order not found")
  if (order.status !== "pending_payment" && order.status !== "confirmed") {
    throw new Error("Order cannot be cancelled")
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)

  if (error) {
    console.error("Error cancelling order:", error)
    throw error
  }
}
