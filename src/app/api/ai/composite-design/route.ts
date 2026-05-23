import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { aiRateLimit } from "@/lib/rate-limit";
import { compositeDesignOnGarmentServer } from "@/lib/garments/compositor-server";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/composite-design
 *
 * Composites a tattoo design onto a garment base image.
 * Supports two modes:
 * 1. "canvas" — Server-side Sharp compositing (fast, deterministic)
 * 2. "ai" — AI inpainting via Replicate/Stability (photorealistic, slower)
 *
 * Body: {
 *   garmentImageUrl: string,
 *   designImageUrl: string,
 *   placement: { x, y, scale, rotation, opacity, flipX, flipY },
 *   garmentColor?: string,
 *   mode?: "canvas" | "ai",
 *   printEffect?: "dtg" | "screen" | "embroidery" | "sublimation"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limit
    const { success: limitOk } = await aiRateLimit(user.id);
    if (!limitOk) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      garmentImageUrl,
      designImageUrl,
      placement,
      garmentColor,
      mode = "canvas",
      printEffect = "dtg",
      outputWidth = 1024,
      outputHeight = 1024,
    } = body;

    if (!garmentImageUrl || !designImageUrl || !placement) {
      return NextResponse.json(
        { success: false, error: "garmentImageUrl, designImageUrl, and placement are required" },
        { status: 400 }
      );
    }

    // Validate placement values
    if (
      typeof placement.x !== "number" ||
      typeof placement.y !== "number" ||
      typeof placement.scale !== "number"
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid placement data" },
        { status: 400 }
      );
    }

    if (mode === "ai") {
      // Try AI-powered compositing
      const result = await generateWithAI(
        garmentImageUrl,
        designImageUrl,
        placement,
        garmentColor,
        printEffect
      );
      if (result) {
        return NextResponse.json({
          success: true,
          imageUrl: result.imageUrl,
          mode: "ai",
          provider: result.provider,
        });
      }
      // Fall back to canvas mode
    }

    // Canvas mode: server-side Sharp compositing
    const [garmentBuffer, designBuffer] = await Promise.all([
      fetchImageBuffer(garmentImageUrl),
      fetchImageBuffer(designImageUrl),
    ]);

    const compositeBuffer = await compositeDesignOnGarmentServer(
      garmentBuffer,
      designBuffer,
      {
        x: placement.x,
        y: placement.y,
        scale: placement.scale,
        rotation: placement.rotation || 0,
        opacity: placement.opacity ?? 1,
        flipX: placement.flipX ?? false,
        flipY: placement.flipY ?? false,
      },
      garmentColor,
      outputWidth,
      outputHeight
    );

    // Upload composite to Supabase storage
    const timestamp = Date.now();
    const path = `product-mockups/${user.id}/${timestamp}_composite.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-mockups")
      .upload(path, compositeBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      // Return base64 if upload fails
      const base64 = `data:image/png;base64,${compositeBuffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        imageUrl: base64,
        mode: "canvas",
        uploaded: false,
      });
    }

    const { data: urlData } = supabase.storage
      .from("product-mockups")
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
      mode: "canvas",
      uploaded: true,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Compositing failed" },
      { status: 500 }
    );
  }
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function generateWithAI(
  garmentImageUrl: string,
  designImageUrl: string,
  placement: any,
  garmentColor?: string,
  printEffect?: string
): Promise<{ imageUrl: string; provider: string } | null> {
  const replicateKey = process.env.REPLICATE_API_TOKEN;
  const stabilityKey = process.env.STABILITY_API_KEY;

  if (!replicateKey && !stabilityKey) {
    return null;
  }

  // Build inpainting prompt
  const colorDesc = garmentColor || "the garment";
  const effectDesc = printEffect === "embroidery" ? "embroidered" : "printed";
  const prompt =
    `Professional product photography, ${effectDesc} design on ${colorDesc}, ` +
    `high-end fashion catalog, studio lighting, crisp details, e-commerce style, 8k`;

  // For now, canvas compositing is more reliable.
  // AI inpainting would require more sophisticated controlnet/pose matching.
  // Return null to use canvas fallback.
  return null;
}
