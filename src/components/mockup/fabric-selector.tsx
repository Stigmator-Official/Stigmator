"use client"

import React, { useState } from "react"
import { Layers, Info, Check, DollarSign, Leaf, Shield, Wind, Droplets } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type FabricType = 'cotton' | 'ringspun' | 'polyester' | 'triblend' | 'fleece' | 'premium'

export interface FabricProperties {
  softness: number
  durability: number
  breathability: number
  shrinkage: 'low' | 'medium' | 'high'
}

export interface Fabric {
  name: string
  description: string
  properties: FabricProperties
  texture: string
  priceModifier: number
  bestFor: string[]
  composition?: string
  weight?: string
  care?: string[]
}

export interface FabricSelectorProps {
  selectedFabric: FabricType
  onChange: (fabric: FabricType) => void
  className?: string
}

export const FABRICS: Record<FabricType, Fabric> = {
  cotton: {
    name: '100% Cotton',
    description: 'Classic, breathable natural fiber. The industry standard for everyday comfort.',
    properties: {
      softness: 7,
      durability: 7,
      breathability: 9,
      shrinkage: 'medium',
    },
    texture: '/textures/cotton.jpg',
    priceModifier: 1.0,
    bestFor: ['Daily wear', 'Screen printing', 'DTG', 'Budget-friendly'],
    composition: '100% Ring-Spun Cotton',
    weight: '5.3 oz / 180 gsm',
    care: ['Machine wash cold', 'Tumble dry low', 'Do not bleach'],
  },
  ringspun: {
    name: 'Ringspun Cotton',
    description: 'Ultra-soft, premium cotton with a smooth finish. Twisted and thinned for luxury feel.',
    properties: {
      softness: 9,
      durability: 8,
      breathability: 8,
      shrinkage: 'low',
    },
    texture: '/textures/ringspun.jpg',
    priceModifier: 1.15,
    bestFor: ['Premium apparel', 'Retail brands', 'Detailed prints', 'All-day comfort'],
    composition: '100% Combed Ringspun Cotton',
    weight: '4.3 oz / 145 gsm',
    care: ['Machine wash cold', 'Tumble dry low', 'Pre-shrunk'],
  },
  polyester: {
    name: 'Polyester',
    description: 'Performance fabric with moisture-wicking properties. Built for active lifestyles.',
    properties: {
      softness: 6,
      durability: 9,
      breathability: 6,
      shrinkage: 'low',
    },
    texture: '/textures/polyester.jpg',
    priceModifier: 0.9,
    bestFor: ['Athletic wear', 'Moisture control', 'Sublimation', 'Workout gear'],
    composition: '100% Polyester',
    weight: '3.8 oz / 130 gsm',
    care: ['Machine wash cold', 'Tumble dry low', 'Quick dry'],
  },
  triblend: {
    name: 'Triblend',
    description: 'The perfect blend of cotton, polyester, and rayon. Unmatched softness with vintage feel.',
    properties: {
      softness: 10,
      durability: 7,
      breathability: 8,
      shrinkage: 'low',
    },
    texture: '/textures/triblend.jpg',
    priceModifier: 1.35,
    bestFor: ['Retail quality', 'Vintage looks', 'DTG printing', 'Premium brands'],
    composition: '50% Poly / 25% Cotton / 25% Rayon',
    weight: '3.4 oz / 115 gsm',
    care: ['Machine wash cold', 'Tumble dry low', 'Delicate cycle'],
  },
  fleece: {
    name: 'Fleece',
    description: 'Cozy brushed interior for warmth. Perfect for hoodies and sweatshirts.',
    properties: {
      softness: 9,
      durability: 8,
      breathability: 5,
      shrinkage: 'medium',
    },
    texture: '/textures/fleece.jpg',
    priceModifier: 1.25,
    bestFor: ['Hoodies', 'Sweatshirts', 'Cold weather', 'Loungewear'],
    composition: '80% Cotton / 20% Poly Fleece',
    weight: '8.5 oz / 290 gsm',
    care: ['Machine wash cold', 'Tumble dry low', 'Wash inside out'],
  },
  premium: {
    name: 'Premium Heavyweight',
    description: 'Luxury heavyweight cotton with structured drape. Streetwear and fashion-forward.',
    properties: {
      softness: 8,
      durability: 10,
      breathability: 7,
      shrinkage: 'low',
    },
    texture: '/textures/premium.jpg',
    priceModifier: 1.6,
    bestFor: ['Streetwear', 'Fashion brands', 'Embroidery', 'Structured fit'],
    composition: '100% Heavyweight Cotton',
    weight: '7.5 oz / 255 gsm',
    care: ['Machine wash cold', 'Hang dry preferred', 'Pre-shrunk'],
  },
}

// Property bar component
function PropertyBar({ 
  label, 
  value, 
  icon: Icon, 
  color 
}: { 
  label: string
  value: number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
        <span className="text-zinc-500">{value}/10</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  )
}

