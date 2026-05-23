"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ChevronRight,
  Check,
  Sparkles,
  Loader2,
  Package,
  Palette,
  LayoutGrid,
  DollarSign,
  Settings,
  ImageIcon,
  AlertCircle,
  Upload,
  X,
  Shirt,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadDataURL } from "@/lib/storage/upload";

// Import our powerful builder components
import {
  DesignSelector,
  Design,
  GarmentSelector,
  PlacementCanvas,
  DesignPlacement,
  ColorSizeSelector,
  VariantConfig,
  GarmentType,
  PRESET_VARIANTS,
} from "@/components/garments/builder";
import { AIGarmentEngine } from "@/components/garments/builder/AIGarmentEngine";
import { Garment3DViewer } from "@/components/garments/builder/Garment3DViewer";

// Import existing pricing/deposit components
import { DepositRecoupSetup } from "@/components/garments/deposit-recoup-setup";
import { LimitedEditionSetup } from "@/components/garments/limited-edition-setup";
import { PricingTiers } from "@/components/garments/pricing-tiers";
import { PriceCalculator } from "@/components/garments/price-calculator";

// Import types from existing components
interface PricingConfig {
  enabled: boolean;
  basePrice: number;
  finalPrice: number;
  tiers: Array<{ id: string; unitThreshold: number; price: number; label: string }>;
  urgencyMessage: string;
}

interface LimitedEditionConfig {
  enabled: boolean;
  totalUnits: number;
  presaleUnits: number;
  allowRestock: boolean;
  numberedCertificates: boolean;
  exclusivePackaging: boolean;
}

interface RecoupConfig {
  enabled: boolean;
  salesTarget: number;
}

// Step configuration
const STEPS = [
  { id: 1, label: "DESIGN & TYPE", icon: Palette },
  { id: 2, label: "PLACEMENT", icon: LayoutGrid },
  { id: 3, label: "COLORS & SIZES", icon: Settings },
  { id: 4, label: "PRICING", icon: DollarSign },
  { id: 5, label: "REVIEW", icon: Check },
];

