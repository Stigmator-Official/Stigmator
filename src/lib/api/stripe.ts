import { loadStripe, Stripe } from "@stripe/stripe-js"

let stripePromise: Promise<Stripe | null>

export function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

export type PaymentIntentResponse = {
  clientSecret: string
  paymentIntentId: string
}

export async function createPaymentIntent(
  orderId: string
): Promise<PaymentIntentResponse> {
  const response = await fetch("/api/stripe/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_id: orderId,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to create payment intent")
  }

  return response.json()
}

export async function confirmCardPayment(
  clientSecret: string,
  paymentMethod: {
    card: any
    billing_details?: {
      name?: string
      email?: string
      phone?: string
      address?: {
        line1?: string
        city?: string
        state?: string
        postal_code?: string
        country?: string
      }
    }
  }
): Promise<{ error?: { message: string } | null; paymentIntent?: any }> {
  const stripe = await getStripe()
  if (!stripe) throw new Error("Stripe not initialized")

  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: paymentMethod,
  })

  return result as { error?: { message: string } | null; paymentIntent?: any }
}

export async function confirmPayment(
  clientSecret: string
): Promise<{ error?: { message: string } | null; paymentIntent?: any }> {
  const stripe = await getStripe()
  if (!stripe) throw new Error("Stripe not initialized")

  // For payment intents that are already confirmed on the server
  const result = await stripe.retrievePaymentIntent(clientSecret)
  
  if (result.error) {
    return { error: { message: result.error.message || "Unknown error" } }
  }

  // If not yet confirmed, confirm it
  if (result.paymentIntent?.status === "requires_confirmation") {
    const confirmResult = await stripe.confirmCardPayment(clientSecret)
    return {
      error: confirmResult.error ? { message: confirmResult.error.message || "Payment failed" } : null,
      paymentIntent: confirmResult.paymentIntent,
    }
  }

  return { paymentIntent: result.paymentIntent }
}
