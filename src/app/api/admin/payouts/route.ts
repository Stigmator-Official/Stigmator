import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { withAdmin } from "@/lib/api/admin-middleware";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// Lazy init Stripe to avoid build errors
let stripe: Stripe | null = null;
function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia" as any,
    });
  }
  return stripe;
}

// GET - List all pending payouts
export async function GET(request: NextRequest) {
  return withAdmin(async (req, context) => {
    const supabase = await createRouteHandlerClient();

    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status") || "pending";

      const { data: payouts, error } = await supabase
        .from("payouts")
        .select(`
          *,
          recipient:recipient_id(id, display_name, email, full_name)
        `)
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return NextResponse.json({ payouts: payouts || [] });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch payouts" },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Approve or reject a payout
export async function POST(request: NextRequest) {
  return withAdmin(async (req, context) => {
    const supabase = await createRouteHandlerClient();

    try {
      const body = await req.json();
      const { payoutId, action, transferId } = body;

      if (!payoutId || !action) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      if (action === "approve") {
        // Fetch payout with recipient details
        const { data: payout, error: payoutError } = await supabase
          .from("payouts")
          .select("recipient_id, amount, stripe_account_id")
          .eq("id", payoutId)
          .single();

        if (payoutError || !payout) {
          return NextResponse.json(
            { error: "Payout not found" },
            { status: 404 }
          );
        }

        let stripeTransferId = transferId;
        const stripeClient = getStripe();

        // Create Stripe transfer if configured
        if (stripeClient && payout.stripe_account_id && !transferId) {
          try {
            const transfer = await stripeClient.transfers.create({
              amount: payout.amount,
              currency: "usd",
              destination: payout.stripe_account_id,
              metadata: {
                payout_id: payoutId,
                recipient_id: payout.recipient_id,
              },
            });
            stripeTransferId = transfer.id;
            logger.info(`Stripe transfer created: ${transfer.id} for payout ${payoutId}`);
          } catch (stripeErr: any) {
            logger.error("Stripe transfer failed:", stripeErr.message);
            return NextResponse.json(
              { error: "Stripe transfer failed", details: stripeErr.message },
              { status: 502 }
            );
          }
        }

        // Update payout status
        const { error } = await supabase
          .from("payouts")
          .update({
            status: "processing",
            processed_at: new Date().toISOString(),
            stripe_transfer_id: stripeTransferId || null,
          })
          .eq("id", payoutId);

        if (error) throw error;

        // Mark associated earnings as paid
        const { data: earnings } = await supabase
          .from("earnings_breakdown")
          .select("id, amount")
          .eq("recipient_id", payout.recipient_id)
          .eq("paid", false)
          .order("created_at", { ascending: true });

        let remaining = payout.amount;
        const toUpdate: string[] = [];

        for (const earning of earnings || []) {
          if (remaining <= 0) break;
          toUpdate.push(earning.id);
          remaining -= earning.amount;
        }

        if (toUpdate.length > 0) {
          await supabase
            .from("earnings_breakdown")
            .update({ paid: true, paid_at: new Date().toISOString(), payout_id: payoutId })
            .in("id", toUpdate);
        }

        return NextResponse.json({ success: true, transferId: stripeTransferId });
      }

      if (action === "reject") {
        const { error } = await supabase
          .from("payouts")
          .update({
            status: "failed",
            processed_at: new Date().toISOString(),
          })
          .eq("id", payoutId);

        if (error) throw error;

        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    } catch {
      return NextResponse.json(
        { error: "Failed to process payout" },
        { status: 500 }
      );
    }
  })(request);
}
