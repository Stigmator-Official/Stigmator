"use client"

import { useState, useEffect } from "react"
import { Send, CheckCircle, Copy, Mail, Share2, Instagram, MessageCircle, Users, DollarSign, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMyReferralCode, getMyReferrals, getReferralStats, type Referral } from "@/lib/api/referrals"
import { supabaseBrowser } from "@/lib/supabase/client"
import Link from "next/link"
import { OptimizedAvatar } from "@/components/ui/optimized-image"

export default function InviteTattooistPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [shopName, setShopName] = useState("")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState({
    total_referrals: 0,
    active_referrals: 0,
    total_earnings: 0,
    pending_earnings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReferralData()
  }, [])

  async function loadReferralData() {
    try {
      setIsLoading(true)
      const [code, myReferrals, myStats] = await Promise.all([
        getMyReferralCode(),
        getMyReferrals(),
        getReferralStats(),
      ])
      setReferralCode(code)
      setReferrals(myReferrals)
      setStats(myStats)
    } catch (err) {
      console.error("Error loading referral data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stigmator.com"
  const referralLink = referralCode 
    ? `${appUrl}/artist/apply?ref=${referralCode}`
    : ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOptions = [
    { icon: Mail, label: "Email", color: "bg-blue-600" },
    { icon: Instagram, label: "DM", color: "bg-pink-600" },
    { icon: MessageCircle, label: "Text", color: "bg-green-600" },
  ]

  // Format cents to dollars
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black tracking-tighter text-[#e8f5e8] mb-4">
            INVITE YOUR <span className="text-[#dc2626]">ARTIST</span>
          </h1>
          <p className="text-[#6b8e6b] text-lg max-w-2xl mx-auto">
            Know an amazing tattoo artist? Invite them to Stigmator and earn 
            <span className="text-[#4ade80] font-black"> 5% </span> 
            of their sales for the first 6 months.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Invite Form */}
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader>
              <CardTitle className="font-black tracking-tighter flex items-center gap-2">
                <Send className="h-5 w-5 text-[#4ade80]" />
                SEND INVITATION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-[#6b8e6b] mb-1 block">ARTIST NAME</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Sarah Chen"
                    className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] h-12"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#6b8e6b] mb-1 block">SHOP / STUDIO NAME</label>
                  <Input
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g., Iron & Ink Studio"
                    className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] h-12"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#6b8e6b] mb-1 block">EMAIL ADDRESS</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="artist@example.com"
                    className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] h-12"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#6b8e6b] mb-1 block">PERSONAL MESSAGE (OPTIONAL)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hey! Check out Stigmator - it's a platform where you can sell your designs on clothing and earn passive income..."
                    rows={4}
                    className="w-full bg-[#050805] border border-[#1a2e1a] rounded-none text-[#e8f5e8] p-3 text-sm focus:border-[#4ade80] focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 bg-[#4ade80] hover:bg-[#3ec46e] text-[#080a08] font-black rounded-none"
                  disabled={!email || !name || sent}
                >
                  {sent ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      INVITATION SENT!
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      SEND INVITE
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right: Referral & Stats */}
          <div className="space-y-6">
            {/* Referral Link */}
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader>
                <CardTitle className="font-black tracking-tighter flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-[#4ade80]" />
                  YOUR REFERRAL LINK
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
                  <p className="text-xs font-mono text-[#6b8e6b] mb-1">REFERRAL CODE</p>
                  <p className="text-2xl font-black text-[#4ade80] tracking-wider">
                    {isLoading ? "..." : referralCode || "N/A"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] font-mono text-sm"
                  />
                  <Button
                    onClick={copyLink}
                    variant="outline"
                    className="border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80]/10 rounded-none px-6"
                    disabled={!referralCode}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? "COPIED!" : "COPY"}
                  </Button>
                </div>

                {/* Quick Share */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {shareOptions.map((option) => (
                    <button
                      key={option.label}
                      className={`${option.color} p-3 rounded-none flex flex-col items-center gap-1 hover:opacity-80 transition-opacity`}
                    >
                      <option.icon className="h-5 w-5 text-white" />
                      <span className="text-xs font-black text-white">{option.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader>
                <CardTitle className="font-black tracking-tighter flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#4ade80]" />
                  YOUR REFERRAL STATS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#050805] border border-[#1a2e1a] text-center">
                    <Users className="h-6 w-6 text-[#4ade80] mx-auto mb-2" />
                    <p className="text-3xl font-black text-[#e8f5e8]">{stats.total_referrals}</p>
                    <p className="text-xs text-[#6b8e6b]">TOTAL INVITED</p>
                  </div>
                  <div className="p-4 bg-[#050805] border border-[#1a2e1a] text-center">
                    <Clock className="h-6 w-6 text-[#4ade80] mx-auto mb-2" />
                    <p className="text-3xl font-black text-[#4ade80]">{stats.active_referrals}</p>
                    <p className="text-xs text-[#6b8e6b]">ACTIVE (6 MO)</p>
                  </div>
                  <div className="p-4 bg-[#050805] border border-[#1a2e1a] text-center">
                    <DollarSign className="h-6 w-6 text-[#4ade80] mx-auto mb-2" />
                    <p className="text-3xl font-black text-[#e8f5e8]">{formatCurrency(stats.total_earnings)}</p>
                    <p className="text-xs text-[#6b8e6b]">TOTAL EARNED</p>
                  </div>
                  <div className="p-4 bg-[#050805] border border-[#4ade80] text-center">
                    <TrendingUp className="h-6 w-6 text-[#4ade80] mx-auto mb-2" />
                    <p className="text-3xl font-black text-[#4ade80]">{formatCurrency(stats.pending_earnings)}</p>
                    <p className="text-xs text-[#6b8e6b]">PENDING</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referred Artists List */}
            {referrals.length > 0 && (
              <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
                <CardHeader>
                  <CardTitle className="font-black tracking-tighter">
                    YOUR REFERRED ARTISTS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="flex items-center gap-3 p-3 bg-[#050805] border border-[#1a2e1a]">
                        <OptimizedAvatar
                          src={referral.referred_artist?.avatar_url || null}
                          alt={referral.referred_artist?.display_name || "Artist"}
                          size="md"
                        />
                        <div className="flex-1">
                          <p className="font-black text-[#e8f5e8]">
                            {referral.referred_artist?.display_name || "Unknown Artist"}
                          </p>
                          <p className="text-xs text-[#6b8e6b]">
                            {referral.status === "completed" 
                              ? `Active until ${referral.expires_at ? new Date(referral.expires_at).toLocaleDateString() : "N/A"}`
                              : "Pending approval"
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-[#4ade80]">
                            {formatCurrency(referral.total_commission_paid)}
                          </p>
                          <p className="text-xs text-[#6b8e6b]">earned</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* How It Works */}
            <div className="p-4 border border-dashed border-[#1a2e1a]">
              <p className="text-xs font-mono text-[#6b8e6b] mb-3">HOW IT WORKS</p>
              <ol className="space-y-2 text-sm text-[#e8f5e8]">
                <li className="flex gap-2">
                  <span className="text-[#4ade80] font-black">1.</span>
                  Share your referral link with tattoo artists
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4ade80] font-black">2.</span>
                  They apply and get approved as a Stigmator artist
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4ade80] font-black">3.</span>
                  You earn 5% of every sale they make for 6 months
                </li>
                <li className="flex gap-2">
                  <span className="text-[#4ade80] font-black">4.</span>
                  Payments sent monthly to your account
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
