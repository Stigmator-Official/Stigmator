import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/api/admin-middleware";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return withAuth(async (req, context) => {
    const supabase = await createRouteHandlerClient();
    const userId = context.user.id;

    try {
      // Get partner's design partnerships
      const { data: partnerships, error: partnershipError } = await supabase
        .from("design_partnerships")
        .select("id, design_id, artist_share, client_share, studio_share, total_earnings")
        .eq("partner_id", userId)
        .eq("verification_status", "verified");

      if (partnershipError) throw partnershipError;

      // Get earnings breakdown for this partner
      const { data: earnings, error: earningsError } = await supabase
        .from("earnings_breakdown")
        .select(`
          amount,
          paid,
          created_at,
          order_item:order_item_id(
            product_design:product_design_id(
              design:design_id(id, title)
            )
          )
        `)
        .eq("recipient_id", userId)
        .eq("recipient_type", "client")
        .order("created_at", { ascending: false });

      if (earningsError) throw earningsError;

      let totalEarnings = 0;
      let pendingEarnings = 0;
      let paidEarnings = 0;

      earnings?.forEach((e: any) => {
        totalEarnings += e.amount;
        if (!e.paid) pendingEarnings += e.amount;
        if (e.paid) paidEarnings += e.amount;
      });

      return NextResponse.json({
        totalEarnings,
        pendingEarnings,
        paidEarnings,
        partnerships: partnerships || [],
        recentEarnings: earnings?.slice(0, 10).map((e: any) => ({
          amount: e.amount,
          paid: e.paid,
          created_at: e.created_at,
          design_title: e.order_item?.product_design?.design?.title || "Unknown",
        })) || [],
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch partner earnings" },
        { status: 500 }
      );
    }
  })(request);
}
