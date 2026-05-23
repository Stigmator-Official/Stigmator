"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClientBrowser } from "@/lib/supabase/client"
import { ManufacturingWorkflow } from "@/components/garments/manufacturing-workflow"
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Package,
  MoreHorizontal,
  ExternalLink,
  AlertTriangle,
  Eye,
  CreditCard,
  Loader2,
  Plus
} from "lucide-react"

// TypeScript interfaces
interface Garment {
  id: string
  designName: string
  garmentType: string
  retailPrice: number
  depositAmount: number
  status: "pending_review" | "under_review" | "accepted" | "declined"
  submittedAt: string
  manufacturer: string | null
  mockupMethod: "digital" | "physical"
  estimatedResponse: string | null
  maxUnits: number | null
  campaignStarts?: string
  declineReason?: string
}

interface GarmentStats {
  pending_review: number
  under_review: number
  accepted: number
  declined: number
}

const statusConfig: Record<string, {
  label: string
  color: string
  bgColor: string
  icon: any
  description: string
}> = {
  pending_review: {
    label: "PENDING REVIEW",
    color: "text-[#fbbf24]",
    bgColor: "bg-[#fbbf24]/10",
    icon: Clock,
    description: "Waiting for manufacturer assignment",
  },
  under_review: {
    label: "UNDER REVIEW",
    color: "text-[#60a5fa]",
    bgColor: "bg-[#60a5fa]/10",
    icon: Eye,
    description: "Manufacturer reviewing your design",
  },
  accepted: {
    label: "ACCEPTED",
    color: "text-[#4ade80]",
    bgColor: "bg-[#4ade80]/10",
    icon: CheckCircle2,
    description: "Ready for production",
  },
  declined: {
    label: "DECLINED",
    color: "text-[#dc2626]",
    bgColor: "bg-[#dc2626]/10",
    icon: XCircle,
    description: "Not accepted by manufacturer",
  },
}

