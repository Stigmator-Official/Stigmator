"use client"

import React, { useState, useCallback } from "react"
import { Check, Droplets, Palette, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type FabricType = 'cotton' | 'ringspun' | 'polyester' | 'triblend' | 'fleece' | 'premium'

export interface GarmentColor {
  name: string
  hex: string
  fabric: FabricType
}

export interface GarmentColorPickerProps {
  selectedColor: string
  availableColors?: GarmentColor[]
  onChange: (color: string) => void
  onInvert?: () => void
  allowCustomColor?: boolean
  className?: string
}

// Pre-defined garment colors
const DEFAULT_GARMENT_COLORS: GarmentColor[] = [
  { name: 'White', hex: '#FFFFFF', fabric: 'cotton' },
  { name: 'Black', hex: '#1A1A1A', fabric: 'cotton' },
  { name: 'Heather Grey', hex: '#B0B0B0', fabric: 'triblend' },
  { name: 'Navy', hex: '#1A2744', fabric: 'cotton' },
  { name: 'Maroon', hex: '#6B1C23', fabric: 'cotton' },
  { name: 'Olive', hex: '#4A5320', fabric: 'cotton' },
  { name: 'Sand', hex: '#C2B280', fabric: 'ringspun' },
  { name: 'Royal Blue', hex: '#1E3A8A', fabric: 'cotton' },
  { name: 'Forest Green', hex: '#14532D', fabric: 'cotton' },
  { name: 'Charcoal', hex: '#374151', fabric: 'triblend' },
  { name: 'Burgundy', hex: '#7C2D12', fabric: 'ringspun' },
  { name: 'Mustard', hex: '#CA8A04', fabric: 'cotton' },
  { name: 'Teal', hex: '#0F766E', fabric: 'cotton' },
  { name: 'Slate Blue', hex: '#475569', fabric: 'polyester' },
  { name: 'Coral', hex: '#E11D48', fabric: 'cotton' },
  { name: 'Lavender', hex: '#7C3AED', fabric: 'ringspun' },
]

// Helper to determine if color is light or dark
const isLightColor = (hex: string): boolean => {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128
}

export function GarmentColorPicker({
  selectedColor,
  availableColors = DEFAULT_GARMENT_COLORS,
  onChange,
  onInvert,
  allowCustomColor = true,
  className,
}: GarmentColorPickerProps) {
  const [customColor, setCustomColor] = useState(selectedColor)
  const [showCustomInput, setShowCustomInput] = useState(false)

  const isCustomColor = !availableColors.some(c => c.hex.toLowerCase() === selectedColor.toLowerCase())

  const handleCustomColorChange = useCallback((value: string) => {
    setCustomColor(value)
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onChange(value)
    }
  }, [onChange])

  const handleColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase()
    if (!value.startsWith('#')) {
      value = '#' + value.replace(/[^0-9A-F]/gi, '')
    }
    if (value.length <= 7) {
      handleCustomColorChange(value)
    }
  }

  return (
    <Card className={cn("bg-zinc-900 border-zinc-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-zinc-100 text-base font-medium flex items-center gap-2">
            <Palette className="w-4 h-4 text-violet-400" />
            Garment Color
          </CardTitle>
          {onInvert && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onInvert}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 h-8 px-2"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Invert
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Color Grid */}
        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-6 gap-2">
            {availableColors.map((color) => {
              const isSelected = selectedColor.toLowerCase() === color.hex.toLowerCase()
              const lightColor = isLightColor(color.hex)

              return (
                <Tooltip key={color.hex}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onChange(color.hex)}
                      className={cn(
                        "group relative w-10 h-10 rounded-full transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900",
                        isSelected
                          ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-zinc-900 scale-110"
                          : "hover:scale-105 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-2 hover:ring-offset-zinc-900"
                      )}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Select ${color.name}`}
                    >
                      {isSelected && (
                        <span
                          className={cn(
                            "absolute inset-0 flex items-center justify-center",
                            lightColor ? "text-zinc-900" : "text-white"
                          )}
                        >
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </span>
                      )}
                      {/* Fabric indicator */}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-zinc-800 rounded-full flex items-center justify-center">
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            color.fabric === 'cotton' && "bg-emerald-400",
                            color.fabric === 'ringspun' && "bg-blue-400",
                            color.fabric === 'polyester' && "bg-amber-400",
                            color.fabric === 'triblend' && "bg-violet-400",
                            color.fabric === 'fleece' && "bg-rose-400",
                            color.fabric === 'premium' && "bg-amber-300"
                          )}
                        />
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{color.name}</span>
                      <span className="text-xs text-zinc-400">{color.hex}</span>
                      <Badge variant="secondary" className="text-[10px] w-fit bg-zinc-700 text-zinc-300">
                        {color.fabric}
                      </Badge>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}

            {/* Custom Color Button */}
            {allowCustomColor && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className={cn(
                      "w-10 h-10 rounded-full transition-all duration-200",
                      "flex items-center justify-center",
                      "bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500",
                      "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900",
                      isCustomColor
                        ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-zinc-900 scale-110"
                        : "hover:scale-105 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-2 hover:ring-offset-zinc-900"
                    )}
                    aria-label="Custom color"
                  >
                    <Droplets className="w-4 h-4 text-white" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                >
                  Custom color
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>

        {/* Custom Color Input */}
        {allowCustomColor && showCustomInput && (
          <div className="flex items-center gap-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative flex-1">
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded border border-zinc-600"
                style={{ backgroundColor: customColor }}
              />
              <Input
                type="text"
                value={customColor}
                onChange={handleColorInput}
                placeholder="#FFFFFF"
                className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:ring-violet-500/20 uppercase"
              />
            </div>
            <input
              type="color"
              value={customColor.startsWith('#') ? customColor : '#000000'}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
            />
          </div>
        )}

        {/* Selected Color Info */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-md border border-zinc-700"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-sm text-zinc-400">
              {availableColors.find(c => c.hex.toLowerCase() === selectedColor.toLowerCase())?.name || 'Custom'}
            </span>
          </div>
          <code className="text-xs text-zinc-500 font-mono">{selectedColor.toUpperCase()}</code>
        </div>
      </CardContent>
    </Card>
  )
}

export default GarmentColorPicker
