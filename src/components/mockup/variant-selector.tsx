"use client"

import React, { useRef } from "react"
import { 
  Shirt, 
  ChevronLeft, 
  ChevronRight, 
  Ruler, 
  Sparkles, 
  DollarSign,
  Check,
  Maximize2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type GarmentType = 'tshirt' | 'hoodie' | 'tank' | 'longsleeve' | 'sweatshirt'
export type FitType = 'slim' | 'regular' | 'oversized'

export interface Variant {
  id: string
  name: string
  description: string
  fit: FitType
  sizes: string[]
  features: string[]
  basePrice: number
  printAreas: string[]
  image: string
}

export interface VariantSelectorProps {
  garmentType: GarmentType
  selectedVariant: string
  onChange: (variantId: string) => void
  className?: string
}

// Grouped variants by garment type
export const VARIANTS: Record<GarmentType, Variant[]> = {
  tshirt: [
    {
      id: 'tshirt-classic',
      name: 'Classic Tee',
      description: 'Timeless regular fit, the everyday essential.',
      fit: 'regular',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      features: ['Crew neck', 'Short sleeves', 'Pre-shrunk'],
      basePrice: 18.99,
      printAreas: ['front', 'back', 'left-sleeve', 'right-sleeve'],
      image: '/variants/tshirt-classic.svg',
    },
    {
      id: 'tshirt-slim',
      name: 'Slim Fit Tee',
      description: 'Modern tailored fit for a sleek silhouette.',
      fit: 'slim',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
      features: ['Tailored cut', 'Modern length', 'Side seams'],
      basePrice: 19.99,
      printAreas: ['front', 'back', 'left-sleeve', 'right-sleeve'],
      image: '/variants/tshirt-slim.svg',
    },
    {
      id: 'tshirt-oversized',
      name: 'Oversized Tee',
      description: 'Relaxed streetwear fit with dropped shoulders.',
      fit: 'oversized',
      sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
      features: ['Dropped shoulders', 'Extended length', 'Heavyweight'],
      basePrice: 24.99,
      printAreas: ['front', 'back', 'left-sleeve', 'right-sleeve'],
      image: '/variants/tshirt-oversized.svg',
    },
    {
      id: 'tshirt-vneck',
      name: 'V-Neck Tee',
      description: 'Classic fit with a flattering V-neckline.',
      fit: 'regular',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
      features: ['V-neck collar', 'Tagless', 'Lightweight'],
      basePrice: 18.99,
      printAreas: ['front', 'back', 'left-sleeve', 'right-sleeve'],
      image: '/variants/tshirt-vneck.svg',
    },
    {
      id: 'tshirt-crop',
      name: 'Crop Top',
      description: 'Trendy cropped length for modern styling.',
      fit: 'regular',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      features: ['Raw hem', 'Cropped length', 'Boxy fit'],
      basePrice: 17.99,
      printAreas: ['front', 'back'],
      image: '/variants/tshirt-crop.svg',
    },
  ],
  hoodie: [
    {
      id: 'hoodie-pullover',
      name: 'Pullover Hoodie',
      description: 'Classic pullover with kangaroo pocket.',
      fit: 'regular',
      sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
      features: ['Kangaroo pocket', 'Drawstring hood', 'Ribbed cuffs'],
      basePrice: 34.99,
      printAreas: ['front', 'back', 'left-sleeve', 'right-sleeve', 'hood'],
      image: '/variants/hoodie-pullover.svg',
    },
    {
      id: 'hoodie-zip',
      name: 'Zip-Up Hoodie',
      description: 'Full-zip front for versatile layering.',
      fit: 'regular',
      sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
      features: ['Full zipper', 'Split pockets', 'Hood'],
      basePrice: 36.99,
      printAreas: ['front-left', 'front-right', 'back', 'left-sleeve', 'right-sleeve'],
      image: '/variants/hoodie-zip.svg',
    },
    {
      id: 'hoodie-oversized',
      name: 'Oversized Hoodie',
      description: 'Relaxed streetwear fit with premium weight.',
      fit: 'oversized',
      sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
      features: ['Heavyweight fleece', 'Dropped shoulders', 'Extended hem'],
      basePrice: 44.99,
      printAreas: ['front', 'back', 'left-sleeve', 'right-sleeve', 'hood'],
      image: '/variants/hoodie-oversized.svg',
    },
    {
      id: 'hoodie-crop',
      name: 'Crop Hoodie',
      description: 'Modern cropped style with raw hem.',
      fit: 'regular',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      features: ['Raw hem', 'Crop length', 'Drawstring'],
      basePrice: 29.99,
      printAreas: ['front', 'back', 'left-sleeve', 'right-sleeve'],
      image: '/variants/hoodie-crop.svg',
    },
  ],
  tank: [
    {
      id: 'tank-classic',
      name: 'Classic Tank',
      description: 'Traditional tank top with straight cut.',
      fit: 'regular',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
      features: ['Straight cut', 'Standard straps', 'Lightweight'],
      basePrice: 14.99,
      printAreas: ['front', 'back'],
      image: '/variants/tank-classic.svg',
    },
    {
      id: 'tank-muscle',
      name: 'Muscle Tank',
      description: 'Dropped armholes for athletic look.',
      fit: 'regular',
      sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
      features: ['Dropped armholes', 'Low cut', 'Curved hem'],
      basePrice: 16.99,
      printAreas: ['front', 'back'],
      image: '/variants/tank-muscle.svg',
    },
    {
      id: 'tank-racerback',
      name: 'Racerback',
      description: 'Athletic style with T-back design.',
      fit: 'slim',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      features: ['T-back', 'Athletic fit', 'Moisture wicking'],
      basePrice: 15.99,
      printAreas: ['front', 'back'],
      image: '/variants/tank-racerback.svg',
    },
  ],
  longsleeve: [
    {
      id: 'longsleeve-classic',
      name: 'Classic Long Sleeve',
      description: 'Essential long sleeve for layering.',
      fit: 'regular',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      features: ['Ribbed cuffs', 'Crew neck', 'Lightweight'],
      basePrice: 22.99,
      printAreas: ['front', 'back', 'left-sleeve', 'right-sleeve'],
      image: '/variants/longsleeve-classic.svg',
    },
    {
      id: 'longsleeve-raglan',
      name: 'Raglan Long Sleeve',
      description: 'Sporty contrast sleeves with athletic fit.',
      fit: 'regular',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
      features: ['Contrast sleeves', 'Baseball style', 'Raglan cut'],
      basePrice: 24.99,
      printAreas: ['front', 'back', 'left-sleeve', 'right-sleeve'],
      image: '/variants/longsleeve-raglan.svg',
    },
    {
      id: 'longsleeve-thermal',
      name: 'Thermal Long Sleeve',
      description: 'Waffle knit texture for warmth.',
      fit: 'slim',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      features: ['Waffle knit', 'Crew neck', 'Warmth layer'],
      basePrice: 26.99,
      printAreas: ['front', 'back'],
      image: '/variants/longsleeve-thermal.svg',
    },
  ],
  sweatshirt: [
    {
      id: 'sweatshirt-crew',
      name: 'Crewneck Sweatshirt',
      description: 'Classic crewneck without hood.',
      fit: 'regular',
      sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
      features: ['Crew neck', 'Fleece lined', 'Ribbed trim'],
      basePrice: 29.99,
      printAreas: ['front', 'back', 'left-sleeve', 'right-sleeve'],
      image: '/variants/sweatshirt-crew.svg',
    },
    {
      id: 'sweatshirt-oversized',
      name: 'Oversized Crew',
      description: 'Relaxed fit with premium heavyweight feel.',
      fit: 'oversized',
      sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
      features: ['Heavyweight', 'Dropped shoulders', 'Relaxed fit'],
      basePrice: 39.99,
      printAreas: ['front', 'back', 'left-sleeve', 'right-sleeve'],
      image: '/variants/sweatshirt-oversized.svg',
    },
  ],
}

// Fit badge helper
function FitBadge({ fit }: { fit: FitType }) {
  const configs = {
    slim: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Slim Fit' },
    regular: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Regular Fit' },
    oversized: { color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', label: 'Oversized' },
  }

  const config = configs[fit]

  return (
    <Badge variant="outline" className={cn('text-[10px] font-medium', config.color)}>
      <Ruler className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  )
}

// Size availability indicator
function SizeIndicator({ sizes, maxShow = 4 }: { sizes: string[]; maxShow?: number }) {
  const visible = sizes.slice(0, maxShow)
  const remaining = sizes.length - maxShow

  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-zinc-500 mr-1">Sizes:</span>
      {visible.map((size) => (
        <span
          key={size}
          className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-[9px] font-medium text-zinc-400"
        >
          {size.replace('XL', 'X').replace('XS', 'XS')}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-[9px] text-zinc-500">+{remaining}</span>
      )}
    </div>
  )
}

export function VariantSelector({
  garmentType,
  selectedVariant,
  onChange,
  className,
}: VariantSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const variants = VARIANTS[garmentType] || []

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const selectedVariantData = variants.find(v => v.id === selectedVariant)

  return (
    <Card className={cn("bg-zinc-900 border-zinc-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-zinc-100 text-base font-medium flex items-center gap-2">
              <Shirt className="w-4 h-4 text-violet-400" />
              Style Variant
            </CardTitle>
            <CardDescription className="text-zinc-500 mt-1">
              Choose the cut and style for your {garmentType}
            </CardDescription>
          </div>
          {variants.length > 2 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Horizontal Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {variants.map((variant) => {
            const isSelected = selectedVariant === variant.id

            return (
              <button
                key={variant.id}
                onClick={() => onChange(variant.id)}
                className={cn(
                  "group flex-shrink-0 w-48 snap-start text-left rounded-lg border transition-all duration-200 overflow-hidden",
                  isSelected
                    ? "border-violet-500 bg-vinc-500/5 ring-1 ring-violet-500/50"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"
                )}
              >
                {/* Silhouette Preview */}
                <div className={cn(
                  "h-32 flex items-center justify-center border-b transition-colors",
                  isSelected ? "bg-violet-500/5 border-violet-500/20" : "bg-zinc-950 border-zinc-800"
                )}>
                  {/* Placeholder for silhouette - in real app would be an SVG/image */}
                  <div className="relative">
                    <div className={cn(
                      "w-16 h-20 rounded-lg border-2 flex items-center justify-center transition-colors",
                      isSelected 
                        ? "border-violet-500/50 bg-violet-500/10" 
                        : "border-zinc-700 bg-zinc-900 group-hover:border-zinc-600"
                    )}>
                      {isSelected ? (
                        <Check className="w-6 h-6 text-violet-400" />
                      ) : (
                        <Shirt className="w-8 h-8 text-zinc-700" />
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100">
                      {variant.name}
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">
                      {variant.description}
                    </p>
                  </div>

                  {/* Fit Badge */}
                  <FitBadge fit={variant.fit} />

                  {/* Sizes */}
                  <SizeIndicator sizes={variant.sizes} />

                  {/* Features Preview */}
                  <div className="flex items-center gap-1 pt-1">
                    <Sparkles className="w-3 h-3 text-zinc-600" />
                    <span className="text-[10px] text-zinc-500 truncate">
                      {variant.features.slice(0, 2).join(', ')}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-sm font-semibold">{variant.basePrice.toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] text-zinc-600">base</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Variant Details */}
        {selectedVariantData && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-zinc-200">
                  {selectedVariantData.name}
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  {selectedVariantData.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <FitBadge fit={selectedVariantData.fit} />
                  <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400 border-0">
                    <Maximize2 className="w-3 h-3 mr-1" />
                    {selectedVariantData.printAreas.length} print areas
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-lg font-semibold">{selectedVariantData.basePrice.toFixed(2)}</span>
                </div>
                <span className="text-[10px] text-zinc-500">starting price</span>
              </div>
            </div>

            {/* Print Areas */}
            <div className="mt-3">
              <span className="text-xs text-zinc-500">Available print areas:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {selectedVariantData.printAreas.map((area) => (
                  <Badge
                    key={area}
                    variant="secondary"
                    className="text-[10px] bg-zinc-800 text-zinc-400 capitalize border-0"
                  >
                    {area.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default VariantSelector
