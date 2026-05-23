import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createRouteHandlerClient } from "@/lib/supabase/server"
import { generalRateLimit } from "@/lib/rate-limit"

// Lazy init Stripe to avoid build errors when env var is missing
let stripe: Stripe | null = null
function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia" as any,
    })
  }
  return stripe
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Rate limit authenticated users
    if (user) {
      const { success: limitSuccess } = await generalRateLimit(user.id)
      if (!limitSuccess) {
        return NextResponse.json({ message: "Rate limit exceeded" }, { status: 429 })
      }
    }
    
    const { order_id } = await request.json()

    if (!order_id) {
      return NextResponse.json(
        { message: "Missing order_id" },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify order belongs to user and is pending payment
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status, total")
      .eq("id", order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      )
    }

    if (order.user_id !== user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    if (order.status !== "pending_payment") {
      return NextResponse.json(
        { message: "Order is not pending payment" },
        { status: 400 }
      )
    }

    // Create Stripe PaymentIntent with database-verified amount
    const stripeClient = getStripe()
    if (!stripeClient) {
      return NextResponse.json(
        { message: "Stripe not configured" },
        { status: 503 }
      )
    }
    
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: order.total,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_id,
        user_id: user.id,
      },
    })

    // Update order with payment intent ID
    await supabase
      .from("orders")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch {
    return NextResponse.json(
      { message: "Failed to create payment intent" },
      { status: 500 }
    )
  }
}
