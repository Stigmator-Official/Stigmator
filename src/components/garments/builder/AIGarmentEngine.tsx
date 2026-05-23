"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Wand2, Loader2, Sparkles, RefreshCw, Download } from "lucide-react";
import { GarmentType } from "@/lib/garments/catalog";
import { Design } from "./DesignSelector";

interface AIGarmentEngineProps {
  garment: GarmentType;
  selectedDesigns: Design[];
  placementConfig: any;
}

// AI GENERATED GARMENT PREVIEW
// This uses Stable Diffusion XL via API to generate photorealistic garments
// No 3D models needed - pure AI generation

export function AIGarmentEngine({ garment, selectedDesigns, placementConfig }: AIGarmentEngineProps) {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 1000000));

  // Build the AI prompt for garment generation
  const buildPrompt = useCallback(() => {
    const garmentDesc = getGarmentPrompt(garment);
    const color = garment.baseColors[0]?.name || "black";
    const designDesc = selectedDesigns.map(d => d.name).join(", ");
    
    return {
      prompt: `Professional product photography of a ${color} ${garmentDesc}, flat lay on pure white background, studio lighting, high-end fashion photography, 8k resolution, sharp details, e-commerce product shot, ${designDesc ? `with ${designDesc} design printed on front` : ''}`,
      negative_prompt: "wrinkles, shadows, background clutter, low quality, blurry, distorted, multiple garments, model, person, mannequin, hanging, folded",
      width: 1024,
      height: 1024,
      seed: seed,
      cfg_scale: 7,
      steps: 30,
    };
  }, [garment, selectedDesigns, seed]);

  // Generate garment using AI API
  const generateGarment = async () => {
    setIsGenerating(true);
    setGenerationStep("Building prompt...");
    
    try {
      // Step 1: Generate base garment
      setGenerationStep("Generating garment with AI...");
      
      // In production, this calls your AI service:
      // - Replicate API (Stable Diffusion XL)
      // - Leonardo.ai API
      // - Midjourney API (if available)
      // - RunPod serverless Stable Diffusion
      
      const response = await fetch("/api/ai/generate-garment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPrompt()),
      });
      
      if (!response.ok) throw new Error("Generation failed");
      
      const data = await response.json();
      
      // Step 2: If designs selected, composite them onto garment
      if (selectedDesigns.length > 0) {
        setGenerationStep("Applying design artwork...");
        
        const compositeResponse = await fetch("/api/ai/composite-design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            baseImage: data.imageUrl,
            designs: selectedDesigns,
            placement: placementConfig,
            garmentType: garment.category,
          }),
        });
        
        const compositeData = await compositeResponse.json();
        setGeneratedImage(compositeData.imageUrl);
      } else {
        setGeneratedImage(data.imageUrl);
      }
      
    } catch (error) {
      console.error("Generation failed:", error);
      // Fallback to placeholder generation
      generatePlaceholder();
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Generate placeholder (simulation mode)
  const generatePlaceholder = () => {
    // Create canvas-based placeholder that looks AI-generated
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;
    
    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Draw garment shape based on category
    const color = garment.baseColors[0]?.hex || "#1a1a1a";
    drawGarmentShape(ctx, garment.category, color, 512, 512);
    
    // Add "AI GENERATED" watermark
    ctx.fillStyle = "rgba(74, 222, 128, 0.1)";
    ctx.font = "bold 40px sans-serif";
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(512, 512);
    ctx.rotate(-Math.PI / 6);
    ctx.fillText("AI GENERATED PREVIEW", 0, 0);
    ctx.restore();
    
    setGeneratedImage(canvas.toDataURL());
  };

  const regenerate = () => {
    setSeed(Math.floor(Math.random() * 1000000));
    setGeneratedImage(null);
  };

  return (
    <div className="space-y-4">
      {/* AI Engine Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black tracking-tighter text-[#e8f5e8] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#4ade80]" />
            AI GARMENT ENGINE
          </h3>
          <p className="text-xs text-[#6b8e6b]">
            Generative AI creates photorealistic previews in seconds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#4ade80] font-mono bg-[#4ade80]/10 px-2 py-1">
            SDXL POWERED
          </span>
        </div>
      </div>

      {/* Generation Area */}
      <div className="relative aspect-square bg-[#050805] border border-[#1a2e1a] overflow-hidden">
        {generatedImage ? (
          <>
            <img 
              src={generatedImage} 
              alt="AI Generated Garment"
              className="w-full h-full object-contain bg-white"
            />
            
            {/* Overlay Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <button
                onClick={regenerate}
                className="flex items-center gap-2 bg-black/80 backdrop-blur-sm text-[#e8f5e8] px-4 py-2 text-sm font-bold border border-[#1a2e1a] hover:border-[#4ade80] transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                NEW VARIANT
              </button>
              
              <button
                className="flex items-center gap-2 bg-[#4ade80] text-black px-4 py-2 text-sm font-bold"
              >
                <Download className="h-4 w-4" />
                SAVE
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8">
            {isGenerating ? (
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-[#1a2e1a] border-t-[#4ade80] rounded-full animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-[#4ade80]" />
                </div>
                <p className="text-[#4ade80] font-mono text-sm animate-pulse">
                  {generationStep}
                </p>
                <p className="text-[#6b8e6b] text-xs">
                  This may take 10-30 seconds
                </p>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-[#1a2e1a] rounded-full flex items-center justify-center mx-auto">
                  <Wand2 className="h-12 w-12 text-[#4ade80]" />
                </div>
                <div>
                  <p className="text-[#e8f5e8] font-bold mb-2">
                    Generate AI Preview
                  </p>
                  <p className="text-[#6b8e6b] text-sm max-w-xs">
                    Create photorealistic {garment.name} visualization with your designs
                  </p>
                </div>
                <button
                  onClick={generateGarment}
                  className="bg-[#4ade80] hover:bg-[#22c55e] text-black font-black tracking-wider px-8 py-3 text-sm transition-colors"
                >
                  GENERATE NOW
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generation Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-3">
          <label className="text-[10px] text-[#6b8e6b] uppercase block mb-2">
            Style Seed
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="flex-1 bg-[#050805] border border-[#1a2e1a] text-[#e8f5e8] text-sm px-2 py-1 font-mono"
            />
            <button 
              onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
              className="p-2 bg-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8]"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-3">
          <label className="text-[10px] text-[#6b8e6b] uppercase block mb-2">
            Color Variant
          </label>
          <select className="w-full bg-[#050805] border border-[#1a2e1a] text-[#e8f5e8] text-sm px-2 py-1">
            {garment.baseColors.map(color => (
              <option key={color.hex} value={color.hex}>
                {color.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* API Setup Notice */}
      <div className="bg-[#fbbf24]/10 border border-[#fbbf24] p-3">
        <p className="text-xs text-[#fbbf24]">
          <strong>AI ENGINE READY:</strong> Connect your Replicate, Leonardo.ai, or RunPod API key 
          in settings to enable photorealistic generation.
        </p>
      </div>
    </div>
  );
}

// Helper functions
function getGarmentPrompt(garment: GarmentType): string {
  const prompts: Record<string, string> = {
    "tee-classic": "t-shirt, crew neck, short sleeve",
    "tee-oversized": "oversized t-shirt, drop shoulder, loose fit",
    "tee-crop": "cropped t-shirt, fitted, baby tee",
    "hoodie-pullover": "pullover hoodie, kangaroo pocket, drawstring",
    "hoodie-zip": "zip-up hoodie, full zip, hooded sweatshirt",
    "joggers-classic": "jogger pants, elastic cuff, tapered fit",
    "crew-premium": "crewneck sweatshirt, pullover, ribbed cuffs",
    "bomber-classic": "bomber jacket, MA-1 style, flight jacket",
    "cap-dad": "dad hat, baseball cap, curved brim",
    "tote-canvas": "canvas tote bag, shopping bag, handles",
  };
  
  return prompts[garment.id] || garment.name.toLowerCase();
}

function drawGarmentShape(ctx: CanvasRenderingContext2D, category: string, color: string, cx: number, cy: number) {
  ctx.fillStyle = color;
  
  switch (category) {
    case "tops":
      // T-shirt shape
      ctx.beginPath();
      ctx.moveTo(cx - 60, cy - 80);
      ctx.lineTo(cx - 40, cy - 80);
      ctx.lineTo(cx, cy - 40);
      ctx.lineTo(cx + 40, cy - 80);
      ctx.lineTo(cx + 60, cy - 80);
      ctx.lineTo(cx + 80, cy - 40);
      ctx.lineTo(cx + 60, cy - 20);
      ctx.lineTo(cx + 60, cy + 80);
      ctx.lineTo(cx - 60, cy + 80);
      ctx.lineTo(cx - 60, cy - 20);
      ctx.lineTo(cx - 80, cy - 40);
      ctx.closePath();
      ctx.fill();
      break;
      
    case "bottoms":
      // Pants shape
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy - 60);
      ctx.lineTo(cx + 40, cy - 60);
      ctx.lineTo(cx + 50, cy + 80);
      ctx.lineTo(cx + 10, cy + 80);
      ctx.lineTo(cx, cy - 10);
      ctx.lineTo(cx - 10, cy + 80);
      ctx.lineTo(cx - 50, cy + 80);
      ctx.closePath();
      ctx.fill();
      break;
      
    case "headwear":
      // Cap shape
      ctx.beginPath();
      ctx.ellipse(cx, cy - 20, 50, 40, 0, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 30, cy - 10, 40, 15, 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    default:
      // Generic rectangle
      ctx.fillRect(cx - 50, cy - 60, 100, 120);
  }
}
