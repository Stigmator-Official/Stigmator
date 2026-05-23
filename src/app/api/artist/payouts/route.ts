import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { withAuth, forbiddenResponse } from "@/lib/api/admin-middleware";

export const dynamic = "force-dynamic";

// GET - List payout history
export async function GET(request: NextRequest) {
  return withAuth(async (req, context) => {
    if (context.role !== "ARTIST" && context.role !== "ADMIN" && context.role !== "SUPER_ADMIN") {
      return forbiddenResponse("Artist access required");
    }

    const supabase = await createRouteHandlerClient();
    const userId = context.user.id;

    try {
      const { data: payouts, error } = await supabase
        .from("payouts")
        .select("*")
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get available balance (pending earnings)
      const { data: earnings } = await supabase
        .from("earnings_breakdown")
        .select("amount")
        .eq("recipient_id", userId)
        .eq("paid", false);

      const availableBalance = earnings?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;

      return NextResponse.json({
        availableBalance,
        payouts: payouts || [],
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch payouts" },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Request a new payout
export async function POST(request: NextRequest) {
  return withAuth(async (req, context) => {
    if (context.role !== "ARTIST" && context.role !== "ADMIN" && context.role !== "SUPER_ADMIN") {
      return forbiddenResponse("Artist access required");
    }

    const supabase = await createRouteHandlerClient();
    const userId = context.user.id;

    try {
      const body = await req.json();
      const { amount, stripeAccountId } = body;

      if (!amount || amount < 1000) {
        return NextResponse.json(
          { error: "Minimum payout amount is $10.00" },
          { status: 400 }
        );
      }

      // Check available balance
      const { data: earnings } = await supabase
        .from("earnings_breakdown")
        .select("amount")
        .eq("recipient_id", userId)
        .eq("paid", false);

      const availableBalance = earnings?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;

      if (amount > availableBalance) {
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 }
        );
      }

      // Create payout record
      const { data: payout, error } = await supabase
        .from("payouts")
        .insert({
          recipient_id: userId,
          amount,
          status: "pending",
          stripe_account_id: stripeAccountId,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        payout,
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to create payout" },
        { status: 500 }
      );
    }
  })(request);
}
