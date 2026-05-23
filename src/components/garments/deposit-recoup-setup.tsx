"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Info, TrendingUp, Clock, AlertCircle } from "lucide-react"

interface DepositRecoupSetupProps {
  depositAmount: number
  retailPrice: number
  platformFeePercent?: number
  onRecoupChange: (config: {
    enabled: boolean
    salesTarget: number
  }) => void
}

export function DepositRecoupSetup({
  depositAmount,
  retailPrice,
  platformFeePercent = 15,
  onRecoupChange,
}: DepositRecoupSetupProps) {
  const [enabled, setEnabled] = useState(true)
  const [salesTarget, setSalesTarget] = useState(5)

  const platformFee = retailPrice * (platformFeePercent / 100)
  const remainingPerSale = retailPrice - platformFee
  const totalRecoupPotential = remainingPerSale * salesTarget
  const recoupComplete = totalRecoupPotential >= depositAmount
  const excessAfterRecoup = totalRecoupPotential - depositAmount

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    onRecoupChange({ enabled: checked, salesTarget })
  }

  const handleSalesChange = (value: number) => {
    setSalesTarget(value)
    onRecoupChange({ enabled, salesTarget: value })
  }

  return (
    <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-black tracking-tighter text-lg text-[#e8f5e8] flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#4ade80]" />
            DEPOSIT RECOUP
          </h3>
          <p className="text-sm text-[#6b8e6b] mt-1">
            Get your deposit back through first sales before normal splits begin
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-[#4ade80]"
        />
      </div>

      {enabled && (
        <>
          {/* Deposit Info */}
          <div className="bg-[#050805] border border-[#1a2e1a] p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono text-[#6b8e6b]">YOUR DEPOSIT</span>
              <span className="text-2xl font-black text-[#e8f5e8]">${depositAmount}</span>
            </div>
            <p className="text-xs text-[#6b8e6b]">
              Covers: Mockup creation, advertising space, platform listing
            </p>
          </div>

          {/* Sales Target */}
          <div>
            <label className="text-xs font-mono text-[#6b8e6b] block mb-3">
              RECOUP OVER HOW MANY SALES?
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="20"
                value={salesTarget}
                onChange={(e) => handleSalesChange(parseInt(e.target.value))}
                className="flex-1 h-2 bg-[#1a2e1a] appearance-none cursor-pointer"
              />
              <div className="w-20 text-center">
                <span className="text-2xl font-black text-[#4ade80]">{salesTarget}</span>
                <span className="text-xs text-[#6b8e6b] block">SALES</span>
              </div>
            </div>
            <div className="flex justify-between text-xs font-mono text-[#6b8e6b] mt-1">
              <span>Quick (1)</span>
              <span>Standard (5)</span>
              <span>Slow (20)</span>
            </div>
          </div>

          {/* Recoup Projection */}
          <div className="bg-[#050805] border border-[#1a2e1a] p-4 space-y-3">
            <h4 className="font-black tracking-tighter text-sm text-[#e8f5e8]">
              RECOUP PROJECTION
            </h4>

            {/* Per Sale */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6b8e6b]">Per Sale (after platform fee)</span>
              <span className="font-black text-[#4ade80]">${remainingPerSale.toFixed(2)}</span>
            </div>

            {/* Total Recoup Potential */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6b8e6b]">Total from {salesTarget} sales</span>
              <span className="font-black text-[#4ade80]">${totalRecoupPotential.toFixed(2)}</span>
            </div>

            {/* Deposit Coverage */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6b8e6b]">Deposit coverage</span>
              <span className={`font-black ${recoupComplete ? 'text-[#4ade80]' : 'text-[#f97316]'}`}>
                {Math.round((totalRecoupPotential / depositAmount) * 100)}%
              </span>
            </div>

            {/* Status */}
            <div className={`p-3 border ${recoupComplete ? 'border-[#4ade80] bg-[#4ade80]/10' : 'border-[#f97316] bg-[#f97316]/10'}`}>
              {recoupComplete ? (
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-[#4ade80]" />
                  <span className="text-sm font-black text-[#4ade80]">
                    FULLY COVERED + ${excessAfterRecoup.toFixed(2)} PROFIT
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-[#f97316]" />
                  <span className="text-sm font-black text-[#f97316]">
                    WON'T FULLY COVER - Increase sales target
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* What Partners See */}
          <div className="border border-[#1a2e1a] p-4">
            <h4 className="font-black tracking-tighter text-sm text-[#e8f5e8] flex items-center mb-3">
              <Info className="h-4 w-4 mr-2" />
              WHAT YOUR PARTNERS WILL SEE
            </h4>
            <div className="bg-[#050805] p-3 text-sm font-mono space-y-2">
              <p className="text-[#6b8e6b]">
                &quot;This garment is in <span className="text-[#f97316]">DEPOSIT RECOUP</span> phase.
              </p>
              <p className="text-[#6b8e6b]">
                Artist is recovering their investment over the first {salesTarget} sales.
              </p>
              <p className="text-[#6b8e6b]">
                Your partnership earnings begin after sale #{salesTarget}.
              </p>
              <p className="text-[#4ade80]">
                Estimated start: {Math.ceil(salesTarget * 0.5)}-{Math.ceil(salesTarget * 0.8)} weeks
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-start space-x-3 text-sm">
            <Clock className="h-5 w-5 text-[#6b8e6b] mt-0.5" />
            <div className="text-[#6b8e6b]">
              <p className="font-black text-[#e8f5e8]">SALES 1-{salesTarget}: RECOUP PHASE</p>
              <p>You receive 100% of remaining revenue (${remainingPerSale.toFixed(2)}/sale)</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-sm">
            <TrendingUp className="h-5 w-5 text-[#4ade80] mt-0.5" />
            <div className="text-[#6b8e6b]">
              <p className="font-black text-[#e8f5e8]">SALE {salesTarget + 1}+: NORMAL SPLITS</p>
              <p>Your configured splits with partners begin</p>
            </div>
          </div>
        </>
      )}

      {!enabled && (
        <div className="bg-[#1a2e1a]/50 border border-[#1a2e1a] p-4 text-center">
          <p className="text-sm text-[#6b8e6b]">
            Normal splits will begin from sale #1.
            <br />
            You won&apos;t receive additional compensation for your deposit.
          </p>
        </div>
      )}
    </div>
  )
}
