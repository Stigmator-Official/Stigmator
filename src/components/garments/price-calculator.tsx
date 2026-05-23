"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2, Info, DollarSign, Gift } from "lucide-react"

interface PriceCalculatorProps {
  manufacturingCost: number
  platformFeePercent?: number
  onPriceChange: (price: number, isValid: boolean, profit: number) => void
  initialPrice?: number
}

export function PriceCalculator({
  manufacturingCost,
  platformFeePercent = 15,
  onPriceChange,
  initialPrice
}: PriceCalculatorProps) {
  const [price, setPrice] = useState(initialPrice || Math.round(manufacturingCost * 2.5))
  const [showBreakdown, setShowBreakdown] = useState(true)

  // Calculations (15% platform + 5% referrer, then manufacturing, rest to artist)
  const platformFee = Math.round(price * 0.15)
  const referrerFee = Math.round(price * 0.05)
  const netRevenue = price - platformFee - referrerFee
  const profit = netRevenue - manufacturingCost
  const isValid = price >= manufacturingCost
  const profitMargin = price > 0 ? ((profit / price) * 100).toFixed(1) : "0"
  
  // Platform fee visual breakdown percentages
  const platformFeeShare = price > 0 ? 15 : 0
  const manufacturingShare = price > 0 ? Math.round((manufacturingCost / price) * 100) : 0
  const profitShare = price > 0 ? Math.round((profit / price) * 100) + 5 : 0 // +5 to account for visual bar with referrer
  
  // Minimum price recommendations
  const minPrice = manufacturingCost
  const recommendedPrice = Math.round(manufacturingCost * 2.5) // 2.5x markup
  const premiumPrice = Math.round(manufacturingCost * 4)

  useEffect(() => {
    onPriceChange(price, isValid, profit)
  }, [price, isValid, profit, onPriceChange])

  const handlePriceChange = (value: string) => {
    const newPrice = parseInt(value) || 0
    setPrice(newPrice)
  }

  return (
    <div className="space-y-6">
      {/* Price Input with Floor Warning */}
      <div className={`p-6 border-2 ${
        !isValid 
          ? "border-[#dc2626] bg-[#dc2626]/5" 
          : price < recommendedPrice 
            ? "border-[#fbbf24] bg-[#fbbf24]/5"
            : "border-[#4ade80] bg-[#4ade80]/5"
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-black tracking-tighter text-lg text-[#e8f5e8] flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#4ade80]" />
              SET YOUR PRICE
            </h3>
            <p className="text-sm text-[#6b8e6b] mt-1">
              Price must be at least ${manufacturingCost} (manufacturing cost)
            </p>
          </div>
          {!isValid && (
            <div className="flex items-center gap-2 text-[#dc2626]">
              <AlertCircle className="h-5 w-5" />
              <span className="font-black text-sm">BELOW MINIMUM</span>
            </div>
          )}
        </div>

        {/* Price Input */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl font-black text-[#e8f5e8]">$</span>
          <Input
            type="number"
            value={price}
            onChange={(e) => handlePriceChange(e.target.value)}
            min={manufacturingCost}
            className={`bg-[#050805] border-2 rounded-none h-16 text-3xl font-black text-[#e8f5e8] focus:border-[#4ade80] ${
              !isValid ? "border-[#dc2626]" : "border-[#1a2e1a]"
            }`}
          />
        </div>

        {/* Price Floor Indicator */}
        <div className="relative h-2 bg-[#1a2e1a] mb-2">
          {/* Minimum marker */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-[#dc2626]"
            style={{ left: `${(manufacturingCost / Math.max(price * 1.5, manufacturingCost * 2)) * 100}%` }}
          />
          {/* Current price marker */}
          <div 
            className={`absolute top-0 bottom-0 w-1 transition-all ${
              isValid ? "bg-[#4ade80]" : "bg-[#dc2626]"
            }`}
            style={{ left: `${Math.min((price / Math.max(price * 1.5, manufacturingCost * 2)) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#dc2626] font-black">MIN: ${manufacturingCost}</span>
          <span className="text-[#6b8e6b]">Current: ${price}</span>
        </div>

        {/* Quick Price Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setPrice(minPrice)}
            disabled={!isValid}
            className="flex-1 p-2 border border-[#dc2626] text-[#dc2626] text-xs font-black hover:bg-[#dc2626]/10 disabled:opacity-30"
          >
            MIN (${minPrice})
          </button>
          <button
            onClick={() => setPrice(recommendedPrice)}
            className="flex-1 p-2 border border-[#4ade80] text-[#4ade80] text-xs font-black hover:bg-[#4ade80]/10"
          >
            RECOMMENDED (${recommendedPrice})
          </button>
          <button
            onClick={() => setPrice(premiumPrice)}
            className="flex-1 p-2 border border-[#fbbf24] text-[#fbbf24] text-xs font-black hover:bg-[#fbbf24]/10"
          >
            PREMIUM (${premiumPrice})
          </button>
        </div>

        {/* Revenue Split Visualization */}
        {isValid && (
          <div className="mt-6 pt-4 border-t border-[#1a2e1a]">
            <p className="text-xs font-mono text-[#6b8e6b] mb-2">REVENUE SPLIT ON ${price} SALE</p>
            
            {/* Visual Bar */}
            <div className="h-8 flex w-full">
              {/* Platform Fee: 15% */}
              <div 
                className="bg-[#f97316] flex items-center justify-center text-xs font-black text-[#080a08]"
                style={{ width: `${15}%`, minWidth: '40px' }}
              >
                15%
              </div>
              {/* Referrer Fee: 5% */}
              <div 
                className="bg-[#a855f7] flex items-center justify-center text-xs font-black text-[#080a08]"
                style={{ width: `${5}%`, minWidth: '35px' }}
              >
                5%
              </div>
              {/* Manufacturing Cost */}
              <div 
                className="bg-[#dc2626] flex items-center justify-center text-xs font-black text-[#080a08]"
                style={{ width: `${manufacturingShare}%`, minWidth: manufacturingShare > 8 ? 'auto' : '30px' }}
              >
                {manufacturingShare > 12 && `${manufacturingShare}%`}
              </div>
              {/* Artist Profit */}
              <div 
                className="bg-[#4ade80] flex items-center justify-center text-xs font-black text-[#080a08]"
                style={{ width: `${Math.max(profitShare - 5, 0)}%`, minWidth: profitShare > 12 ? 'auto' : '30px' }}
              >
                {profitShare > 17 && `${profitShare - 5}%`}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#f97316]" />
                <span className="text-[#6b8e6b]">Platform (15%)</span>
                <span className="font-black text-[#e8f5e8]">${platformFee}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#dc2626]" />
                <span className="text-[#6b8e6b]">Mfg Cost</span>
                <span className="font-black text-[#e8f5e8]">${manufacturingCost}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#a855f7]" />
                <span className="text-[#6b8e6b]">Referrer (5%)</span>
                <span className="font-black text-[#a855f7]">${referrerFee}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#4ade80]" />
                <span className="text-[#6b8e6b]">Your Profit</span>
                <span className="font-black text-[#4ade80]">${profit}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profit Calculator */}
      {isValid && (
        <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black tracking-tighter text-sm text-[#e8f5e8]">
              NET PROFIT CALCULATOR
            </h4>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs text-[#6b8e6b] hover:text-[#4ade80] flex items-center gap-1"
            >
              <Info className="h-3 w-3" />
              {showBreakdown ? "HIDE" : "SHOW"} BREAKDOWN
            </button>
          </div>

          {/* Main Profit Display */}
          <div className="text-center p-6 bg-[#050805] border border-[#1a2e1a]">
            <div className="text-xs font-mono text-[#6b8e6b] mb-1">YOUR NET PROFIT PER SALE</div>
            <div className={`text-5xl font-black ${profit > 0 ? "text-[#4ade80]" : "text-[#dc2626]"}`}>
              ${profit}
            </div>
            <div className="text-sm text-[#6b8e6b] mt-2">
              {profitMargin}% profit margin
            </div>
          </div>

          {/* Detailed Breakdown */}
          {showBreakdown && (
            <div className="mt-4 space-y-3 p-4 bg-[#050805] border border-[#1a2e1a]">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b8e6b]">Retail Price</span>
                <span className="font-black text-[#e8f5e8]">${price}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-[#6b8e6b]">Platform Fee (15%)</span>
                <span className="font-black text-[#f97316]">-${platformFee}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-[#6b8e6b]">Manufacturing Cost</span>
                <span className="font-black text-[#dc2626]">-${manufacturingCost}</span>
              </div>
              
              {/* Referral Commission Note */}
              <div className="flex justify-between text-sm p-2 bg-[#a855f7]/10 border border-[#a855f7]/30">
                <span className="text-[#6b8e6b] flex items-center gap-1">
                  <Gift className="h-3 w-3 text-[#a855f7]" />
                  Referrer Bonus (5%)
                </span>
                <span className="font-black text-[#a855f7]">-${referrerFee}</span>
              </div>
              
              <div className="border-t border-[#1a2e1a] pt-2 flex justify-between">
                <span className="font-black text-[#e8f5e8]">YOUR NET PROFIT</span>
                <span className={`font-black text-xl ${profit > 0 ? "text-[#4ade80]" : "text-[#dc2626]"}`}>
                  ${profit}
                </span>
              </div>
              
              <p className="text-xs text-[#6b8e6b] mt-2">
                * If you were referred by another artist, they receive 5% of your sales for 6 months.
                If not, that 5% stays in your pocket!
              </p>
            </div>
          )}

          {/* Profit Health Indicator */}
          <div className="mt-4 p-3 border border-[#1a2e1a]">
            {profit < 10 && (
              <div className="flex items-start gap-2 text-[#dc2626]">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Low Profit Warning:</strong> At this price, you're making less than $10 per sale. 
                  Consider increasing your price to at least ${recommendedPrice}.
                </p>
              </div>
            )}
            {profit >= 10 && profit < 50 && price < recommendedPrice && (
              <div className="flex items-start gap-2 text-[#fbbf24]">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Moderate Profit:</strong> You're making a reasonable profit. 
                  Consider the recommended price of ${recommendedPrice} for better margins.
                </p>
              </div>
            )}
            {profit >= 10 && profit < 50 && price >= recommendedPrice && (
              <div className="flex items-start gap-2 text-[#4ade80]">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Good Profit:</strong> You're at or above the recommended price with healthy margins.
                </p>
              </div>
            )}
            {profit >= 50 && (
              <div className="flex items-start gap-2 text-[#4ade80]">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Excellent Profit:</strong> Great pricing! This gives you strong margins 
                  while remaining competitive.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validation Message */}
      {!isValid && (
        <div className="p-4 bg-[#dc2626]/10 border border-[#dc2626] flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-[#dc2626]">PRICE TOO LOW</p>
            <p className="text-sm text-[#e8f5e8]">
              Your price must be at least ${manufacturingCost} to cover manufacturing costs. 
              You cannot list items below this amount.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
