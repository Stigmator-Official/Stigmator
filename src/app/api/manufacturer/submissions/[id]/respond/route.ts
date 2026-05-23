import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { generalRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success: limitSuccess } = await generalRateLimit(user.id);
    if (!limitSuccess) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Look up the manufacturer record for this user
    const { data: manufacturer, error: mfgError } = await supabase
      .from("fulfillment_partners")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (mfgError || !manufacturer) {
      return NextResponse.json({ error: "Manufacturer profile not found" }, { status: 403 });
    }

    const manufacturerId = manufacturer.id;

    // Verify the attempt belongs to this manufacturer and is pending
    const { data: attempt, error: attemptError } = await supabase
      .from("manufacturing_attempts")
      .select("id, product_design_id, status")
      .eq("id", id)
      .eq("manufacturer_id", manufacturerId)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (attempt.status !== "pending") {
      return NextResponse.json({ error: "Submission already responded to" }, { status: 409 });
    }

    const body = await request.json();
    const { action, declineReason, quote } = body;

    if (!action || !["accept", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (action === "accept") {
      // Update attempt to approved
      const { error: updateAttemptError } = await supabase
        .from("manufacturing_attempts")
        .update({ status: "approved", responded_at: now })
        .eq("id", id);

      if (updateAttemptError) {
        return NextResponse.json({ error: "Failed to approve submission" }, { status: 500 });
      }

      // Update product_design to reflect approval and assign manufacturer
      const { error: updatePdError } = await supabase
        .from("product_designs")
        .update({
          manufacturer_id: manufacturerId,
          manufacturer_approved_at: now,
          production_status: "in_production",
        })
        .eq("id", attempt.product_design_id);

      if (updatePdError) {
        return NextResponse.json({ error: "Failed to update garment" }, { status: 500 });
      }

      // Insert manufacturing quote if provided
      if (quote && typeof quote.costPerUnit === "number") {
        const { error: quoteError } = await supabase.from("manufacturing_quotes").insert({
          product_design_id: attempt.product_design_id,
          manufacturer_id: manufacturerId,
          cost_per_unit: Math.round(quote.costPerUnit),
          min_order_quantity: quote.minOrderQuantity ?? 1,
          setup_fee: quote.setupFee ?? 0,
          shipping_estimate: quote.shippingEstimate ? Math.round(quote.shippingEstimate) : null,
          turnaround_days: quote.turnaroundDays ?? null,
          is_accepted: true,
          accepted_at: now,
          valid_until: quote.validUntil ?? null,
        });

        if (quoteError) {
          // Non-fatal: quote insertion failed
        }
      }

      // Insert production_queue entry
      const { error: queueError } = await supabase.from("production_queue").insert({
        product_design_id: attempt.product_design_id,
        manufacturer_id: manufacturerId,
        status: "queued",
        quantity: quote?.minOrderQuantity ?? 1,
        priority: 0,
      });

      if (queueError) {
        // Non-fatal: production queue insertion failed
      }

      return NextResponse.json({ success: true, status: "accepted" });
    }

    if (action === "decline") {
      // Update attempt to declined
      const { error: updateAttemptError } = await supabase
        .from("manufacturing_attempts")
        .update({ status: "declined", decline_reason: declineReason || null, responded_at: now })
        .eq("id", id);

      if (updateAttemptError) {
        return NextResponse.json({ error: "Failed to decline submission" }, { status: 500 });
      }

      // Update product_design to reflect decline so it can be reassigned
      const { error: updatePdError } = await supabase
        .from("product_designs")
        .update({
          manufacturer_declined_at: now,
          manufacturer_decline_reason: declineReason || null,
          production_status: "manufacturer_declined",
        })
        .eq("id", attempt.product_design_id);

      if (updatePdError) {
        // Non-fatal: product design decline update failed
      }

      return NextResponse.json({ success: true, status: "declined" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to process response" }, { status: 500 });
  }
}
