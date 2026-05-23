"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  Flame, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  Archive,
  Share2,
  Zap,
  Clock,
  Package,
  ChevronRight,
  Trophy,
  Sparkles,
  Loader2
} from "lucide-react"

// Freshness status types
type FreshnessStatus = "FIRE" | "HOT" | "FRESH" | "STALE" | "VINTAGE"

interface GarmentFreshness {
  id: string
  name: string
  type: string
  image: string
  status: FreshnessStatus
  freshness: number // 0-100
  daysListed: number
  totalSales: number
  salesVelocity: number // sales per day
  views: number
  viewToSaleRatio: number
  lastSaleDate: string | null
  canRetire: boolean
  canRevive: boolean
}

// Status configuration
const STATUS_CONFIG: Record<FreshnessStatus, {
  emoji: string
  label: string
  color: string
  bgColor: string
  description: string
  pulse: boolean
}> = {
  FIRE: {
    emoji: "🔥",
    label: "FIRE",
    color: "#dc2626",
    bgColor: "#dc2626",
    description: "Viral momentum! Selling fast",
    pulse: true
  },
  HOT: {
    emoji: "🌶️",
    label: "HOT",
    color: "#f97316",
    bgColor: "#fbbf24",
    description: "Trending - promote to reach FIRE",
    pulse: false
  },
  FRESH: {
    emoji: "✨",
    label: "FRESH",
    color: "#4ade80",
    bgColor: "#4ade80",
    description: "New drop - share to build momentum",
    pulse: false
  },
  STALE: {
    emoji: "🧊",
    label: "STALE",
    color: "#60a5fa",
    bgColor: "#60a5fa",
    description: "Cooling down - promote or retire",
    pulse: false
  },
  VINTAGE: {
    emoji: "🏛️",
    label: "VINTAGE",
    color: "#a78bfa",
    bgColor: "#a78bfa",
    description: "Rediscovered classic - timeless appeal",
    pulse: false
  }
}

// Initial empty state - will be populated from API
const INITIAL_GARMENTS: GarmentFreshness[] = []

// Calculate freshness based on metrics
function calculateFreshness(garment: Partial<GarmentFreshness>): number {
  const { salesVelocity = 0, daysListed = 0, viewToSaleRatio = 100 } = garment
  
  // Base score from sales velocity
  let score = Math.min(salesVelocity * 25, 50)
  
  // Bonus for new items (honeymoon period)
  if (daysListed < 14) {
    score += 30
  } else if (daysListed < 30) {
    score += 15
  }
  
  // Conversion rate bonus
  if (viewToSaleRatio < 20) score += 20
  else if (viewToSaleRatio < 50) score += 10
  
  // Decay for old items
  if (daysListed > 60) score -= 20
  if (daysListed > 90) score -= 15
  
  return Math.max(0, Math.min(100, score))
}

