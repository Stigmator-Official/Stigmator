"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Paintbrush, 
  DollarSign, 
  TrendingUp,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  Gift,
  Sparkles,
  ArrowRight,
  Zap,
  Share2,
  Palette,
  MapPin,
  Calendar
} from "lucide-react"
import { 
  CanvasEarnings, 
  InkAttribution, 
  InkPortfolioStats,
  calculateInkPortfolioStats,
  saveInkPortfolio,
  loadInkPortfolio
} from "@/lib/ink-portfolio"
import { supabaseBrowser } from "@/lib/supabase/client"

export function InkPortfolioSection() {
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState<CanvasEarnings | null>(null)
  const [stats, setStats] = useState<InkPortfolioStats | null>(null)
  const [activationCode, setActivationCode] = useState("")
  const [showActivationSuccess, setShowActivationSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    // Try to load from localStorage first (user's real saved data)
    let data = loadInkPortfolio()
    
    // If no saved data, initialize empty — no mock data in production
    if (!data) {
      let userId = "user-001"
      try {
        const supabase = supabaseBrowser()
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.id) {
          userId = session.user.id
        }
      } catch {
        // Silently fall back to default
      }
      
      data = {
        userId,
        totalEarned: 0,
        totalAttributed: 0,
        attributedDesigns: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveInkPortfolio(data)
    }
    
    setEarnings(data)
    setStats(calculateInkPortfolioStats(data))
    setLoading(false)
  }

  const activateCode = () => {
    if (!activationCode.trim() || !earnings) return
    
    // Simulate activation - in real app, this would validate with backend
    const newAttribution: InkAttribution = {
      id: Math.random().toString(36).substr(2, 9),
      designId: generateId(),
      designTitle: "MYSTIC DRAGON",
      designImage: "/api/placeholder/400/400",
      artistId: generateId(),
      artistName: "Ghost Ink",
      artistAvatar: "/api/placeholder/100/100",
      canvasId: "user-001",
      canvasName: "Jordan Smith",
      canvasEmail: "jordan@example.com",
      tattooLocation: "Full Sleeve - Right Arm",
      dateInked: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      canvasPercentage: 15,
      artistPercentage: 60,
      activationCode: activationCode.toUpperCase(),
      activatedAt: new Date().toISOString(),
      status: "active",
      totalSales: 0,
      totalEarned: 0,
      lastSaleAt: null,
    }
    
    const updated: CanvasEarnings = {
      ...earnings,
      attributedDesigns: [newAttribution, ...earnings.attributedDesigns],
    }
    
    saveInkPortfolio(updated)
    setEarnings(updated)
    setStats(calculateInkPortfolioStats(updated))
    setActivationCode("")
    setShowActivationSuccess(true)
    
    setTimeout(() => setShowActivationSuccess(false), 3000)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  if (loading) {
    return (
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#1a2e1a] w-1/3" />
            <div className="h-32 bg-[#1a2e1a]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!earnings || !stats) return null

  return (
    <div className="space-y-6">
      {/* Ink Portfolio Header Card */}
      <Card className="bg-[#0a0f0a] border-[#4ade80]/30 rounded-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4ade80]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8] text-2xl">
                <Paintbrush className="h-6 w-6 text-[#4ade80]" />
                YOUR INK PORTFOLIO
              </CardTitle>
              <p className="text-xs text-[#6b8e6b] font-mono mt-1">
                Tattoos inked on your body, earning you royalties
              </p>
            </div>
            <Badge className="bg-[#4ade80] text-black rounded-none font-mono">
              {stats.activeTattoos} ACTIVE
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
              <div className="text-xs font-mono text-[#6b8e6b]">TOTAL INKED</div>
              <div className="text-2xl font-black text-[#e8f5e8]">{stats.totalTattoos}</div>
            </div>
            <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
              <div className="text-xs font-mono text-[#6b8e6b]">ACTIVE</div>
              <div className="text-2xl font-black text-[#4ade80]">{stats.activeTattoos}</div>
            </div>
            <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
              <div className="text-xs font-mono text-[#6b8e6b]">TOTAL EARNED</div>
              <div className="text-2xl font-black text-[#4ade80]">${stats.totalEarned.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-[#fbbf24]/10 border border-[#fbbf24]/30">
              <div className="text-xs font-mono text-[#6b8e6b]">AVAILABLE</div>
              <div className="text-2xl font-black text-[#fbbf24]">${stats.availableCredit.toLocaleString()}</div>
            </div>
          </div>

          {/* Activation Section */}
          <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-[#fbbf24]" />
              <span className="text-sm font-black text-[#e8f5e8]">ACTIVATE YOUR INK</span>
            </div>
            
            {showActivationSuccess ? (
              <div className="flex items-center gap-3 p-3 bg-[#4ade80]/10 border border-[#4ade80]/30">
                <CheckCircle2 className="h-5 w-5 text-[#4ade80]" />
                <div>
                  <p className="text-sm text-[#4ade80] font-bold">Ink Activated!</p>
                  <p className="text-xs text-[#6b8e6b]">Your tattoo is now earning you royalties.</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value)}
                    placeholder="ENTER ACTIVATION CODE (e.g., INK-DRAGON-7X9K)"
                    className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none pl-4 font-mono uppercase tracking-wider h-12"
                  />
                </div>
                <Button 
                  onClick={activateCode}
                  disabled={!activationCode.trim()}
                  className="bg-[#fbbf24] hover:bg-[#f59e0b] text-black rounded-none font-black h-12 px-6"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  ACTIVATE
                </Button>
              </div>
            )}
            
            <p className="text-[10px] text-[#4a6e4a] mt-2 font-mono">
              Got a code from your tattoo artist? Enter it above to start earning royalties when your design sells.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pending Activations */}
      {earnings.attributedDesigns.some(a => a.status === "pending") && (
        <Card className="bg-[#0a0f0a] border-[#fbbf24]/30 rounded-none">
          <CardHeader>
            <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
              <Clock className="h-5 w-5 text-[#fbbf24]" />
              PENDING ACTIVATION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {earnings.attributedDesigns
                .filter(a => a.status === "pending")
                .map((attribution) => (
                  <div key={attribution.id} className="flex items-center gap-4 p-4 bg-[#050805] border border-[#fbbf24]/30">
                    <div className="w-16 h-16 bg-[#1a2e1a] flex items-center justify-center flex-shrink-0">
                      <Paintbrush className="h-8 w-8 text-[#6b8e6b]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-[#e8f5e8]">{attribution.designTitle}</div>
                      <div className="text-xs text-[#6b8e6b]">by {attribution.artistName}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#fbbf24]">
                        <MapPin className="h-3 w-3" />
                        {attribution.tattooLocation}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-[#6b8e6b]">YOUR CODE</div>
                      <div className="font-black text-lg text-[#fbbf24] tracking-wider">
                        {attribution.activationCode}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyCode(attribution.activationCode)}
                        className="mt-2 border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24]/10 rounded-none text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        COPY
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Ink Portfolio */}
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
              <Palette className="h-5 w-5 text-[#4ade80]" />
              YOUR TATTOOS
            </CardTitle>
            <p className="text-xs text-[#6b8e6b] font-mono mt-1">
              Designs inked on your body that are now earning royalties
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {earnings.attributedDesigns.filter(a => a.status === "active").length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#1a2e1a]">
              <Paintbrush className="h-12 w-12 text-[#6b8e6b] mx-auto mb-4" />
              <p className="text-[#6b8e6b] font-mono text-sm">
                No activated tattoos yet.
              </p>
              <p className="text-[#4a6e4a] text-xs mt-2">
                Enter an activation code above to get started.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {earnings.attributedDesigns
                .filter(a => a.status === "active")
                .map((attribution) => (
                  <div key={attribution.id} className="p-4 bg-[#050805] border border-[#1a2e1a] hover:border-[#4ade80]/50 transition-colors group">
                    {/* Design Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-20 h-20 bg-[#1a2e1a] flex items-center justify-center flex-shrink-0">
                        <Paintbrush className="h-10 w-10 text-[#6b8e6b]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-lg text-[#e8f5e8]">{attribution.designTitle}</div>
                        <div className="flex items-center gap-2 text-xs text-[#6b8e6b]">
                          <span>by {attribution.artistName}</span>
                          <span className="text-[#1a2e1a]">|</span>
                          <span className="text-[#4ade80]">{attribution.canvasPercentage}% royalty</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#6b8e6b]">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {attribution.tattooLocation}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(attribution.dateInked).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-[#0a0f0a] border border-[#1a2e1a]">
                      <div className="text-center">
                        <div className="text-lg font-black text-[#4ade80]">{attribution.totalSales}</div>
                        <div className="text-[10px] text-[#6b8e6b] font-mono">SALES</div>
                      </div>
                      <div className="text-center border-x border-[#1a2e1a]">
                        <div className="text-lg font-black text-[#fbbf24]">${attribution.totalEarned}</div>
                        <div className="text-[10px] text-[#6b8e6b] font-mono">EARNED</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-black text-[#e8f5e8]">{attribution.canvasPercentage}%</div>
                        <div className="text-[10px] text-[#6b8e6b] font-mono">ROYALTY</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      {earnings.recentSales.length > 0 && (
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardHeader>
            <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
              <TrendingUp className="h-5 w-5 text-[#4ade80]" />
              RECENT EARNINGS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {earnings.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-[#050805] border border-[#1a2e1a]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#4ade80]/10 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-[#4ade80]" />
                    </div>
                    <div>
                      <div className="text-sm text-[#e8f5e8]">{sale.designTitle}</div>
                      <div className="text-xs text-[#6b8e6b]">{sale.itemSold} sold</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-[#4ade80]">+${sale.canvasShare}</div>
                    <div className="text-[10px] text-[#6b8e6b]">
                      {new Date(sale.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credit Actions */}
      {stats.availableCredit > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="h-14 bg-[#4ade80] hover:bg-[#22c55e] text-black rounded-none font-black text-lg"
          >
            <Gift className="h-5 w-5 mr-2" />
            SHOP WITH CREDIT
          </Button>
          <Button 
            variant="outline"
            className="h-14 border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24]/10 rounded-none font-black text-lg"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            WITHDRAW
          </Button>
        </div>
      )}
    </div>
  )
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
