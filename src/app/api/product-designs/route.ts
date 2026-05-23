import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/database/server";

export const dynamic = "force-dynamic";

// Helper to upload base64 image to storage
async function uploadMockupImage(supabase: any, artistId: string, base64: string): Promise<string> {
  const base64Data = base64.split(",")[1];
  const mimeMatch = base64.match(/data:([^;]+);/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
  const extension = mimeType.split("/")[1] || "png";

  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  const timestamp = Date.now();
  const path = `product-mockups/${artistId}/${timestamp}_garment.${extension}`;

  const { data, error } = await supabase.storage.from("product-mockups").upload(path, blob, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Mockup upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from("product-mockups").getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(request.headers.get("authorization")?.replace("Bearer ", "") || "");

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      productId,
      designIds,
      placements,
      priceOverride,
      depositAmount,
      skipMockup,
      mockupImageBase64,
      variants,
      retailPrice,
      recoupConfig,
      limitedEditionConfig,
    } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (!Array.isArray(designIds) || designIds.length === 0) {
      return NextResponse.json({ error: "At least one design is required" }, { status: 400 });
    }

    // Validate designs belong to artist
    const { data: designs, error: designsError } = await supabase
      .from("designs")
      .select("id, artist_id")
      .in("id", designIds);

    if (designsError || !designs) {
      return NextResponse.json({ error: "Failed to verify designs" }, { status: 500 });
    }

    const invalidDesigns = designs.filter((d: any) => d.artist_id !== user.id);
    if (invalidDesigns.length > 0) {
      return NextResponse.json({ error: "One or more designs do not belong to you" }, { status: 403 });
    }

    // Build design placement JSON
    const designPlacement = {
      placements: (placements || []).map((p: any) => ({
        design_id: p.designId,
        area: p.zoneId || "center_chest",
        x: p.x || 0,
        y: p.y || 0,
        scale: p.scale || 1,
        rotation: p.rotation || 0,
      })),
    };

    // Handle mockup images
    let mockupImages: string[] = [];
    if (skipMockup && mockupImageBase64) {
      if (mockupImageBase64.startsWith("http")) {
        mockupImages = [mockupImageBase64];
      } else {
        const url = await uploadMockupImage(supabase, user.id, mockupImageBase64);
        mockupImages = [url];
      }
    }

    // Create product_designs record
    const { data: productDesign, error: pdError } = await supabase
      .from("product_designs")
      .insert({
        product_id: productId,
        design_id: designIds[0], // Primary design
        artist_id: user.id,
        mockup_images: mockupImages,
        design_placement: designPlacement,
        price_override: priceOverride || null,
        deposit_amount: depositAmount || 0,
        is_active: false, // Will be activated after manufacturer approval
        production_status: skipMockup ? "pending_manufacturer" : "draft",
        artist_retail_price: retailPrice || null,
        is_limited_run: limitedEditionConfig?.enabled || false,
        max_units: limitedEditionConfig?.totalUnits || null,
        deposit_recoup_enabled: recoupConfig?.enabled || false,
        deposit_recoup_sales_target: recoupConfig?.salesTarget || null,
      } as any)
      .select()
      .single();

    if (pdError || !productDesign) {
      return NextResponse.json({ error: "Failed to create garment" }, { status: 500 });
    }

    // Create garment_designs for all designs (supports multi-design)
    const garmentDesignInserts = designIds.map((designId: string, index: number) => ({
      product_design_id: productDesign.id,
      design_id: designId,
      artist_id: user.id,
      placement_area: placements?.find((p: any) => p.designId === designId)?.zoneId || "center_chest",
      placement_order: index,
      revenue_percentage: 100.0 / designIds.length,
    }));

    const { error: gdError } = await supabase.from("garment_designs").insert(garmentDesignInserts as any);
    if (gdError) {
      // Non-fatal: garment design association failed
    }

    // Copy design partnerships to garment-level partnerships
    for (const designId of designIds) {
      const { data: partnerships } = await supabase
        .from("design_partnerships")
        .select("id, artist_share, client_share, studio_share")
        .eq("design_id", designId)
        .eq("verification_status", "verified");

      if (partnerships && partnerships.length > 0) {
        const partnershipInserts = partnerships.map((dp: any) => ({
          product_design_id: productDesign.id,
          design_partnership_id: dp.id,
          artist_share: dp.artist_share,
          client_share: dp.client_share,
          studio_share: dp.studio_share,
        }));

        const { error: gdpError } = await supabase
          .from("garment_design_partnerships")
          .insert(partnershipInserts as any);

        if (gdpError) {
          // Non-fatal: partnership copy failed
        }
      }
    }

    // Create manufacturing attempts for all active fulfillment partners
    const { data: manufacturers } = await supabase
      .from("fulfillment_partners")
      .select("id")
      .eq("is_active", true);

    if (manufacturers && manufacturers.length > 0) {
      const attemptInserts = manufacturers.map((m: any) => ({
        product_design_id: productDesign.id,
        manufacturer_id: m.id,
        status: "pending",
      }));

      const { error: maError } = await supabase.from("manufacturing_attempts").insert(attemptInserts as any);
      if (maError) {
        // Non-fatal: manufacturing attempt creation failed
      }
    }

    return NextResponse.json({ productDesign });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
