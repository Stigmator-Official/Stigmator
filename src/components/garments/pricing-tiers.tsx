"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  DollarSign, 
  CheckCircle2,
  Plus,
  X,
  Flame
} from "lucide-react"

interface PricingTier {
  id: string
  unitThreshold: number
  price: number
  label: string
}

interface PricingTiersConfig {
  enabled: boolean
  basePrice: number
  finalPrice: number
  tiers: PricingTier[]
  urgencyMessage: string
}

interface PricingTiersProps {
  baseCost: number
  onChange: (config: PricingTiersConfig) => void
}

export function PricingTiers({ baseCost, onChange }: PricingTiersProps) {
  const [enabled, setEnabled] = useState(false)
  const [basePrice, setBasePrice] = useState(Math.round(baseCost * 2.5))
  const [tiers, setTiers] = useState<PricingTier[]>([
    { id: "1", unitThreshold: 0, price: Math.round(baseCost * 2.5), label: "Regular" }
  ])
  const [urgencyMessage, setUrgencyMessage] = useState("Only {remaining} left at this price!")

  const recommendedPrice = Math.round(baseCost * 2.5)
  const platformFee = (price: number) => Math.round(price * 0.15)
  const artistProfit = (price: number) => price - baseCost - platformFee(price)

  useEffect(() => {
    onChange({
      enabled,
      basePrice,
      finalPrice: tiers[tiers.length - 1]?.price || basePrice,
      tiers: enabled ? tiers : [{ id: "1", unitThreshold: 0, price: basePrice, label: "Regular" }],
      urgencyMessage
    })
  }, [enabled, basePrice, tiers, urgencyMessage, onChange])

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1]
    const newTier: PricingTier = {
      id: Math.random().toString(36).substr(2, 9),
      unitThreshold: lastTier.unitThreshold + 10,
      price: lastTier.price + 10,
      label: `Tier ${tiers.length + 1}`
    }
    setTiers([...tiers, newTier])
  }

  const removeTier = (id: string) => {
    if (tiers.length <= 1) return
    setTiers(tiers.filter(t => t.id !== id))
  }

  const updateTier = (id: string, updates: Partial<PricingTier>) => {
    const newTiers = tiers.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ).sort((a, b) => a.unitThreshold - b.unitThreshold)
    setTiers(newTiers)
  }

  return (
    <div className="space-y-6">
      {/* Enable Toggle */}
      <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-black tracking-tighter text-lg text-[#e8f5e8] flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#4ade80]" />
              DYNAMIC PRICING
            </h3>
            <p className="text-sm text-[#6b8e6b] mt-1">
              Adjust price based on sales milestones - create urgency and reward early buyers
            </p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-14 h-7 flex items-center transition-colors ${
              enabled ? 'bg-[#4ade80]' : 'bg-[#1a2e1a]'
            }`}
          >
            <div className={`w-5 h-5 bg-[#e8f5e8] transform transition-transform ${
              enabled ? 'translate-x-8' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {enabled && (
        <>
          {/* Base Price */}
          <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
            <h4 className="font-black tracking-tighter text-sm text-[#e8f5e8] mb-4">
              BASE PRICE (STARTING PRICE)
            </h4>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-black text-[#e8f5e8]">$</span>
                  <Input
                    type="number"
                    value={basePrice}
                    onChange={(e) => {
                      const newPrice = parseInt(e.target.value) || 0
                      setBasePrice(newPrice)
                      setTiers(prev => prev.map((t, i) => 
                        i === 0 ? { ...t, price: newPrice } : t
                      ))
                    }}
                    className="bg-[#050805] border-[#1a2e1a] rounded-none h-14 text-2xl font-black text-[#e8f5e8] focus:border-[#4ade80]"
                  />
                </div>
                <p className="text-xs text-[#6b8e6b]">
                  Recommended: ${recommendedPrice} (2.5x manufacturing cost)
                </p>
              </div>
              <div className="px-4 py-3 bg-[#050805] border border-[#1a2e1a] text-right">
                <div className="text-xs font-mono text-[#6b8e6b]">YOUR PROFIT</div>
                <div className="text-xl font-black text-[#4ade80]">${artistProfit(basePrice)}</div>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black tracking-tighter text-sm text-[#e8f5e8]">
                PRICING TIERS
              </h4>
              <Button
                onClick={addTier}
                variant="outline"
                className="rounded-none border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80] hover:text-black text-xs font-black"
              >
                <Plus className="h-4 w-4 mr-1" />
                ADD TIER
              </Button>
            </div>

            <div className="space-y-3">
              {tiers.map((tier, index) => (
                <div 
                  key={tier.id}
                  className={`p-4 border ${
                    index === 0 ? "border-[#4ade80] bg-[#4ade80]/5" : "border-[#1a2e1a]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#1a2e1a] flex items-center justify-center font-black text-[#4ade80]">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-mono text-[#6b8e6b] block mb-1">
                          AFTER SALES
                        </label>
                        <Input
                          type="number"
                          value={tier.unitThreshold}
                          onChange={(e) => updateTier(tier.id, { unitThreshold: parseInt(e.target.value) || 0 })}
                          disabled={index === 0}
                          className="bg-[#050805] border-[#1a2e1a] rounded-none h-10 font-black text-[#e8f5e8] disabled:opacity-50"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-mono text-[#6b8e6b] block mb-1">
                          PRICE
                        </label>
                        <div className="flex items-center">
                          <span className="text-[#e8f5e8] mr-2">$</span>
                          <Input
                            type="number"
                            value={tier.price}
                            onChange={(e) => updateTier(tier.id, { price: parseInt(e.target.value) || 0 })}
                            className="bg-[#050805] border-[#1a2e1a] rounded-none h-10 font-black text-[#e8f5e8]"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-mono text-[#6b8e6b] block mb-1">
                          LABEL
                        </label>
                        <Input
                          value={tier.label}
                          onChange={(e) => updateTier(tier.id, { label: e.target.value })}
                          className="bg-[#050805] border-[#1a2e1a] rounded-none h-10 font-black text-[#e8f5e8]"
                        />
                      </div>
                    </div>
                    
                    {tiers.length > 1 && (
                      <button
                        onClick={() => removeTier(tier.id)}
                        className="p-2 text-[#6b8e6b] hover:text-[#dc2626]"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgency Message */}
          <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
            <h4 className="font-black tracking-tighter text-sm text-[#e8f5e8] mb-4 flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#dc2626]" />
              URGENCY MESSAGE
            </h4>
            <Input
              value={urgencyMessage}
              onChange={(e) => setUrgencyMessage(e.target.value)}
              className="bg-[#050805] border-[#1a2e1a] rounded-none h-12 font-black text-[#e8f5e8] mb-2"
            />
            <p className="text-xs text-[#6b8e6b]">
              Use remaining to show units left at current price
            </p>
            <div className="mt-3 p-3 bg-[#050805] border border-[#1a2e1a]">
              <p className="text-sm text-[#6b8e6b]">Preview:</p>
              <p className="text-lg font-black text-[#dc2626]">
                {urgencyMessage.replace("{remaining}", "3")}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-[#4ade80]/5 border border-[#4ade80]/20 p-6">
            <h4 className="font-black tracking-tighter text-[#4ade80] mb-4">
              PRICING SUMMARY
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs font-mono text-[#6b8e6b]">STARTING PRICE</div>
                <div className="text-2xl font-black text-[#e8f5e8]">${tiers[0]?.price}</div>
              </div>
              <div>
                <div className="text-xs font-mono text-[#6b8e6b]">TIERS</div>
                <div className="text-2xl font-black text-[#e8f5e8]">{tiers.length}</div>
              </div>
              <div>
                <div className="text-xs font-mono text-[#6b8e6b]">FINAL PRICE</div>
                <div className="text-2xl font-black text-[#4ade80]">${tiers[tiers.length - 1]?.price}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {!enabled && (
        <div className="bg-[#1a2e1a]/50 border border-[#1a2e1a] p-6 text-center">
          <DollarSign className="h-12 w-12 mx-auto mb-3 text-[#1a2e1a]" />
          <p className="text-[#6b8e6b]">
            Fixed pricing at <strong className="text-[#e8f5e8]">${basePrice}</strong> for all sales.
            <br />
            Enable dynamic pricing to create urgency and maximize revenue.
          </p>
        </div>
      )}
    </div>
  )
}
