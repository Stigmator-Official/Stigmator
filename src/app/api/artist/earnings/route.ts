import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { withAuth, forbiddenResponse } from "@/lib/api/admin-middleware";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return withAuth(async (req, context) => {
    if (context.role !== "ARTIST" && context.role !== "ADMIN" && context.role !== "SUPER_ADMIN") {
      return forbiddenResponse("Artist access required");
    }

    const supabase = await createRouteHandlerClient();
    const userId = context.user.id;

    try {
      // Get earnings summary
      const { data: earnings, error: earningsError } = await supabase
        .from("earnings_breakdown")
        .select("amount, paid, created_at")
        .eq("recipient_id", userId);

      if (earningsError) throw earningsError;

      let totalEarnings = 0;
      let pendingEarnings = 0;
      let paidEarnings = 0;

      earnings?.forEach((e: any) => {
        totalEarnings += e.amount;
        if (!e.paid) pendingEarnings += e.amount;
        if (e.paid) paidEarnings += e.amount;
      });

      // Get earnings by design
      const { data: designEarnings } = await supabase
        .from("earnings_breakdown")
        .select(`
          amount,
          order_item:order_item_id(
            product_design:product_design_id(
              design:design_id(id, title)
            )
          )
        `)
        .eq("recipient_id", userId)
        .eq("recipient_type", "artist");

      const designMap = new Map<string, { title: string; amount: number }>();
      designEarnings?.forEach((e: any) => {
        const design = e.order_item?.product_design?.design;
        if (design) {
          const existing = designMap.get(design.id);
          if (existing) {
            existing.amount += e.amount;
          } else {
            designMap.set(design.id, { title: design.title, amount: e.amount });
          }
        }
      });

      // Get recent sales
      const { data: recentSales } = await supabase
        .from("earnings_breakdown")
        .select(`
          amount,
          created_at,
          order_item:order_item_id(
            product_design:product_design_id(
              design:design_id(title)
            )
          )
        `)
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      // Get total sales count
      const { data: salesData } = await supabase
        .from("order_items")
        .select("quantity, product_design:product_design_id(artist_id)")
        .eq("product_design.artist_id", userId);

      const totalSales = salesData?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;

      return NextResponse.json({
        totalEarnings,
        pendingEarnings,
        paidEarnings,
        totalSales,
        designEarnings: Array.from(designMap.entries()).map(([id, data]) => ({
          design_id: id,
          design_title: data.title,
          amount: data.amount,
        })).sort((a, b) => b.amount - a.amount),
        recentSales: recentSales?.map((s: any) => ({
          amount: s.amount,
          created_at: s.created_at,
          design_title: s.order_item?.product_design?.design?.title || "Unknown",
        })) || [],
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch earnings" },
        { status: 500 }
      );
    }
  })(request);
}
