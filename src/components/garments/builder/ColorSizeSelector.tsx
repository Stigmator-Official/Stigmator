"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Palette, 
  Ruler, 
  Check,
  AlertCircle,
  Plus,
  Minus
} from "lucide-react";
import { GarmentType } from "@/lib/garments/catalog";

export interface VariantConfig {
  color: string;
  colorName: string;
  sizes: Record<string, number>; // size -> stock quantity
}

interface ColorSizeSelectorProps {
  garment: GarmentType;
  variants: VariantConfig[];
  onVariantsChange: (variants: VariantConfig[]) => void;
  allowStockConfig?: boolean;
}

export function ColorSizeSelector({ 
  garment, 
  variants, 
  onVariantsChange,
  allowStockConfig = false
}: ColorSizeSelectorProps) {
  const [activeColorTab, setActiveColorTab] = useState<string>(variants[0]?.color || garment.baseColors[0].hex);
  
  // Add a new color variant
  const addColorVariant = (color: typeof garment.baseColors[0]) => {
    if (variants.some(v => v.color === color.hex)) return;
    
    const newVariant: VariantConfig = {
      color: color.hex,
      colorName: color.name,
      sizes: garment.availableSizes.reduce((acc, size) => {
        acc[size] = allowStockConfig ? 100 : 0; // Default stock or unlimited (0)
        return acc;
      }, {} as Record<string, number>),
    };
    
    onVariantsChange([...variants, newVariant]);
    setActiveColorTab(color.hex);
  };
  
  // Remove a color variant
  const removeColorVariant = (colorHex: string) => {
    const newVariants = variants.filter(v => v.color !== colorHex);
    onVariantsChange(newVariants);
    if (activeColorTab === colorHex && newVariants.length > 0) {
      setActiveColorTab(newVariants[0].color);
    }
  };
  
  // Update stock for a size
  const updateSizeStock = (colorHex: string, size: string, stock: number) => {
    onVariantsChange(variants.map(v => {
      if (v.color === colorHex) {
        return {
          ...v,
          sizes: { ...v.sizes, [size]: Math.max(0, stock) }
        };
      }
      return v;
    }));
  };
  
  // Toggle size availability
  const toggleSize = (colorHex: string, size: string) => {
    onVariantsChange(variants.map(v => {
      if (v.color === colorHex) {
        const newSizes = { ...v.sizes };
        if (size in newSizes) {
          delete newSizes[size];
        } else {
          newSizes[size] = allowStockConfig ? 100 : 0;
        }
        return { ...v, sizes: newSizes };
      }
      return v;
    }));
  };
  
  // Get available colors that haven't been selected
  const availableColors = garment.baseColors.filter(
    color => !variants.some(v => v.color === color.hex)
  );
  
  const activeVariant = variants.find(v => v.color === activeColorTab);
  
  return (
    <div className="space-y-6">
      {/* Color Selection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4 text-[#4ade80]" />
          <h4 className="font-black tracking-tighter text-[#e8f5e8]">
            SELECT COLORS ({variants.length})
          </h4>
        </div>
        
        {/* Color Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
          {garment.baseColors.map((color) => {
            const isSelected = variants.some(v => v.color === color.hex);
            const isActive = activeColorTab === color.hex;
            
            return (
              <button
                key={color.hex}
                onClick={() => {
                  if (isSelected) {
                    setActiveColorTab(color.hex);
                  } else {
                    addColorVariant(color);
                  }
                }}
                className={`relative aspect-square border-2 transition-all group ${
                  isSelected
                    ? isActive
                      ? "border-[#4ade80] ring-2 ring-[#4ade80]/50"
                      : "border-[#4ade80]"
                    : "border-[#1a2e1a] hover:border-[#4ade80]/50"
                }`}
                title={color.name}
              >
                {/* Color Swatch */}
                <div 
                  className="absolute inset-1"
                  style={{ backgroundColor: color.hex }}
                />
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#4ade80] flex items-center justify-center">
                    <Check className="h-3 w-3 text-black" />
                  </div>
                )}
                
                {/* Color Name Tooltip */}
                <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] bg-black/80 text-white px-1 truncate w-full text-center">
                    {color.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Selected Colors List */}
        {variants.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <motion.button
                key={variant.color}
                layout
                onClick={() => setActiveColorTab(variant.color)}
                className={`flex items-center gap-2 px-3 py-2 border text-xs transition-all ${
                  activeColorTab === variant.color
                    ? "border-[#4ade80] bg-[#4ade80]/10"
                    : "border-[#1a2e1a] hover:border-[#4ade80]/50"
                }`}
              >
                <div 
                  className="w-4 h-4 border border-white/20"
                  style={{ backgroundColor: variant.color }}
                />
                <span className="text-[#e8f5e8]">{variant.colorName}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeColorVariant(variant.color);
                  }}
                  className="text-[#6b8e6b] hover:text-[#dc2626] ml-1"
                >
                  ×
                </button>
              </motion.button>
            ))}
          </div>
        )}
        
        {/* No Colors Warning */}
        {variants.length === 0 && (
          <div className="flex items-center gap-2 text-[#dc2626] text-sm bg-[#dc2626]/10 p-3">
            <AlertCircle className="h-4 w-4" />
            <span>Select at least one color</span>
          </div>
        )}
      </div>
      
      {/* Size Configuration */}
      {activeVariant && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="h-4 w-4 text-[#4ade80]" />
            <h4 className="font-black tracking-tighter text-[#e8f5e8]">
              SIZE AVAILABILITY
            </h4>
            <span className="text-xs text-[#6b8e6b] font-mono">
              ({Object.keys(activeVariant.sizes).length}/{garment.availableSizes.length} sizes)
            </span>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {garment.availableSizes.map((size) => {
              const isEnabled = size in activeVariant.sizes;
              const stock = activeVariant.sizes[size] || 0;
              
              return (
                <div
                  key={size}
                  className={`border-2 transition-all ${
                    isEnabled
                      ? "border-[#4ade80] bg-[#4ade80]/10"
                      : "border-[#1a2e1a] opacity-50"
                  }`}
                >
                  {/* Size Header */}
                  <button
                    onClick={() => toggleSize(activeVariant.color, size)}
                    className="w-full p-2 text-center"
                  >
                    <span className={`font-black text-sm ${
                      isEnabled ? "text-[#4ade80]" : "text-[#6b8e6b]"
                    }`}>
                      {size}
                    </span>
                  </button>
                  
                  {/* Stock Input (if enabled and stock config allowed) */}
                  {isEnabled && allowStockConfig && (
                    <div className="border-t border-[#1a2e1a] p-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateSizeStock(activeVariant.color, size, stock - 10)}
                          className="p-1 text-[#6b8e6b] hover:text-[#e8f5e8]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          value={stock}
                          onChange={(e) => updateSizeStock(activeVariant.color, size, parseInt(e.target.value) || 0)}
                          className="w-12 text-center bg-[#050805] border border-[#1a2e1a] text-[#e8f5e8] text-xs py-1"
                        />
                        <button
                          onClick={() => updateSizeStock(activeVariant.color, size, stock + 10)}
                          className="p-1 text-[#6b8e6b] hover:text-[#e8f5e8]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-[8px] text-center text-[#6b8e6b] mt-1">
                        STOCK
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Size Chart Link */}
          <div className="mt-3 text-xs text-[#6b8e6b]">
            <button className="text-[#4ade80] hover:underline">
              View Size Chart
            </button>
            {" "}for {garment.name}
          </div>
        </div>
      )}
      
      {/* Summary */}
      {variants.length > 0 && (
        <div className="bg-[#050805] border border-[#1a2e1a] p-4">
          <h5 className="font-black tracking-tighter text-[#e8f5e8] text-xs mb-2">
            VARIANT SUMMARY
          </h5>
          <div className="space-y-1 text-xs font-mono">
            {variants.map((variant) => {
              const sizeCount = Object.keys(variant.sizes).length;
              const totalStock = Object.values(variant.sizes).reduce((a, b) => a + b, 0);
              
              return (
                <div key={variant.color} className="flex items-center justify-between py-1 border-b border-[#1a2e1a] last:border-0">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3"
                      style={{ backgroundColor: variant.color }}
                    />
                    <span className="text-[#e8f5e8]">{variant.colorName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[#6b8e6b]">
                    <span>{sizeCount} sizes</span>
                    {allowStockConfig && <span>{totalStock} units</span>}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-3 pt-3 border-t border-[#1a2e1a] flex items-center justify-between">
            <span className="text-xs text-[#6b8e6b]">TOTAL VARIANTS</span>
            <span className="text-lg font-black text-[#4ade80]">
              {variants.reduce((sum, v) => sum + Object.keys(v.sizes).length, 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Quick preset configs
export const PRESET_VARIANTS = {
  // Single color, all sizes
  singleColorAllSizes: (garment: GarmentType): VariantConfig[] => [{
    color: garment.baseColors[0].hex,
    colorName: garment.baseColors[0].name,
    sizes: garment.availableSizes.reduce((acc, size) => {
      acc[size] = 0; // Unlimited
      return acc;
    }, {} as Record<string, number>),
  }],
  
  // Black and white only
  monochrome: (garment: GarmentType): VariantConfig[] => {
    const colors = garment.baseColors.filter(c => 
      c.name.toLowerCase().includes("black") || 
      c.name.toLowerCase().includes("white")
    );
    return colors.map(color => ({
      color: color.hex,
      colorName: color.name,
      sizes: garment.availableSizes.reduce((acc, size) => {
        acc[size] = 0;
        return acc;
      }, {} as Record<string, number>),
    }));
  },
  
  // All colors, common sizes only
  allColorsCommonSizes: (garment: GarmentType): VariantConfig[] => {
    const commonSizes = ["S", "M", "L", "XL"];
    return garment.baseColors.map(color => ({
      color: color.hex,
      colorName: color.name,
      sizes: garment.availableSizes
        .filter(s => commonSizes.includes(s))
        .reduce((acc, size) => {
          acc[size] = 0;
          return acc;
        }, {} as Record<string, number>),
    }));
  },
};
