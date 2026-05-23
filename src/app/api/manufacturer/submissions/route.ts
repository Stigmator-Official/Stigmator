import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { generalRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
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

    // Fetch manufacturing attempts for this manufacturer
    const { data: attempts, error: attemptsError } = await supabase
      .from("manufacturing_attempts")
      .select(`
        id,
        status,
        submitted_at,
        responded_at,
        decline_reason,
        product_design:product_design_id (
          id,
          price_override,
          deposit_amount,
          mockup_images,
          design_placement,
          production_status,
          product:product_id (
            id,
            name,
            category:category_id (name)
          ),
          design:design_id (
            id,
            title,
            artist:artist_id (
              id,
              username,
              full_name
            )
          )
        )
      `)
      .eq("manufacturer_id", manufacturerId)
      .order("submitted_at", { ascending: false })
      .limit(200);

    if (attemptsError) {
      return NextResponse.json({ error: "Failed to load submissions" }, { status: 500 });
    }

    // Fetch accepted stats for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: acceptedThisMonth, error: countError } = await supabase
      .from("manufacturing_attempts")
      .select("id", { count: "exact", head: true })
      .eq("manufacturer_id", manufacturerId)
      .eq("status", "approved")
      .gte("responded_at", startOfMonth.toISOString());

    if (countError) {
      // Non-fatal: stats count failed
    }

    // Map to dashboard-friendly shape
    const submissions = (attempts || []).map((a: any) => {
      const pd = a.product_design;
      const product = pd?.product;
      const design = pd?.design;
      const artist = design?.artist;

      let status: "pending" | "accepted" | "declined" | "in_production" = a.status;
      if (a.status === "approved" && pd?.production_status === "in_production") {
        status = "in_production";
      } else if (a.status === "approved") {
        status = "accepted";
      } else if (a.status === "declined") {
        status = "declined";
      } else {
        status = "pending";
      }

      return {
        id: a.id,
        garmentId: pd?.id || "",
        designName: design?.title || "Untitled Design",
        garmentType: product?.name || "Unknown Garment",
        artistName: artist?.full_name || artist?.username || "Unknown Artist",
        artistRating: 0,
        retailPrice: (pd?.price_override || 0) / 100,
        depositAmount: (pd?.deposit_amount || 0) / 100,
        complexity: "standard",
        submittedAt: a.submitted_at,
        status,
        priority: "standard",
        mockupImages: pd?.mockup_images || [],
        designPlacement: pd?.design_placement || null,
        productDesignId: pd?.id,
      };
    });

    return NextResponse.json({
      submissions,
      stats: {
        pendingReview: submissions.filter((s: any) => s.status === "pending").length,
        acceptedThisMonth: acceptedThisMonth || 0,
        totalEarned: 0,
        avgResponseTime: "—",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load submissions" }, { status: 500 });
  }
}
