"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Wand2, Loader2, Sparkles, RefreshCw, Download, Shirt } from "lucide-react";
import { GarmentType, getGarmentBaseImage } from "@/lib/garments/catalog";
import { Design } from "./DesignSelector";
import { generateProductMockup } from "@/lib/garments/compositor-client";

interface AIGarmentEngineProps {
  garment: GarmentType;
  selectedDesigns: Design[];
  placementConfig: any;
}

/**
 * AI Garment Engine
 * Generates photorealistic garment mockups by compositing designs onto real garment photos.
 * Falls back to canvas compositing when AI APIs are unavailable.
 */
export function AIGarmentEngine({ garment, selectedDesigns, placementConfig }: AIGarmentEngineProps) {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState(garment.baseColors[0]?.hex || "#0a0a0a");
  const [selectedColorName, setSelectedColorName] = useState(garment.baseColors[0]?.name || "Black");

  // Auto-generate when designs or color changes
  useEffect(() => {
    if (selectedDesigns.length > 0) {
      const timeout = setTimeout(() => {
        generateMockup();
      }, 500);
      return () => clearTimeout(timeout);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDesigns, selectedColor, placementConfig]);

  const generateMockup = async () => {
    if (selectedDesigns.length === 0) return;
    setIsGenerating(true);
    setGenerationStep("Compositing design onto garment...");

    try {
      // Try AI-powered generation first
      const garmentImageUrl = getGarmentBaseImage(garment, selectedColor);
      
      // Build placement data from placementConfig or use defaults
      const placements = selectedDesigns.map((design, index) => {
        const placement = placementConfig?.[design.id] || placementConfig?.[index];
        return {
          imageUrl: design.image_url,
          placement: {
            x: placement?.x ?? 50,
            y: placement?.y ?? 45,
            scale: placement?.scale ?? 1,
            rotation: placement?.rotation ?? 0,
            opacity: placement?.opacity ?? 1,
            flipX: placement?.flipX ?? false,
            flipY: placement?.flipY ?? false,
          },
        };
      });

      // Try server-side composite first for better quality
      const compositeResponse = await fetch("/api/ai/composite-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garmentImageUrl,
          designImageUrl: selectedDesigns[0].image_url,
          placement: placements[0]?.placement || { x: 50, y: 45, scale: 1, rotation: 0, opacity: 1, flipX: false, flipY: false },
          garmentColor: selectedColor,
          mode: "canvas",
        }),
      });

      if (compositeResponse.ok) {
        const data = await compositeResponse.json();
        if (data.success) {
          setGeneratedImage(data.imageUrl);
          setIsGenerating(false);
          setGenerationStep("");
          return;
        }
      }

      // Client-side fallback
      setGenerationStep("Rendering preview...");
      const mockup = await generateProductMockup(
        garmentImageUrl,
        placements,
        selectedColor,
        1024,
        1024
      );
      setGeneratedImage(mockup);
    } catch {
      // Fallback to simple garment image
      setGeneratedImage(getGarmentBaseImage(garment, selectedColor));
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const regenerate = useCallback(() => {
    setGeneratedImage(null);
    generateMockup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDesigns, selectedColor, placementConfig]);

  const handleColorChange = (color: typeof garment.baseColors[0]) => {
    setSelectedColor(color.hex);
    setSelectedColorName(color.name);
    setGeneratedImage(null);
  };

  return (
    <div className="space-y-4">
      {/* AI Engine Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black tracking-tighter text-[#e8f5e8] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#4ade80]" />
            MOCKUP ENGINE
          </h3>
          <p className="text-xs text-[#6b8e6b]">
            Real-time garment preview with your designs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#4ade80] font-mono bg-[#4ade80]/10 px-2 py-1">
            LIVE
          </span>
        </div>
      </div>

      {/* Color Selector */}
      <div className="flex gap-2 flex-wrap">
        {garment.baseColors.map((color) => (
          <button
            key={color.hex}
            onClick={() => handleColorChange(color)}
            className={`w-8 h-8 border-2 transition-all ${
              selectedColor === color.hex
                ? "border-[#4ade80] scale-110"
                : "border-[#1a2e1a] hover:border-[#4ade80]/50"
            }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        ))}
        <span className="text-xs text-[#6b8e6b] font-mono self-center ml-2">
          {selectedColorName.toUpperCase()}
        </span>
      </div>

      {/* Generation Area */}
      <div className="relative aspect-square bg-[#050805] border border-[#1a2e1a] overflow-hidden">
        {generatedImage ? (
          <>
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={generatedImage}
              alt="Generated Garment"
              className="w-full h-full object-contain"
            />

            {/* Overlay Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <button
                onClick={regenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-black/80 backdrop-blur-sm text-[#e8f5e8] px-4 py-2 text-sm font-bold border border-[#1a2e1a] hover:border-[#4ade80] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                REGENERATE
              </button>

              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = generatedImage;
                  link.download = `${garment.id}-mockup.png`;
                  link.click();
                }}
                className="flex items-center gap-2 bg-[#4ade80] text-black px-4 py-2 text-sm font-bold hover:bg-[#3ec46e] transition-colors"
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
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-[#1a2e1a] rounded-full flex items-center justify-center mx-auto">
                  {selectedDesigns.length > 0 ? (
                    <Shirt className="h-12 w-12 text-[#4ade80]" />
                  ) : (
                    <Wand2 className="h-12 w-12 text-[#6b8e6b]" />
                  )}
                </div>
                <div>
                  <p className="text-[#e8f5e8] font-bold mb-2">
                    {selectedDesigns.length > 0 ? "Ready to Preview" : "Select a Design First"}
                  </p>
                  <p className="text-[#6b8e6b] text-sm max-w-xs">
                    {selectedDesigns.length > 0
                      ? `Generate a ${garment.name} mockup with your designs`
                      : "Add designs to the placement canvas to see a preview"}
                  </p>
                </div>
                {selectedDesigns.length > 0 && (
                  <button
                    onClick={generateMockup}
                    className="bg-[#4ade80] hover:bg-[#22c55e] text-black font-black tracking-wider px-8 py-3 text-sm transition-colors"
                  >
                    GENERATE PREVIEW
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
