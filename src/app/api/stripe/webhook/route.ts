import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createRouteHandlerClient } from "@/lib/supabase/server"
import { webhookRateLimit } from "@/lib/rate-limit"
import { calculateRevenueSplit } from "@/lib/api/revenue"

// Lazy init Stripe to avoid build errors
let stripe: Stripe | null = null
function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia" as any,
    })
  }
  return stripe
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const identifier = request.ip ?? request.headers.get("x-forwarded-for") ?? "unknown"
  const { success: limitSuccess } = await webhookRateLimit(identifier)
  if (!limitSuccess) {
    return NextResponse.json({ message: "Rate limit exceeded" }, { status: 429 })
  }

  const payload = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { message: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured")
    return NextResponse.json(
      { message: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  const stripeClient = getStripe()
  if (!stripeClient) {
    return NextResponse.json(
      { message: "Stripe not configured" },
      { status: 503 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripeClient.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { message: "Invalid signature" },
      { status: 400 }
    )
  }

  const supabase = await createRouteHandlerClient()

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.order_id

        if (!orderId) {
          console.error("Payment intent missing order_id metadata")
          return NextResponse.json({ received: true })
        }

        // Fetch order with items
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select(`
            id,
            status,
            items:order_items(id, product_design_id, unit_price, total_price, quantity)
          `)
          .eq("id", orderId)
          .single()

        if (orderError || !order) {
          console.error("Order not found for webhook:", orderError)
          return NextResponse.json({ received: true })
        }

        // Idempotency check: skip if already confirmed
        if (order.status === "confirmed" || order.status === "paid") {
          return NextResponse.json({ received: true })
        }

        // Update order status to confirmed
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)

        if (updateError) {
          console.error("Error updating order status:", updateError)
        }

        // Process each order item: sales counts + earnings
        for (const item of order.items || []) {
          // Fetch product design with partnership info
          const { data: productDesign } = await supabase
            .from("product_designs")
            .select(`
              total_sales,
              units_sold,
              is_limited_run,
              artist_id,
              deposit_amount,
              deposit_recoup_enabled,
              deposit_recouped_amount,
              design:design_id(
                id,
                partnerships:design_partnerships(
                  partner_id,
                  artist_share,
                  client_share,
                  studio_share,
                  verification_status
                )
              )
            `)
            .eq("id", item.product_design_id)
            .single()

          if (productDesign) {
            const updates: any = {
              total_sales: (productDesign.total_sales || 0) + item.quantity,
            }
            if (productDesign.is_limited_run) {
              updates.units_sold = (productDesign.units_sold || 0) + item.quantity
            }
            await supabase
              .from("product_designs")
              .update(updates)
              .eq("id", item.product_design_id)

            // Calculate earnings using TypeScript logic (not RPC)
            const saleAmount = item.total_price || item.unit_price * item.quantity
            const partnerships = (productDesign.design?.partnerships || [])
              .filter((p: any) => p.verification_status === "verified")
              .map((p: any) => ({
                partner_id: p.partner_id,
                artist_share: p.artist_share,
                client_share: p.client_share,
                studio_share: p.studio_share,
              }))

            const calculation = calculateRevenueSplit(
              saleAmount,
              partnerships,
              productDesign.artist_id,
              {
                depositRecoupEnabled: productDesign.deposit_recoup_enabled,
                depositAmount: productDesign.deposit_amount,
                depositRecoupedAmount: productDesign.deposit_recouped_amount,
              }
            )

            // Insert earnings breakdown records
            const earningsRecords = calculation.recipients.map((recipient) => ({
              order_item_id: item.id,
              sale_amount: saleAmount,
              platform_fee: calculation.platform_fee,
              remaining_amount: calculation.remaining,
              recipient_id: recipient.recipient_id,
              recipient_type: recipient.recipient_type,
              amount: recipient.amount,
              percentage: parseFloat(recipient.percentage.toFixed(2)),
              paid: false,
            }))

            if (earningsRecords.length > 0) {
              const { error: breakdownError } = await supabase
                .from("earnings_breakdown")
                .insert(earningsRecords)

              if (breakdownError) {
                // Log but don't fail — webhook should acknowledge receipt
              }
            }
          }
        }

        // Create activity log
        await supabase.from("activity_logs").insert({
          entity_type: "order",
          entity_id: orderId,
          action: "payment_succeeded",
          metadata: {
            payment_intent_id: paymentIntent.id,
            amount: paymentIntent.amount,
          },
        })

        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.order_id

        if (orderId) {
          await supabase
            .from("orders")
            .update({
              status: "payment_failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId)

          await supabase.from("activity_logs").insert({
            entity_type: "order",
            entity_id: orderId,
            action: "payment_failed",
            metadata: {
              payment_intent_id: paymentIntent.id,
              error: paymentIntent.last_payment_error?.message,
            },
          })
        }

        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string

        // Find order by payment intent ID
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .single()

        if (order) {
          await supabase
            .from("orders")
            .update({
              status: "refunded",
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id)

          await supabase.from("activity_logs").insert({
            entity_type: "order",
            entity_id: order.id,
            action: "refunded",
            metadata: {
              amount: charge.amount_refunded,
            },
          })

          // Mark unpaid earnings as cancelled
          await supabase
            .from("earnings_breakdown")
            .update({ paid: false })
            .in(
              "order_item_id",
              (
                await supabase
                  .from("order_items")
                  .select("id")
                  .eq("order_id", order.id)
              ).data?.map((i: any) => i.id) || []
            )
            .eq("paid", false)
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    )
  }
}

// Disable body parsing for webhooks
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'