export function FreshnessMonitor() {
  const [garments, setGarments] = useState<GarmentFreshness[]>(INITIAL_GARMENTS)
  const [selectedFilter, setSelectedFilter] = useState<FreshnessStatus | "ALL">("ALL")
  const [retiringId, setRetiringId] = useState<string | null>(null)
  const [revivingId, setRevivingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load garments from API
  useEffect(() => {
    async function fetchGarments() {
      setIsLoading(true)
      // TODO: Fetch from API
      // const { data } = await supabase.from('garment_freshness').select('*')
      // setGarments(data || [])
      setGarments([])
      setIsLoading(false)
    }
    fetchGarments()
  }, [])

  // Calculate summary stats
  const stats = {
    fire: garments.filter(g => g.status === "FIRE").length,
    hot: garments.filter(g => g.status === "HOT").length,
    fresh: garments.filter(g => g.status === "FRESH").length,
    stale: garments.filter(g => g.status === "STALE").length,
    vintage: garments.filter(g => g.status === "VINTAGE").length,
    avgFreshness: garments.length > 0 
      ? Math.round(garments.reduce((acc, g) => acc + g.freshness, 0) / garments.length)
      : 0
  }

  const filteredGarments = selectedFilter === "ALL" 
    ? garments 
    : garments.filter(g => g.status === selectedFilter)

  const handleRetire = (id: string) => {
    setRetiringId(id)
    // Simulate API call
    setTimeout(() => {
      setGarments(prev => prev.filter(g => g.id !== id))
      setRetiringId(null)
    }, 800)
  }

  const handleRevive = (id: string) => {
    setRevivingId(id)
    setTimeout(() => {
      setGarments(prev => prev.map(g => 
        g.id === id 
          ? { ...g, status: "FRESH", freshness: 50, canRevive: false }
          : g
      ))
      setRevivingId(null)
    }, 800)
  }

  return (
    <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
          <Activity className="h-5 w-5 text-[#4ade80]" />
          MERCH VITALITY
        </CardTitle>
        <Badge className="bg-[#1a2e1a] text-[#4ade80] rounded-none font-mono">
          <Zap className="h-3 w-3 mr-1" />
          LIVE
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { count: stats.fire, label: "🔥 FIRE", color: "#dc2626" },
            { count: stats.hot, label: "🌶️ HOT", color: "#f97316" },
            { count: stats.fresh, label: "✨ FRESH", color: "#4ade80" },
            { count: stats.stale, label: "🧊 STALE", color: "#60a5fa" },
            { count: stats.vintage, label: "🏛️ VINTAGE", color: "#a78bfa" },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => setSelectedFilter(stat.label.includes("FIRE") ? "FIRE" : 
                stat.label.includes("HOT") ? "HOT" :
                stat.label.includes("FRESH") ? "FRESH" :
                stat.label.includes("STALE") ? "STALE" : "VINTAGE")}
              className={`p-3 border text-center transition-all ${
                (stat.label.includes("FIRE") && selectedFilter === "FIRE") ||
                (stat.label.includes("HOT") && selectedFilter === "HOT") ||
                (stat.label.includes("FRESH") && selectedFilter === "FRESH") ||
                (stat.label.includes("STALE") && selectedFilter === "STALE") ||
                (stat.label.includes("VINTAGE") && selectedFilter === "VINTAGE")
                  ? "border-[#4ade80] bg-[#4ade80]/10"
                  : "border-[#1a2e1a] hover:border-[#4ade80]/50"
              }`}
              style={{ 
                backgroundColor: stat.color + "10",
                borderColor: stat.color + "40"
              }}
            >
              <div className="text-2xl font-black" style={{ color: stat.color }}>
                {stat.count}
              </div>
              <div className="text-xs text-[#6b8e6b]">{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Average Freshness Score */}
        <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6b8e6b]">AVERAGE FRESHNESS SCORE</span>
            <span className={`font-black text-xl ${
              stats.avgFreshness > 70 ? "text-[#4ade80]" :
              stats.avgFreshness > 40 ? "text-[#fbbf24]" :
              "text-[#dc2626]"
            }`}>
              {stats.avgFreshness}%
            </span>
          </div>
          <div className="h-3 bg-[#1a2e1a] overflow-hidden">
            <div 
              className="h-full transition-all duration-1000"
              style={{
                width: `${stats.avgFreshness}%`,
                background: `linear-gradient(90deg, 
                  ${stats.avgFreshness > 70 ? '#dc2626' : 
                    stats.avgFreshness > 40 ? '#fbbf24' : '#4ade80'} 0%, 
                  ${stats.avgFreshness > 70 ? '#fbbf24' : 
                    stats.avgFreshness > 40 ? '#4ade80' : '#60a5fa'} 100%)`
              }}
            />
          </div>
          <p className="text-xs text-[#6b8e6b] mt-2">
            {stats.avgFreshness > 70 
              ? "🔥 Your shop is on fire! Top 10% of artists"
              : stats.avgFreshness > 40
                ? "🌶️ Good momentum - promote to push higher"
                : "🧊 Time to refresh your designs"
            }
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFilter("ALL")}
            className={`px-4 py-2 text-xs font-black border transition-all ${
              selectedFilter === "ALL"
                ? "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]"
                : "border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]/50"
            }`}
          >
            ALL ({garments.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = garments.filter(g => g.status === status).length
            return (
              <button
                key={status}
                onClick={() => setSelectedFilter(status as FreshnessStatus)}
                className={`px-4 py-2 text-xs font-black border transition-all ${
                  selectedFilter === status
                    ? "border-[#4ade80] bg-[#4ade80]/10"
                    : "border-[#1a2e1a] hover:border-[#4ade80]/50"
                }`}
              >
                <span style={{ color: config.color }}>{config.emoji} {config.label}</span>
                <span className="ml-2 text-[#6b8e6b]">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Garment List */}
        <div className="space-y-4">
          {filteredGarments.map((garment) => {
            const config = STATUS_CONFIG[garment.status]
            const isRetiring = retiringId === garment.id
            const isReviving = revivingId === garment.id
            
            return (
              <div 
                key={garment.id}
                className="p-4 bg-[#050805] border border-[#1a2e1a] hover:border-[#4ade80]/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div 
                    className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ 
                      backgroundColor: config.color + "20",
                      border: `2px solid ${config.color}40`
                    }}
                  >
                    {config.emoji}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-lg text-[#e8f5e8]">{garment.name}</h4>
                      <Badge 
                        className="rounded-none font-black text-xs border-none"
                        style={{ backgroundColor: config.color, color: "#000" }}
                      >
                        {config.label}
                      </Badge>
                      {config.pulse && (
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#dc2626] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#dc2626]"></span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6b8e6b]">
                      {garment.type} • Listed {garment.daysListed} days ago • {garment.totalSales} sales
                    </p>
                    
                    {/* Metrics */}
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="text-[#6b8e6b]">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        {garment.salesVelocity}/day
                      </span>
                      <span className="text-[#6b8e6b]">
                        <Package className="h-3 w-3 inline mr-1" />
                        {garment.views} views
                      </span>
                      {garment.lastSaleDate && (
                        <span className="text-[#4ade80]">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Last: {garment.lastSaleDate}
                        </span>
                      )}
                    </div>

                    {/* Freshness Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#6b8e6b]">FRESHNESS</span>
                        <span className="font-black" style={{ color: config.color }}>
                          {garment.freshness}%
                        </span>
                      </div>
                      <div className="h-2 bg-[#1a2e1a] overflow-hidden relative">
                        {/* Gradient bar */}
                        <div 
                          className="absolute inset-y-0 left-0 transition-all duration-1000"
                          style={{
                            width: `${garment.freshness}%`,
                            background: `linear-gradient(90deg, 
                              ${garment.freshness > 80 ? '#dc2626' : 
                                garment.freshness > 60 ? '#f97316' : 
                                garment.freshness > 40 ? '#fbbf24' : 
                                garment.freshness > 20 ? '#4ade80' : '#60a5fa'} 0%, 
                              ${garment.freshness > 80 ? '#fbbf24' : 
                                garment.freshness > 60 ? '#fbbf24' : 
                                garment.freshness > 40 ? '#4ade80' : 
                                garment.freshness > 20 ? '#60a5fa' : '#60a5fa'} 100%)`
                          }}
                        />
                        {/* Pulse overlay for FIRE items */}
                        {config.pulse && (
                          <div className="absolute inset-0 bg-[#dc2626]/30 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Status Description & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-[#1a2e1a]">
                      <p className="text-xs text-[#6b8e6b]">
                        {config.description}
                      </p>
                      
                      <div className="flex gap-2">
                        {garment.status === "STALE" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleRevive(garment.id)}
                              disabled={isReviving}
                              className="bg-[#4ade80] hover:bg-[#22c55e] text-black rounded-none text-xs font-black"
                            >
                              {isReviving ? (
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Share2 className="h-3 w-3 mr-1" />
                              )}
                              PROMOTE
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleRetire(garment.id)}
                              disabled={isRetiring}
                              variant="outline"
                              className="border-[#6b8e6b] text-[#6b8e6b] hover:bg-[#6b8e6b]/10 rounded-none text-xs"
                            >
                              {isRetiring ? (
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Archive className="h-3 w-3 mr-1" />
                              )}
                              RETIRE
                            </Button>
                          </>
                        )}
                        
                        {(garment.status === "FIRE" || garment.status === "HOT") && (
                          <Button
                            size="sm"
                            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none text-xs font-black"
                          >
                            <Flame className="h-3 w-3 mr-1" />
                            CREATE LIMITED RUN
                          </Button>
                        )}
                        
                        {garment.status === "VINTAGE" && (
                          <Badge className="bg-[#a78bfa]/20 text-[#a78bfa] rounded-none text-xs border-none">
                            <Trophy className="h-3 w-3 mr-1" />
                            RESURRECTION BONUS
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {isLoading ? (
          <div className="text-center py-12 border-2 border-dashed border-[#1a2e1a]">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-[#4ade80] animate-spin" />
            <p className="text-[#6b8e6b]">Loading your garment vitality...</p>
          </div>
        ) : garments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#1a2e1a]">
            <Package className="h-12 w-12 mx-auto mb-4 text-[#6b8e6b]" />
            <p className="text-[#e8f5e8] font-black mb-2">NO GARMENTS YET</p>
            <p className="text-[#6b8e6b] text-sm mb-4">Create your first garment to see freshness metrics</p>
            <Link href="/artist/garments/create">
              <Button className="bg-[#4ade80] hover:bg-[#22c55e] text-black font-black rounded-none">
                CREATE GARMENT
              </Button>
            </Link>
          </div>
        ) : filteredGarments.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-[#1a2e1a]">
            <Package className="h-12 w-12 mx-auto mb-4 text-[#1a2e1a]" />
            <p className="text-[#6b8e6b]">No items in this category</p>
          </div>
        )}

        {/* Pro Tips */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#4ade80]/5 border border-[#4ade80]/20">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#4ade80] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-sm text-[#e8f5e8]">HOW TO STAY FRESH</p>
                <ul className="text-xs text-[#6b8e6b] mt-2 space-y-1">
                  <li>• Promote new designs in first 14 days</li>
                  <li>• Share on social with your partnership code</li>
                  <li>• Respond to customer reviews quickly</li>
                  <li>• Create limited editions for FIRE items</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-[#60a5fa]/5 border border-[#60a5fa]/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#60a5fa] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-sm text-[#e8f5e8]">THE STALE ADVANTAGE</p>
                <ul className="text-xs text-[#6b8e6b] mt-2 space-y-1">
                  <li>• Stale items that sell become VINTAGE</li>
                  <li>• Vintage = timeless appeal badge</li>
                  <li>• Customers love "hidden gems"</li>
                  <li>• No fees for any status level</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
