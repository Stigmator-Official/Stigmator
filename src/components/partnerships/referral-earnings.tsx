"use client"

import { useEffect, useState } from "react"
import { Users, DollarSign, Clock, Gift } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMyReferrals, getReferralStats, type Referral } from "@/lib/api/referrals"
import { OptimizedAvatar } from "@/components/ui/optimized-image"

export function ReferralEarningsWidget() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState({
    total_referrals: 0,
    active_referrals: 0,
    total_earnings: 0,
    pending_earnings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setIsLoading(true)
      const [myReferrals, myStats] = await Promise.all([
        getMyReferrals(),
        getReferralStats(),
      ])
      setReferrals(myReferrals)
      setStats(myStats)
    } catch (err) {
      console.error("Error loading referral data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`

  if (isLoading) {
    return (
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardContent className="p-6">
          <div className="h-8 bg-[#1a2e1a] rounded w-48 animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-[#1a2e1a] rounded animate-pulse" />
            <div className="h-4 bg-[#1a2e1a] rounded animate-pulse w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
      <CardHeader>
        <CardTitle className="font-black tracking-tighter flex items-center gap-2">
          <Gift className="h-5 w-5 text-[#4ade80]" />
          REFERRAL EARNINGS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-[#4ade80]" />
              <span className="text-xs text-[#6b8e6b]">INVITED</span>
            </div>
            <p className="text-2xl font-black text-[#e8f5e8]">{stats.total_referrals}</p>
          </div>
          <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-[#4ade80]" />
              <span className="text-xs text-[#6b8e6b]">EARNED</span>
            </div>
            <p className="text-2xl font-black text-[#4ade80]">{formatCurrency(stats.total_earnings)}</p>
          </div>
        </div>

        {/* Pending Earnings */}
        {stats.pending_earnings > 0 && (
          <div className="p-4 bg-[#4ade80]/5 border border-[#4ade80]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#6b8e6b]">PENDING PAYOUT</span>
              <Clock className="h-4 w-4 text-[#4ade80]" />
            </div>
            <p className="text-3xl font-black text-[#4ade80]">{formatCurrency(stats.pending_earnings)}</p>
            <p className="text-xs text-[#6b8e6b] mt-1">Paid on the 1st of each month</p>
          </div>
        )}

        {/* Active Referrals */}
        {referrals.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-[#6b8e6b]">ACTIVE REFERRALS</h4>
            {referrals.filter(r => r.status === "completed").map((referral) => {
              const progress = referral.expires_at 
                ? Math.min(100, Math.round(
                    (new Date().getTime() - new Date(referral.artist_approved_at || referral.created_at).getTime()) /
                    (new Date(referral.expires_at).getTime() - new Date(referral.artist_approved_at || referral.created_at).getTime()) * 100
                  ))
                : 0
              
              return (
                <div key={referral.id} className="p-3 bg-[#050805] border border-[#1a2e1a]">
                  <div className="flex items-center gap-3 mb-2">
                    <OptimizedAvatar
                      src={referral.referred_artist?.avatar_url || null}
                      alt={referral.referred_artist?.display_name || "Artist"}
                      size="sm"
                    />
                    <div className="flex-1">
                      <p className="font-black text-[#e8f5e8] text-sm">
                        {referral.referred_artist?.display_name || "Unknown Artist"}
                      </p>
                      <p className="text-xs text-[#4ade80]">
                        Earned {formatCurrency(referral.total_commission_paid)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar for 6 month period */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6b8e6b]">Commission Period</span>
                      <span className="text-[#4ade80]">{progress}%</span>
                    </div>
                    <div className="h-1 bg-[#1a2e1a]">
                      <div 
                        className="h-full bg-[#4ade80] transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {referral.expires_at && (
                      <p className="text-xs text-[#6b8e6b]">
                        Expires {new Date(referral.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* How it works */}
        <div className="p-3 bg-[#050805] border border-dashed border-[#1a2e1a]">
          <p className="text-xs text-[#6b8e6b] mb-2">HOW REFERRALS WORK</p>
          <ul className="space-y-1 text-xs text-[#e8f5e8]">
            <li>• You earn 5% of every sale your referred artists make</li>
            <li>• Commission applies for the first 6 months after approval</li>
            <li>• Payments are sent monthly to your connected account</li>
            <li>• No limit to how many artists you can refer</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