export default function CreateGarmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // ===== STEP 1: Design Selection =====
  const [selectedDesigns, setSelectedDesigns] = useState<Design[]>([]);
  
  // ===== STEP 1b: Mockup Mode =====
  const [useMockup, setUseMockup] = useState(true);
  const [skipMockupImage, setSkipMockupImage] = useState<string | null>(null);
  const [isUploadingMockup, setIsUploadingMockup] = useState(false);
  
  // ===== STEP 2: Garment Selection =====
  const [selectedGarment, setSelectedGarment] = useState<GarmentType | null>(null);
  
  // ===== STEP 3: Design Placement =====
  const [placements, setPlacements] = useState<DesignPlacement[]>([]);
  const [show3DPreview, setShow3DPreview] = useState(false);
  
  // ===== STEP 4: Color & Size Configuration =====
  const [variants, setVariants] = useState<VariantConfig[]>([]);
  
  // ===== STEP 5: Pricing & Configuration =====
  const [retailPrice, setRetailPrice] = useState(0);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    enabled: false,
    basePrice: 0,
    finalPrice: 0,
    tiers: [],
    urgencyMessage: "Only {remaining} left at this price!",
  });
  const [limitedEditionConfig, setLimitedEditionConfig] = useState<LimitedEditionConfig>({
    enabled: false,
    totalUnits: 50,
    presaleUnits: 0,
    allowRestock: false,
    numberedCertificates: true,
    exclusivePackaging: false,
  });
  const [recoupConfig, setRecoupConfig] = useState<RecoupConfig>({
    enabled: true,
    salesTarget: 1,
  });
  
  // Initialize variants when garment changes
  useEffect(() => {
    if (selectedGarment && variants.length === 0) {
      setVariants(PRESET_VARIANTS.singleColorAllSizes(selectedGarment));
    }
  }, [selectedGarment]);
  
  // Initialize retail price when garment changes
  useEffect(() => {
    if (selectedGarment && retailPrice === 0) {
      setRetailPrice(selectedGarment.suggestedRetail);
      setPricingConfig(prev => ({
        ...prev,
        basePrice: selectedGarment.suggestedRetail,
        finalPrice: selectedGarment.suggestedRetail,
      }));
    }
  }, [selectedGarment]);
  
  // ===== Validation =====
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return selectedDesigns.length > 0 && selectedGarment !== null;
      case 2:
        if (useMockup) {
          return placements.length > 0;
        }
        return skipMockupImage !== null;
      case 3:
        return variants.length > 0 && variants.every(v => Object.keys(v.sizes).length > 0);
      case 4:
        return retailPrice >= (selectedGarment?.minRetail || 0);
      case 5:
        return true;
      default:
        return false;
    }
  }, [currentStep, selectedDesigns, selectedGarment, placements, variants, retailPrice, useMockup, skipMockupImage]);
  
  // ===== Navigation =====
  const goToNextStep = () => {
    if (canProceed() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  // ===== Skip Mockup Image Upload =====
  const handleSkipMockupFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    
    setIsUploadingMockup(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        try {
          const result = await uploadDataURL(dataUrl, {
            bucket: "product-mockups",
            fileName: `finished-garment-${Date.now()}.png`,
          });
          setSkipMockupImage(result.publicUrl);
        } catch (err) {
          console.error("Upload error:", err);
          alert("Failed to upload garment image");
        } finally {
          setIsUploadingMockup(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploadingMockup(false);
    }
  };
  
  // ===== Submission =====
  const handleSubmit = async () => {
    if (!selectedGarment) return;
    setIsSubmitting(true);
    
    try {
      const garmentData = {
        productId: selectedGarment.id,
        designIds: selectedDesigns.map(d => d.id),
        placements: placements.map(p => ({
          designId: p.designId,
          zoneId: p.zoneId,
          x: p.x,
          y: p.y,
          scale: p.scale,
          rotation: p.rotation,
        })),
        priceOverride: Math.round(retailPrice * 100),
        depositAmount: Math.round(selectedGarment.baseCost * 100),
        skipMockup: !useMockup,
        mockupImageBase64: useMockup ? null : skipMockupImage,
        variants: variants.map(v => ({
          color: v.color,
          colorName: v.colorName,
          sizes: v.sizes,
        })),
        retailPrice: Math.round(retailPrice * 100),
        recoupConfig,
        limitedEditionConfig,
      };
      
      const response = await fetch("/api/product-designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(garmentData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create garment");
      }
      
      router.push("/artist/garments/pending");
    } catch (error: any) {
      console.error("Error creating garment:", error);
      alert(error.message || "Failed to create garment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // ===== Render Steps =====
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Design Selection */}
            <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
              <h2 className="font-black tracking-tighter text-xl mb-2 text-[#e8f5e8]">
                SELECT YOUR DESIGNS
              </h2>
              <p className="text-sm text-[#6b8e6b] mb-6">
                Choose one or more designs to place on your garment. You can select up to 6 designs.
              </p>
              
              <DesignSelector
                selectedDesigns={selectedDesigns}
                onDesignsChange={setSelectedDesigns}
                maxSelections={6}
              />
            </div>
            
            {/* Garment Selection */}
            <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
              <h2 className="font-black tracking-tighter text-xl mb-2 text-[#e8f5e8]">
                CHOOSE GARMENT TYPE
              </h2>
              <p className="text-sm text-[#6b8e6b] mb-6">
                Select from 48+ garment types across tops, bottoms, outerwear, headwear, and accessories.
              </p>
              
              <GarmentSelector
                selectedGarment={selectedGarment}
                onGarmentSelect={setSelectedGarment}
              />
            </div>
            
            {/* Mockup Mode Toggle */}
            <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
              <h2 className="font-black tracking-tighter text-xl mb-4 text-[#e8f5e8]">
                HOW DO YOU WANT TO CREATE YOUR GARMENT?
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setUseMockup(true)}
                  className={`p-6 border-2 text-left transition-all ${
                    useMockup 
                      ? "border-[#4ade80] bg-[#4ade80]/10" 
                      : "border-[#1a2e1a] hover:border-[#4ade80]/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 flex items-center justify-center ${
                      useMockup ? "bg-[#4ade80] text-black" : "bg-[#1a2e1a] text-[#6b8e6b]"
                    }`}>
                      <Wand2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={`font-black ${useMockup ? "text-[#4ade80]" : "text-[#e8f5e8]"}`}>
                        USE MOCKUP GENERATOR
                      </h3>
                      <p className="text-xs text-[#6b8e6b]">
                        Drag, scale, and rotate your design in real-time on a 3D garment preview
                      </p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setUseMockup(false)}
                  className={`p-6 border-2 text-left transition-all ${
                    !useMockup 
                      ? "border-[#4ade80] bg-[#4ade80]/10" 
                      : "border-[#1a2e1a] hover:border-[#4ade80]/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 flex items-center justify-center ${
                      !useMockup ? "bg-[#4ade80] text-black" : "bg-[#1a2e1a] text-[#6b8e6b]"
                    }`}>
                      <Shirt className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={`font-black ${!useMockup ? "text-[#4ade80]" : "text-[#e8f5e8]"}`}>
                        UPLOAD FINISHED GARMENT
                      </h3>
                      <p className="text-xs text-[#6b8e6b]">
                        You already had this printed locally. Upload a photo and go straight to pricing.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return selectedGarment ? (
          <div className="space-y-6">
            {useMockup ? (
              <>
                {/* AI GENERATED PREVIEW */}
                <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
                  <AIGarmentEngine
                    garment={selectedGarment}
                    selectedDesigns={selectedDesigns}
                    placementConfig={placements}
                  />
                </div>
                
                {/* Placement Editor / 3D Preview Toggle */}
                <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-black tracking-tighter text-xl text-[#e8f5e8]">
                        {show3DPreview ? "3D PREVIEW" : "2D PLACEMENT EDITOR"}
                      </h2>
                      <p className="text-sm text-[#6b8e6b]">
                        {show3DPreview 
                          ? "Orbit, zoom, and inspect your design from all angles"
                          : "Fine-tune design positions. Drag onto zones, click to resize/rotate."}
                      </p>
                    </div>
                    <button
                      onClick={() => setShow3DPreview(!show3DPreview)}
                      className={`flex items-center gap-2 px-4 py-2 border text-sm font-bold transition-all ${
                        show3DPreview
                          ? "border-[#4ade80] text-[#4ade80] bg-[#4ade80]/10"
                          : "border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]/50"
                      }`}
                    >
                      {show3DPreview ? "2D EDITOR" : "3D PREVIEW"}
                    </button>
                  </div>
                  
                  {show3DPreview ? (
                    <div className="h-[500px] bg-[#050805] border border-[#1a2e1a]">
                      <Garment3DViewer
                        garment={selectedGarment}
                        placements={placements}
                        selectedColor={variants[0]?.color || selectedGarment.baseColors[0].hex}
                      />
                    </div>
                  ) : (
                    <PlacementCanvas
                      garment={selectedGarment}
                      placements={placements}
                      onPlacementsChange={setPlacements}
                      selectedColor={variants[0]?.color || selectedGarment.baseColors[0].hex}
                    />
                  )}
                </div>
                
                {/* Available Designs for Dragging */}
                <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
                  <h3 className="font-black tracking-tighter text-sm mb-4 text-[#e8f5e8]">
                    YOUR DESIGNS — CLICK TO ADD
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {selectedDesigns.map((design) => {
                      const isUsed = placements.some(p => p.designId === design.id);
                      return (
                        <button
                          key={design.id}
                          onClick={() => {
                            const availableZone = selectedGarment.placementZones.find(z => {
                              const zonePlacements = placements.filter(p => p.zoneId === z.id);
                              return zonePlacements.length < (z.maxDesigns || 1);
                            });
                            if (availableZone) {
                              const newPlacement: DesignPlacement = {
                                id: `placement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                designId: design.id,
                                design,
                                zoneId: availableZone.id,
                                x: availableZone.x,
                                y: availableZone.y,
                                scale: 1,
                                rotation: 0,
                                flipX: false,
                                flipY: false,
                                opacity: 1,
                                zIndex: placements.length,
                              };
                              setPlacements([...placements, newPlacement]);
                            }
                          }}
                          className={`p-3 border-2 text-left transition-all ${
                            isUsed 
                              ? "border-[#4ade80] bg-[#4ade80]/10" 
                              : "border-[#1a2e1a] hover:border-[#4ade80]/50"
                          }`}
                        >
                          <div className="aspect-square bg-[#050805] mb-2 flex items-center justify-center text-lg">
                            {design.thumbnail_url ? (
                              <img src={design.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              "🎨"
                            )}
                          </div>
                          <div className="text-xs text-[#e8f5e8] truncate">{design.name}</div>
                          {isUsed && <div className="text-[10px] text-[#4ade80]">PLACED</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Skip Mockup Upload */
              <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
                <h2 className="font-black tracking-tighter text-xl mb-2 text-[#e8f5e8]">
                  UPLOAD FINISHED GARMENT PHOTO
                </h2>
                <p className="text-sm text-[#6b8e6b] mb-6">
                  Take a clear photo of your finished garment. This will be used as the product image in the shop.
                </p>
                
                {skipMockupImage ? (
                  <div className="relative">
                    <img 
                      src={skipMockupImage} 
                      alt="Finished garment" 
                      className="w-full max-h-[500px] object-contain bg-[#050805] border border-[#1a2e1a]"
                    />
                    <button
                      onClick={() => setSkipMockupImage(null)}
                      className="absolute top-2 right-2 w-8 h-8 bg-[#dc2626] text-white flex items-center justify-center hover:bg-[#b91c1c]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <div className="border-2 border-dashed border-[#1a2e1a] hover:border-[#4ade80]/50 bg-[#050805] p-12 text-center cursor-pointer transition-colors">
                      {isUploadingMockup ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-10 w-10 text-[#4ade80] animate-spin mb-4" />
                          <p className="text-sm text-[#6b8e6b]">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-[#1a2e1a] mx-auto mb-4" />
                          <p className="text-sm text-[#e8f5e8] font-bold mb-1">
                            CLICK OR DRAG TO UPLOAD
                          </p>
                          <p className="text-xs text-[#6b8e6b]">
                            JPG, PNG, or WebP up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingMockup}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSkipMockupFileSelect(file);
                      }}
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        ) : null;
        
      case 3:
        return selectedGarment ? (
          <div className="space-y-6">
            <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
              <h2 className="font-black tracking-tighter text-xl mb-2 text-[#e8f5e8]">
                CONFIGURE COLORS & SIZES
              </h2>
              <p className="text-sm text-[#6b8e6b] mb-6">
                Select which colors to offer and which sizes will be available for each color variant.
              </p>
              
              <ColorSizeSelector
                garment={selectedGarment}
                variants={variants}
                onVariantsChange={setVariants}
                allowStockConfig={false}
              />
            </div>
          </div>
        ) : null;
        
      case 4:
        return selectedGarment ? (
          <div className="space-y-6">
            {/* Price Calculator */}
            <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
              <h2 className="font-black tracking-tighter text-xl mb-6 text-[#e8f5e8]">
                SET YOUR PRICE
              </h2>
              
              <PriceCalculator
                manufacturingCost={selectedGarment.baseCost}
                platformFeePercent={15}
                onPriceChange={useCallback((price: number, isValid: boolean, profit: number) => {
                  setRetailPrice(price);
                  setPricingConfig(prev => ({
                    ...prev,
                    basePrice: price,
                    finalPrice: price,
                  }));
                }, [])}
                initialPrice={selectedGarment.suggestedRetail}
              />
            </div>
            
            {/* Dynamic Pricing */}
            <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
              <PricingTiers
                baseCost={selectedGarment.baseCost}
                onChange={setPricingConfig}
              />
            </div>
            
            {/* Limited Edition */}
            <LimitedEditionSetup
              onChange={setLimitedEditionConfig}
              garmentType={selectedGarment.name}
            />
          </div>
        ) : null;
        
      case 5:
        return selectedGarment ? (
          <div className="space-y-6">
            <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
              <h2 className="font-black tracking-tighter text-xl mb-6 text-[#e8f5e8]">
                REVIEW & DEPOSIT
              </h2>
              
              {/* Summary Cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Designs Summary */}
                <div className="bg-[#050805] border border-[#1a2e1a] p-4">
                  <h3 className="font-black tracking-tighter text-sm mb-3 text-[#4ade80]">
                    DESIGNS ({selectedDesigns.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDesigns.map(d => (
                      <span key={d.id} className="text-xs bg-[#1a2e1a] text-[#e8f5e8] px-2 py-1">
                        {d.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Garment Summary */}
                <div className="bg-[#050805] border border-[#1a2e1a] p-4">
                  <h3 className="font-black tracking-tighter text-sm mb-3 text-[#4ade80]">
                    GARMENT
                  </h3>
                  <p className="text-[#e8f5e8] font-bold">{selectedGarment.name}</p>
                  <p className="text-xs text-[#6b8e6b]">{selectedGarment.material}</p>
                </div>
                
                {/* Colors & Sizes */}
                <div className="bg-[#050805] border border-[#1a2e1a] p-4">
                  <h3 className="font-black tracking-tighter text-sm mb-3 text-[#4ade80]">
                    VARIANTS ({variants.reduce((sum, v) => sum + Object.keys(v.sizes).length, 0)})
                  </h3>
                  <div className="space-y-2">
                    {variants.map(v => (
                      <div key={v.color} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-3 h-3 border border-white/20"
                          style={{ backgroundColor: v.color }}
                        />
                        <span className="text-[#e8f5e8]">{v.colorName}</span>
                        <span className="text-[#6b8e6b]">
                          ({Object.keys(v.sizes).join(", ")})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pricing Summary */}
                <div className="bg-[#050805] border border-[#1a2e1a] p-4">
                  <h3 className="font-black tracking-tighter text-sm mb-3 text-[#4ade80]">
                    PRICING
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#6b8e6b]">Retail Price</span>
                      <span className="text-[#e8f5e8] font-mono">${retailPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b8e6b]">Platform Fee (15%)</span>
                      <span className="text-[#6b8e6b] font-mono">-${(retailPrice * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b8e6b]">Base Cost</span>
                      <span className="text-[#6b8e6b] font-mono">-${selectedGarment.baseCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#1a2e1a]">
                      <span className="text-[#4ade80] font-bold">Your Profit</span>
                      <span className="text-[#4ade80] font-black font-mono">
                        ${(retailPrice * 0.85 - selectedGarment.baseCost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mockup Mode Summary */}
              {!useMockup && skipMockupImage && (
                <div className="mb-6 bg-[#4ade80]/10 border border-[#4ade80]/50 p-4">
                  <h3 className="font-black tracking-tighter text-sm mb-2 text-[#4ade80]">
                    FINISHED GARMENT UPLOADED
                  </h3>
                  <img 
                    src={skipMockupImage} 
                    alt="Finished garment" 
                    className="w-full max-h-[300px] object-contain bg-[#050805]"
                  />
                </div>
              )}
              
              {/* Deposit Section */}
              <DepositRecoupSetup
                depositAmount={selectedGarment.baseCost}
                retailPrice={retailPrice}
                onRecoupChange={setRecoupConfig}
              />
              
              {/* Submit Warning */}
              <div className="mt-6 bg-[#f97316]/10 border border-[#f97316] p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#f97316] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black tracking-tighter text-[#f97316] text-sm mb-1">
                      DEPOSIT REQUIRED
                    </h4>
                    <p className="text-xs text-[#e8f5e8]">
                      A ${selectedGarment.baseCost.toFixed(2)} deposit is required to create your garment mockup 
                      and reserve manufacturing capacity. This deposit will be {recoupConfig.enabled 
                        ? `recouped after ${recoupConfig.salesTarget} sale${recoupConfig.salesTarget > 1 ? 's' : ''}` 
                        : "deducted from your first sales"}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null;
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/artist/garments" 
            className="inline-flex items-center text-[#6b8e6b] hover:text-[#e8f5e8] mb-4 font-mono text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO GARMENTS
          </Link>
          <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8]">
            CREATE GARMENT
          </h1>
          <p className="text-[#6b8e6b] mt-2">
            Design, price, and launch your wearable art
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex items-center min-w-max">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isUpcoming = currentStep < step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => {
                      // Allow clicking back to completed steps
                      if (step.id < currentStep) {
                        setCurrentStep(step.id);
                      }
                    }}
                    disabled={step.id > currentStep}
                    className={`flex items-center gap-2 px-4 py-2 border-2 transition-all ${
                      isActive
                        ? "border-[#4ade80] bg-[#4ade80] text-black"
                        : isCompleted
                          ? "border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80]/10"
                          : "border-[#1a2e1a] text-[#6b8e6b]"
                    } ${step.id < currentStep ? "cursor-pointer" : ""}`}
                  >
                    <StepIcon className="h-4 w-4" />
                    <span className="font-black text-xs tracking-wider hidden sm:inline">
                      {step.label}
                    </span>
                  </button>
                  
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-[#1a2e1a] mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Step Content */}
        {mounted ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div>{renderStep()}</div>
        )}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-8 border-t border-[#1a2e1a]">
          <Button
            variant="outline"
            onClick={goToPrevStep}
            disabled={currentStep === 1}
            className="rounded-none border-[#1a2e1a] hover:bg-[#1a2e1a] text-[#6b8e6b] disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button
              onClick={goToNextStep}
              disabled={!canProceed()}
              className="bg-[#4ade80] hover:bg-[#22c55e] text-black rounded-none font-black tracking-wider px-8 disabled:opacity-50"
            >
              CONTINUE
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none font-black tracking-wider px-8 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  CREATING...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  PAY DEPOSIT & CREATE
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