// Shrinkage badge
function ShrinkageBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const colors = {
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }

  return (
    <Badge variant="outline" className={cn('text-[10px] font-medium', colors[level])}>
      {level} shrinkage
    </Badge>
  )
}

export function FabricSelector({
  selectedFabric,
  onChange,
  className,
}: FabricSelectorProps) {
  const [detailFabric, setDetailFabric] = useState<FabricType | null>(null)

  return (
    <Card className={cn("bg-zinc-900 border-zinc-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-zinc-100 text-base font-medium flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            Fabric Type
          </CardTitle>
        </div>
        <CardDescription className="text-zinc-500">
          Select material that affects look, feel, and print quality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(FABRICS).map(([type, fabric]) => {
          const isSelected = selectedFabric === type
          const fabricType = type as FabricType

          return (
            <div
              key={type}
              className={cn(
                "group relative rounded-lg border transition-all duration-200 overflow-hidden",
                isSelected
                  ? "border-violet-500 bg-violet-500/5"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"
              )}
            >
              <button
                onClick={() => onChange(fabricType)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start gap-4">
                  {/* Texture Preview */}
                  <div className={cn(
                    "w-16 h-16 rounded-lg border flex-shrink-0 flex items-center justify-center",
                    isSelected ? "border-violet-500/50 bg-violet-500/10" : "border-zinc-700 bg-zinc-900"
                  )}>
                    {isSelected ? (
                      <Check className="w-6 h-6 text-violet-400" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-zinc-700 to-zinc-800" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100">
                          {fabric.name}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                          {fabric.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <DollarSign className="w-3 h-3" />
                        <span className="text-xs font-medium">
                          {fabric.priceModifier === 1 ? 'Base' : `+${Math.round((fabric.priceModifier - 1) * 100)}%`}
                        </span>
                      </div>
                    </div>

                    {/* Properties Preview */}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <PropertyBar
                        label="Soft"
                        value={fabric.properties.softness}
                        icon={Leaf}
                        color="bg-emerald-500"
                      />
                      <PropertyBar
                        label="Durable"
                        value={fabric.properties.durability}
                        icon={Shield}
                        color="bg-blue-500"
                      />
                      <PropertyBar
                        label="Breathable"
                        value={fabric.properties.breathability}
                        icon={Wind}
                        color="bg-cyan-500"
                      />
                    </div>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <ShrinkageBadge level={fabric.properties.shrinkage} />
                      {fabric.bestFor.slice(0, 2).map((use) => (
                        <Badge
                          key={use}
                          variant="secondary"
                          className="text-[10px] bg-zinc-800 text-zinc-400 border-0"
                        >
                          {use}
                        </Badge>
                      ))}
                      {fabric.bestFor.length > 2 && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-zinc-800 text-zinc-400 border-0"
                        >
                          +{fabric.bestFor.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Detail Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDetailFabric(fabricType)
                        }}
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-zinc-100 flex items-center gap-2">
                          {fabric.name}
                          <Badge variant="secondary" className="text-xs bg-violet-500/10 text-violet-400">
                            {fabric.priceModifier === 1 ? 'Base Price' : `${Math.round(fabric.priceModifier * 100)}% Price`}
                          </Badge>
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                          {fabric.description}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 pt-4">
                        {/* Full Properties */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-zinc-300">Properties</h4>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-zinc-400">Softness</span>
                                <span className="text-zinc-500">{fabric.properties.softness}/10</span>
                              </div>
                              <Progress value={fabric.properties.softness * 10} className="h-2 bg-zinc-800" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-zinc-400">Durability</span>
                                <span className="text-zinc-500">{fabric.properties.durability}/10</span>
                              </div>
                              <Progress value={fabric.properties.durability * 10} className="h-2 bg-zinc-800" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-zinc-400">Breathability</span>
                                <span className="text-zinc-500">{fabric.properties.breathability}/10</span>
                              </div>
                              <Progress value={fabric.properties.breathability * 10} className="h-2 bg-zinc-800" />
                            </div>
                          </div>
                          <ShrinkageBadge level={fabric.properties.shrinkage} />
                        </div>

                        {/* Composition & Weight */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-zinc-500 block text-xs mb-1">Composition</span>
                            <span className="text-zinc-300">{fabric.composition}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-xs mb-1">Weight</span>
                            <span className="text-zinc-300">{fabric.weight}</span>
                          </div>
                        </div>

                        {/* Best For */}
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-2">Best For</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {fabric.bestFor.map((use) => (
                              <Badge
                                key={use}
                                variant="secondary"
                                className="bg-zinc-800 text-zinc-300 border-0"
                              >
                                {use}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Care Instructions */}
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-2">Care Instructions</h4>
                          <ul className="text-sm text-zinc-400 space-y-1">
                            {fabric.care?.map((instruction, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                {instruction}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default FabricSelector
