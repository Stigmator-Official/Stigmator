"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Flame, DollarSign, Clock, Layers } from "lucide-react";
import { GarmentType } from "@/lib/garments/catalog";

interface GarmentCardProps {
  garment: GarmentType;
  isSelected: boolean;
  onClick: () => void;
}

// Generate a realistic garment preview using CSS/SVG composition
// This is the enterprise-grade visual representation
export function GarmentCard({ garment, isSelected, onClick }: GarmentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const primaryColor = garment.baseColors[0];
  
  return (
    <motion.button
      layout
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative w-full text-left transition-all duration-300 ${
        isSelected
          ? "ring-2 ring-[#4ade80] ring-offset-2 ring-offset-[#050805]"
          : "hover:scale-[1.02]"
      }`}
    >
      {/* Card Container */}
      <div className={`relative bg-[#0a0f0a] border-2 overflow-hidden ${
        isSelected ? "border-[#4ade80]" : "border-[#1a2e1a] group-hover:border-[#4ade80]/50"
      }`}>
        
        {/* Selection Checkmark */}
        {isSelected && (
          <div className="absolute top-3 right-3 z-20 w-8 h-8 bg-[#4ade80] flex items-center justify-center">
            <Check className="h-5 w-5 text-black" strokeWidth={3} />
          </div>
        )}
        
        {/* Trending Badge */}
        {garment.trending && !isSelected && (
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-[#dc2626] text-white text-[10px] font-black px-2 py-1 flex items-center gap-1 uppercase tracking-wider">
              <Flame className="h-3 w-3" />
              Hot
            </span>
          </div>
        )}
        
        {/* Main Visual - CSS-Generated Garment Preview */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-[#0f1410] to-[#050805]">
          {/* Dynamic Background Glow */}
          <div 
            className="absolute inset-0 opacity-20 blur-3xl transition-opacity duration-500"
            style={{ 
              background: `radial-gradient(circle at 50% 50%, ${primaryColor.hex} 0%, transparent 70%)`,
              opacity: isHovered ? 0.4 : 0.2
            }}
          />
          
          {/* Garment Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <GarmentSilhouette 
              category={garment.category} 
              color={primaryColor.hex}
              name={garment.name}
            />
          </div>
          
          {/* Hover Overlay with Quick Stats */}
          <motion.div 
            initial={false}
            animate={{ opacity: isHovered || isSelected ? 1 : 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center space-y-4 p-4">
              {/* Price */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-black text-[#4ade80]">
                  ${garment.suggestedRetail}
                </span>
                <span className="text-xs text-[#6b8e6b] uppercase">suggested</span>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#1a2e1a] px-3 py-2">
                  <div className="text-[#6b8e6b] mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Production
                  </div>
                  <div className="text-[#e8f5e8] font-bold">{garment.productionTimeDays} days</div>
                </div>
                <div className="bg-[#1a2e1a] px-3 py-2">
                  <div className="text-[#6b8e6b] mb-1 flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    Print Area
                  </div>
                  <div className="text-[#e8f5e8] font-bold">
                    {garment.maxPrintArea.front ? "14×16" : "12×12"} in
                  </div>
                </div>
              </div>
              
              {/* Print Methods */}
              <div className="flex flex-wrap justify-center gap-1">
                {garment.printMethods.slice(0, 3).map(method => (
                  <span key={method} className="text-[10px] bg-[#050805] text-[#6b8e6b] px-2 py-1 border border-[#1a2e1a]">
                    {method.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Info Section */}
        <div className="p-4 border-t border-[#1a2e1a]">
          {/* Name */}
          <h3 className="font-black text-[#e8f5e8] text-sm tracking-tight mb-1 uppercase">
            {garment.name}
          </h3>
          
          {/* Description */}
          <p className="text-xs text-[#6b8e6b] line-clamp-2 mb-3">
            {garment.description}
          </p>
          
          {/* Color Swatches */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-[#6b8e6b] uppercase">Colors:</span>
            <div className="flex -space-x-1">
              {garment.baseColors.slice(0, 5).map((color, i) => (
                <div
                  key={color.hex}
                  className="w-5 h-5 rounded-full border-2 border-[#0a0f0a]"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              {garment.baseColors.length > 5 && (
                <div className="w-5 h-5 rounded-full border-2 border-[#0a0f0a] bg-[#1a2e1a] flex items-center justify-center text-[8px] text-[#6b8e6b]">
                  +{garment.baseColors.length - 5}
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Row */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1a2e1a]">
            <div className="flex items-center gap-2 text-[10px] text-[#6b8e6b]">
              <span className="uppercase">{garment.availableSizes.length} Sizes</span>
              <span>•</span>
              <span className="uppercase">{garment.fit}</span>
            </div>
            <div className="text-[10px] text-[#4ade80] font-mono">
              MOQ: {garment.moq}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// High-quality CSS garment silhouettes
function GarmentSilhouette({ category, color, name }: { category: string; color: string; name: string }) {
  const getSilhouette = () => {
    switch (category) {
      case "tops":
        return (
          <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-2xl">
            <defs>
              <linearGradient id={`shirtGrad-${name.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="50%" stopColor={color} stopOpacity="0.7" />
                <stop offset="100%" stopColor={color} stopOpacity="0.5" />
              </linearGradient>
              <filter id="fabricShadow">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3"/>
              </filter>
            </defs>
            {/* T-Shirt Body */}
            <path
              d="M60 40 L80 40 L100 60 L120 40 L140 40 L160 80 L140 90 L140 200 L60 200 L60 90 L40 80 Z"
              fill={`url(#shirtGrad-${name.replace(/\s+/g, '')})`}
              filter="url(#fabricShadow)"
            />
            {/* Neck */}
            <path d="M80 40 Q100 70 120 40" fill="none" stroke={color} strokeWidth="3" opacity="0.5"/>
            {/* Sleeve seams */}
            <line x1="60" y1="90" x2="40" y2="80" stroke={color} strokeWidth="2" opacity="0.3"/>
            <line x1="140" y1="90" x2="160" y2="80" stroke={color} strokeWidth="2" opacity="0.3"/>
          </svg>
        );
        
      case "bottoms":
        return (
          <svg viewBox="0 0 200 280" className="w-full h-full drop-shadow-2xl">
            <defs>
              <linearGradient id={`pantsGrad-${name.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={color} stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {/* Pants Body */}
            <path
              d="M70 40 L130 40 L135 280 L105 280 L100 120 L95 280 L65 280 Z"
              fill={`url(#pantsGrad-${name.replace(/\s+/g, '')})`}
            />
            {/* Waistband */}
            <rect x="70" y="40" width="60" height="20" fill={color} opacity="0.8"/>
            {/* Pockets */}
            <path d="M70 60 L90 60 L90 100" fill="none" stroke={color} strokeWidth="2" opacity="0.3"/>
            <path d="M130 60 L110 60 L110 100" fill="none" stroke={color} strokeWidth="2" opacity="0.3"/>
          </svg>
        );
        
      case "outerwear":
        return (
          <svg viewBox="0 0 200 260" className="w-full h-full drop-shadow-2xl">
            <defs>
              <linearGradient id={`jacketGrad-${name.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="50%" stopColor={color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={color} stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* Jacket Body */}
            <path
              d="M55 30 L85 30 L100 50 L115 30 L145 30 L170 70 L150 85 L150 250 L50 250 L50 85 L30 70 Z"
              fill={`url(#jacketGrad-${name.replace(/\s+/g, '')})`}
            />
            {/* Collar */}
            <path d="M85 30 L100 55 L115 30" fill="none" stroke={color} strokeWidth="3"/>
            {/* Zipper */}
            <line x1="100" y1="55" x2="100" y2="250" stroke={color} strokeWidth="2" strokeDasharray="4,2" opacity="0.5"/>
            {/* Pockets */}
            <rect x="60" y="140" width="25" height="30" rx="2" fill={color} opacity="0.3"/>
            <rect x="115" y="140" width="25" height="30" rx="2" fill={color} opacity="0.3"/>
          </svg>
        );
        
      case "headwear":
        return (
          <svg viewBox="0 0 200 140" className="w-full h-full drop-shadow-2xl">
            <defs>
              <radialGradient id={`hatGrad-${name.replace(/\s+/g, '')}`} cx="50%" cy="40%">
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={color} stopOpacity="0.7" />
              </radialGradient>
            </defs>
            {/* Cap Dome */}
            <path
              d="M40 80 Q40 20 100 20 Q160 20 160 80"
              fill={`url(#hatGrad-${name.replace(/\s+/g, '')})`}
            />
            {/* Brim */}
            <path
              d="M35 75 Q100 110 165 75 L170 85 Q100 125 30 85 Z"
              fill={color}
              opacity="0.9"
            />
            {/* Front Panel */}
            <path d="M70 80 Q100 100 130 80" fill="none" stroke={color} strokeWidth="2" opacity="0.5"/>
            {/* Button */}
            <circle cx="100" cy="25" r="4" fill={color} opacity="0.8"/>
          </svg>
        );
        
      case "bags":
        return (
          <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-2xl">
            <defs>
              <linearGradient id={`bagGrad-${name.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={color} stopOpacity="0.7" />
              </linearGradient>
            </defs>
            {/* Bag Body */}
            <rect
              x="40" y="60" width="120" height="140" rx="4"
              fill={`url(#bagGrad-${name.replace(/\s+/g, '')})`}
            />
            {/* Handles */}
            <path
              d="M60 60 Q60 20 100 20 Q140 20 140 60"
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Stitching detail */}
            <rect x="45" y="65" width="110" height="130" rx="2" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.3"/>
          </svg>
        );
        
      default:
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
            <rect
              x="50" y="30" width="100" height="140" rx="8"
              fill={color}
              opacity="0.8"
            />
          </svg>
        );
    }
  };
  
  return (
    <div className="w-32 h-32 relative">
      {getSilhouette()}
    </div>
  );
}
