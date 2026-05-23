import { NextRequest, NextResponse } from "next/server";
import { aiRateLimit } from "@/lib/rate-limit";

// Professional product photography prompts
const GARMENT_PROMPT_TEMPLATES: Record<string, (color: string, style: string) => string> = {
  tops: (color, style) => 
    `Professional ecommerce product photography of a ${color} ${style}, ` +
    `centered on pure white background (rgb 255,255,255), ` +
    `soft box studio lighting from 45-degree angles, ` +
    `subtle fabric texture visible, natural fabric draping, ` +
    `high-end fashion catalog style, 8k resolution, ` +
    `crisp details, commercial photography, ` +
    `no shadows on background, professionally color graded, ` +
    `garment flat lay or mannequin display, retail ready`,
  
  bottoms: (color, style) =>
    `Professional product photography of ${color} ${style}, ` +
    `flat lay on pure white background, ` +
    `even studio lighting, fabric texture detail, ` +
    `fashion ecommerce style, 8k, ` +
    `clean commercial photography, no props`,
  
  outerwear: (color, style) =>
    `High-end fashion photography of ${color} ${style}, ` +
    `on white seamless background, ` +
    `professional studio lighting setup, ` +
    `showing material texture and construction details, ` +
    `luxury apparel catalog style, 8k resolution`,
  
  headwear: (color, style) =>
    `Professional product shot of ${color} ${style}, ` +
    `white background, studio lighting, ` +
    `showing shape and details clearly, ` +
    `ecommerce photography style, 8k`,
  
  bags: (color, style) =>
    `Luxury product photography of ${color} ${style}, ` +
    `on pure white background, ` +
    `soft shadows, premium materials visible, ` +
    `high-end retail catalog style, 8k`,
  
  accessories: (color, style) =>
    `Professional ecommerce photo of ${color} ${style}, ` +
    `white background, studio lighting, ` +
    `product detail visible, commercial photography, 8k`,
};

const NEGATIVE_PROMPT = 
  `cartoon, illustration, drawing, painting, art, sketch, ` +
  `low quality, blurry, out of focus, noisy, grainy, ` +
  `cropped, cut off, partial garment, multiple garments, ` +
  `model, person, mannequin with head, hands, body parts, ` +
  `hanger, tag, label, price tag, packaging, ` +
  `colored background, gradient background, textured background, ` +
  `harsh shadows, overexposed, underexposed, ` +
  `distorted, warped, stretched fabric, ` +
  `busy composition, props, accessories, jewelry`;

export async function POST(req: NextRequest) {
  try {
    // Authenticate user before burning API credits
    const { createRouteHandlerClient } = await import("@/lib/supabase/server");
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Rate limit AI generation
    const { success: limitSuccess } = await aiRateLimit(user.id);
    if (!limitSuccess) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }
    
    const body = await req.json();
    const { garment, color = "black", style = "", category = "tops" } = body;

    // Build professional prompt
    const promptBuilder = GARMENT_PROMPT_TEMPLATES[category as keyof typeof GARMENT_PROMPT_TEMPLATES] 
      || GARMENT_PROMPT_TEMPLATES.tops;
    const prompt = promptBuilder(color, style || garment?.name || "garment");

    // Try providers in order
    const replicateKey = process.env.REPLICATE_API_TOKEN;
    const stabilityKey = process.env.STABILITY_API_KEY;

    if (replicateKey) {
      return await generateWithReplicatePro(prompt, NEGATIVE_PROMPT, replicateKey);
    }

    if (stabilityKey) {
      return await generateWithStabilityPro(prompt, NEGATIVE_PROMPT, stabilityKey);
    }

    // Demo mode - high quality mock
    return NextResponse.json({
      success: true,
      imageUrl: generateProfessionalMock(color, category),
      provider: "mock",
      prompt,
    });

  } catch {
    return NextResponse.json(
      { success: false, error: "Generation failed" },
      { status: 500 }
    );
  }
}

// Use RealVisXL - best for photorealistic product images
async function generateWithReplicatePro(
  prompt: string,
  negative_prompt: string,
  apiKey: string
) {
  // Replicate generation

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // RealVisXL v4.0 - best for photorealistic images
      version: "448c8662848d438f8c542be8d85a1a7e2ec6740d52cababb85d9add7cb8dd02b",
      input: {
        prompt,
        negative_prompt,
        width: 1024,
        height: 1024,
        num_inference_steps: 40,
        guidance_scale: 7.5,
        scheduler: "DPMSolverMultistep",
        refine: "expert_ensemble_refiner",
        high_noise_frac: 0.8,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Replicate error: ${err}`);
  }

  const prediction = await response.json();
  const result = await pollReplicatePrediction(prediction.id, apiKey);

  return NextResponse.json({
    success: true,
    imageUrl: result,
    provider: "replicate-realvis",
  });
}

// Stability AI with better settings
async function generateWithStabilityPro(
  prompt: string,
  negative_prompt: string,
  apiKey: string
) {
  // Stability generation

  const response = await fetch(
    "https://api.stability.ai/v2beta/stable-image/generate/sd3",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        negative_prompt,
        width: 1024,
        height: 1024,
        seed: Math.floor(Math.random() * 1000000),
        cfg_scale: 7,
        steps: 40,
        samples: 1,
        style_preset: "photographic",
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Stability error: ${err}`);
  }

  const data = await response.json();
  
  // Handle base64 response
  if (data.artifacts && data.artifacts[0]) {
    const base64Image = data.artifacts[0].base64;
    return NextResponse.json({
      success: true,
      imageUrl: `data:image/png;base64,${base64Image}`,
      provider: "stability-sd3",
    });
  }

  throw new Error("Invalid response from Stability AI");
}

async function pollReplicatePrediction(id: string, apiKey: string, maxAttempts = 60): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { "Authorization": `Token ${apiKey}` },
    });

    const prediction = await response.json();

    if (prediction.status === "succeeded") {
      return prediction.output[0];
    }

    if (prediction.status === "failed") {
      throw new Error(prediction.error || "Generation failed");
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error("Timeout waiting for generation");
}

// Professional mock images - use Unsplash for realistic garment photos
function generateProfessionalMock(color: string, category: string): string {
  const mockImages: Record<string, string[]> = {
    tops: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1024&h=1024&fit=crop", // white tee
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1024&h=1024&fit=crop", // black tee
    ],
    bottoms: [
      "https://images.unsplash.com/photo-1542272617-08f086302542?w=1024&h=1024&fit=crop", // jeans
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1024&h=1024&fit=crop", // pants
    ],
    outerwear: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1024&h=1024&fit=crop", // jacket
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1024&h=1024&fit=crop", // hoodie
    ],
    headwear: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=1024&h=1024&fit=crop", // cap
    ],
    bags: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1024&h=1024&fit=crop", // tote
    ],
    accessories: [
      "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=1024&h=1024&fit=crop",
    ],
  };

  const images = mockImages[category] || mockImages.tops;
  const index = color.length % images.length;
  return images[index];
}
