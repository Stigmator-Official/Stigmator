"use client"

import { useState, useEffect } from "react"
import { Gift } from "lucide-react"
import { getArtistReferralInfo, calculateRevenueSplit } from "@/lib/api/referrals"

interface SplitVisualizerProps {
  saleAmount: number
  artistId?: string
}

export function SplitVisualizer({ saleAmount, artistId }: SplitVisualizerProps) {
  const [referralInfo, setReferralInfo] = useState<{
    has_referral: boolean
    referrer_id: string | null
    commission_rate: number
    expires_at: string | null
  } | null>(null)

  useEffect(() => {
    if (artistId) {
      getArtistReferralInfo(artistId).then(setReferralInfo)
    }
  }, [artistId])

  const split = calculateRevenueSplit(
    saleAmount,
    referralInfo?.has_referral || false,
    referralInfo?.commission_rate || 0.05
  )

  const platformPercent = 15
  const artistPercent = Math.round((split.artist / saleAmount) * 100)
  const referrerPercent = referralInfo?.has_referral 
    ? Math.round((split.referrer / saleAmount) * 100) 
    : 0
  const manufacturingPercent = Math.round((split.manufacturing / saleAmount) * 100)

  return (
    <div className="space-y-4">
      {/* Visual Bar */}
      <div className="relative h-12 flex w-full overflow-hidden">
        {/* Platform Fee - 15% */}
        <div 
          className="bg-[#f97316] flex items-center justify-center text-xs font-black text-[#080a08] border-r border-[#080a08]"
          style={{ width: `${platformPercent}%` }}
        >
          {platformPercent >= 8 && `${platformPercent}%`}
        </div>
        
        {/* Artist - varies based on referral */}
        <div 
          className="bg-[#4ade80] flex items-center justify-center text-xs font-black text-[#080a08] border-r border-[#080a08]"
          style={{ width: `${artistPercent}%` }}
        >
          {artistPercent >= 8 && `${artistPercent}%`}
        </div>
        
        {/* Referrer Commission - 5% if applicable */}
        {referralInfo?.has_referral && (
          <div 
            className="bg-[#a855f7] flex items-center justify-center text-xs font-black text-[#080a08] border-r border-[#080a08]"
            style={{ width: `${referrerPercent}%` }}
          >
            {referrerPercent >= 8 && `${referrerPercent}%`}
          </div>
        )}
        
        {/* Manufacturing */}
        <div 
          className="bg-[#dc2626] flex items-center justify-center text-xs font-black text-[#080a08]"
          style={{ width: `${manufacturingPercent}%` }}
        >
          {manufacturingPercent >= 8 && `${manufacturingPercent}%`}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#f97316]" />
          <span className="text-[#6b8e6b]">Platform ({platformPercent}%)</span>
          <span className="font-black text-[#e8f5e8]">${split.platform.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#4ade80]" />
          <span className="text-[#6b8e6b]">You ({artistPercent}%)</span>
          <span className="font-black text-[#4ade80]">${split.artist.toFixed(2)}</span>
        </div>
        
        {referralInfo?.has_referral ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#a855f7]" />
            <Gift className="h-3 w-3 text-[#a855f7]" />
            <span className="text-[#6b8e6b]">Referrer ({referrerPercent}%)</span>
            <span className="font-black text-[#a855f7]">${split.referrer.toFixed(2)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#a855f7]/30" />
            <span className="text-[#6b8e6b] line-through">Referrer (0%)</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#dc2626]" />
          <span className="text-[#6b8e6b]">Manufacturing ({manufacturingPercent}%)</span>
          <span className="font-black text-[#dc2626]">${split.manufacturing.toFixed(2)}</span>
        </div>
      </div>

      {/* Referral Notice */}
      {referralInfo?.has_referral && (
        <div className="p-3 bg-[#a855f7]/10 border border-[#a855f7] flex items-start gap-2">
          <Gift className="h-4 w-4 text-[#a855f7] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-[#e8f5e8]">
              <span className="font-black">Referral Active:</span> 5% goes to the artist who invited you
            </p>
            {referralInfo.expires_at && (
              <p className="text-xs text-[#6b8e6b] mt-1">
                Commission period ends {new Date(referralInfo.expires_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {!referralInfo?.has_referral && (
        <div className="p-3 bg-[#1a2e1a] border border-dashed border-[#6b8e6b]">
          <p className="text-xs text-[#6b8e6b]">
            No referral bonus on this sale. Invite other artists to earn 5% of their sales!
          </p>
        </div>
      )}
    </div>
  )
}