export default function PendingGarmentsPage() {
  const [garments, setGarments] = useState<Garment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Fetch garments pending approval
  useEffect(() => {
    const fetchGarments = async () => {
      setIsLoading(true)
      try {
        const supabase = createClientBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setGarments([])
          return
        }
        
        const { data } = await supabase
          .from("product_designs")
          .select(`
            id,
            created_at,
            design:design_id(title),
            product:product_id(name, base_price)
          `)
          .eq("artist_id", user.id)
          .eq("is_active", false)
          .order("created_at", { ascending: false })
        
        if (data) {
          setGarments(data.map((item: any) => ({
            id: item.id,
            name: item.design?.title || "Untitled",
            type: item.product?.name || "Garment",
            submittedAt: item.created_at,
            status: "pending_review" as const,
            estimatedReviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          })))
        } else {
          setGarments([])
        }
      } catch {
        setGarments([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchGarments()
  }, [])

  // Calculate stats from actual data
  const stats: GarmentStats = useMemo(() => {
    return garments.reduce(
      (acc, garment) => {
        acc[garment.status]++
        return acc
      },
      { pending_review: 0, under_review: 0, accepted: 0, declined: 0 }
    )
  }, [garments])

  const filteredGarments = useMemo(() => {
    return activeFilter
      ? garments.filter(g => g.status === activeFilter)
      : garments
  }, [garments, activeFilter])

  const hasGarments = garments.length > 0
  const hasFilteredGarments = filteredGarments.length > 0

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/artist/garments" className="inline-flex items-center text-[#6b8e6b] hover:text-[#e8f5e8] mb-4 font-mono text-xs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO GARMENTS
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8]">
                PENDING SUBMISSIONS
              </h1>
              <p className="text-[#6b8e6b] mt-2">
                Track your garment review status
              </p>
            </div>
            <Link href="/artist/garments/create">
              <Button className="bg-[#4ade80] hover:bg-[#22c55e] text-black rounded-none font-black tracking-wider brutal-box">
                + NEW GARMENT
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "PENDING", count: stats.pending_review, status: "pending_review" },
            { label: "UNDER REVIEW", count: stats.under_review, status: "under_review" },
            { label: "ACCEPTED", count: stats.accepted, status: "accepted" },
            { label: "DECLINED", count: stats.declined, status: "declined" },
          ].map((stat) => (
            <button
              key={stat.status}
              onClick={() => setActiveFilter(activeFilter === stat.status ? null : stat.status)}
              disabled={isLoading || stat.count === 0}
              className={`p-4 border-2 text-left transition-all ${
                activeFilter === stat.status
                  ? "border-[#4ade80] bg-[#4ade80]/10"
                  : "border-[#1a2e1a] hover:border-[#4ade80]/50 bg-[#0a0f0a]"
              } ${(isLoading || stat.count === 0) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="font-mono text-xs text-[#6b8e6b]">{stat.label}</div>
              <div className="text-3xl font-black text-[#e8f5e8]">
                {isLoading ? "—" : stat.count}
              </div>
            </button>
          ))}
        </div>

        {/* Filter indicator */}
        {activeFilter && hasGarments && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-[#6b8e6b]">Filtered by:</span>
            <Badge 
              variant="outline" 
              className="border-[#4ade80] text-[#4ade80] rounded-none font-mono text-xs cursor-pointer"
              onClick={() => setActiveFilter(null)}
            >
              {statusConfig[activeFilter].label} ✕
            </Badge>
          </div>
        )}

        {/* Garment List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading state
            <div className="text-center py-16 border-2 border-dashed border-[#1a2e1a]">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-[#4ade80] animate-spin" />
              <p className="text-[#6b8e6b]">Loading your submissions...</p>
            </div>
          ) : !hasGarments ? (
            // Empty state - no garments at all
            <div className="text-center py-16 border-2 border-dashed border-[#1a2e1a]">
              <Package className="h-12 w-12 mx-auto mb-4 text-[#1a2e1a]" />
              <h3 className="text-xl font-black text-[#e8f5e8] mb-2">
                NO PENDING GARMENTS
              </h3>
              <p className="text-[#6b8e6b] max-w-md mx-auto mb-6">
                You haven&apos;t submitted any garments for manufacturing review yet. 
                Create your first garment to get started.
              </p>
              <Link href="/artist/garments/create">
                <Button className="bg-[#4ade80] hover:bg-[#22c55e] text-black rounded-none font-black tracking-wider">
                  <Plus className="h-4 w-4 mr-2" />
                  CREATE YOUR FIRST GARMENT
                </Button>
              </Link>
            </div>
          ) : !hasFilteredGarments ? (
            // Empty state - filter returned no results
            <div className="text-center py-12 border-2 border-dashed border-[#1a2e1a]">
              <Clock className="h-12 w-12 mx-auto mb-4 text-[#1a2e1a]" />
              <p className="text-[#6b8e6b]">No garments found with this status</p>
              <Button
                variant="outline"
                onClick={() => setActiveFilter(null)}
                className="mt-4 rounded-none border-[#1a2e1a] text-[#6b8e6b]"
              >
                CLEAR FILTER
              </Button>
            </div>
          ) : (
            // Garment list
            filteredGarments.map((garment) => {
              const config = statusConfig[garment.status]
              const Icon = config.icon

              return (
                <Card key={garment.id} className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Design Preview */}
                      <div className="w-full md:w-48 h-32 md:h-auto bg-[#1a2e1a] flex items-center justify-center border-b md:border-b-0 md:border-r border-[#1a2e1a]">
                        <div className="text-center">
                          <Package className="h-8 w-8 mx-auto mb-2 text-[#4ade80]" />
                          <span className="text-xs font-mono text-[#6b8e6b]">{garment.garmentType}</span>
                        </div>
                      </div>

                      {/* Middle: Info */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-black tracking-tighter text-xl text-[#e8f5e8]">
                              {garment.designName}
                            </h3>
                            <p className="text-sm text-[#6b8e6b] font-mono">
                              {garment.id} • Submitted {garment.submittedAt}
                            </p>
                          </div>
                          <Badge className={`${config.bgColor} ${config.color} border-none rounded-none font-mono text-xs`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <div className="text-[#6b8e6b] text-xs font-mono">RETAIL PRICE</div>
                            <div className="font-black text-[#e8f5e8]">${garment.retailPrice}</div>
                          </div>
                          <div>
                            <div className="text-[#6b8e6b] text-xs font-mono">DEPOSIT</div>
                            <div className="font-black text-[#dc2626]">${garment.depositAmount}</div>
                          </div>
                          <div>
                            <div className="text-[#6b8e6b] text-xs font-mono">MOCKUP</div>
                            <div className="font-black text-[#e8f5e8] uppercase">{garment.mockupMethod}</div>
                          </div>
                          {garment.maxUnits && (
                            <div>
                              <div className="text-[#6b8e6b] text-xs font-mono">LIMITED RUN</div>
                              <div className="font-black text-[#e8f5e8]">{garment.maxUnits} units</div>
                            </div>
                          )}
                        </div>

                        {/* Status-specific info */}
                        {garment.status === "under_review" && garment.manufacturer && (
                          <div className="mt-4 p-3 bg-[#60a5fa]/5 border border-[#60a5fa]/20">
                            <div className="flex items-center gap-2 text-sm">
                              <Eye className="h-4 w-4 text-[#60a5fa]" />
                              <span className="text-[#e8f5e8]">
                                {garment.manufacturer} is reviewing your design
                              </span>
                              <span className="text-[#6b8e6b] ml-auto">
                                Est. response: {garment.estimatedResponse}
                              </span>
                            </div>
                          </div>
                        )}

                        {garment.status === "accepted" && (
                          <div className="mt-4 p-3 bg-[#4ade80]/5 border border-[#4ade80]/20">
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-[#4ade80]" />
                              <span className="text-[#e8f5e8]">
                                Accepted by {garment.manufacturer}
                              </span>
                              <span className="text-[#6b8e6b] ml-auto">
                                Campaign starts {garment.campaignStarts}
                              </span>
                            </div>
                          </div>
                        )}

                        {garment.status === "declined" && garment.declineReason && (
                          <div className="mt-4 p-3 bg-[#dc2626]/5 border border-[#dc2626]/20">
                            <div className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-[#dc2626] mt-0.5" />
                              <div>
                                <span className="text-[#dc2626] font-black">DECLINED</span>
                                <p className="text-[#e8f5e8] mt-1">{garment.declineReason}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="p-6 border-t md:border-t-0 md:border-l border-[#1a2e1a] flex flex-row md:flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-none border-[#1a2e1a] hover:bg-[#1a2e1a] text-[#6b8e6b] text-xs"
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          VIEW
                        </Button>
                        {garment.status === "declined" && (
                          <Button 
                            size="sm"
                            className="rounded-none bg-[#4ade80] hover:bg-[#22c55e] text-black text-xs font-black"
                          >
                            <ExternalLink className="h-3 w-3 mr-2" />
                            RESUBMIT
                          </Button>
                        )}
                        {garment.status === "accepted" && (
                          <Button 
                            size="sm"
                            className="rounded-none bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-black"
                          >
                            <Package className="h-3 w-3 mr-2" />
                            PRE-ORDER
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Manufacturing Workflow Demo */}
        {!isLoading && hasGarments && (
          <div className="mt-8">
            <ManufacturingWorkflow />
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 bg-[#050805] border-[#1a2e1a] rounded-none">
          <CardHeader>
            <CardTitle className="font-black tracking-tighter text-[#6b8e6b]">
              HOW THE REVIEW PROCESS WORKS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-3 text-sm text-[#e8f5e8]">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#1a2e1a] flex items-center justify-center text-xs font-black">1</span>
                <span><strong className="text-[#fbbf24]">Submit:</strong> No deposit charged. Your design enters the manufacturer queue.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#1a2e1a] flex items-center justify-center text-xs font-black">2</span>
                <span><strong className="text-[#60a5fa]">Auto-Review:</strong> If declined, automatically rerouted to next manufacturer (up to 3 times).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#1a2e1a] flex items-center justify-center text-xs font-black">3</span>
                <span><strong className="text-[#4ade80]">Deposit on Accept:</strong> Your deposit is ONLY charged when a manufacturer accepts. Declines = credit back.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#1a2e1a] flex items-center justify-center text-xs font-black">4</span>
                <span><strong className="text-[#dc2626]">3-Strike Rule:</strong> After 3 declines, manual review required before resubmitting.</span>
              </li>
            </ol>
            <p className="text-xs text-[#6b8e6b] pt-4 border-t border-[#1a2e1a]">
              Typical response time: 24-72 hours. Your deposit is safe - only charged on acceptance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
