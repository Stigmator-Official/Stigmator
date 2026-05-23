"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, User, TrendingUp, DollarSign, Eye, Plus, Upload, Palette, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Design {
  id: string
  title: string
  image: string
  status: "active" | "draft" | "pending"
  partnerName?: string
  partnerId?: string
  royaltySplit?: number
  sales: number
  earnings: number
  createdAt: string
}

interface PortfolioTabProps {
  designs: Design[]
  onCreateGarment: (designId: string) => void
}

export function PortfolioTab({ designs, onCreateGarment }: PortfolioTabProps) {
  const [filter, setFilter] = useState<"all" | "attributed" | "unattributed">("all")

  const filteredDesigns = designs.filter((d) => {
    if (filter === "attributed") return d.partnerName
    if (filter === "unattributed") return !d.partnerName
    return true
  })

  const attributedCount = designs.filter(d => d.partnerName).length
  const unattributedCount = designs.filter(d => !d.partnerName).length

  // Empty state: No designs at all
  if (designs.length === 0) {
    return <EmptyPortfolio />
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={`rounded-none text-xs font-black ${
            filter === "all"
              ? "bg-[#4ade80] text-black"
              : "border-[#1a2e1a] text-[#6b8e6b]"
          }`}
        >
          ALL ({designs.length})
        </Button>
        <Button
          variant={filter === "attributed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("attributed")}
          className={`rounded-none text-xs font-black ${
            filter === "attributed"
              ? "bg-[#4ade80] text-black"
              : "border-[#1a2e1a] text-[#6b8e6b]"
          }`}
        >
          <User className="h-3 w-3 mr-1" />
          ATTRIBUTED ({attributedCount})
        </Button>
        <Button
          variant={filter === "unattributed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unattributed")}
          className={`rounded-none text-xs font-black ${
            filter === "unattributed"
              ? "bg-[#fbbf24] text-black"
              : "border-[#1a2e1a] text-[#6b8e6b]"
          }`}
        >
          UNATTRIBUTED ({unattributedCount})
        </Button>
        <div className="flex-1" />
        <Link href="/artist/designs">
          <Button
            variant="outline"
            size="sm"
            className="rounded-none border-[#1a2e1a] text-[#6b8e6b] text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            VIEW ALL
          </Button>
        </Link>
      </div>

      {/* Designs Grid - Empty State for Filter */}
      {filteredDesigns.length === 0 ? (
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-12 text-center">
            {filter === "attributed" ? (
              <>
                <User className="h-12 w-12 text-[#6b8e6b] mx-auto mb-4" />
                <h3 className="text-xl font-black tracking-tighter text-[#e8f5e8] mb-2">
                  NO ATTRIBUTED DESIGNS
                </h3>
                <p className="text-[#6b8e6b] font-mono text-sm max-w-md mx-auto mb-6">
                  You haven&apos;t attributed any designs to partners yet. 
                  Attributing connects your art to the canvas and creates revenue sharing.
                </p>
                <Link href="/artist/designs/upload">
                  <Button className="bg-[#fbbf24] hover:bg-[#f59e0b] text-black rounded-none font-black">
                    <Plus className="h-4 w-4 mr-2" />
                    UPLOAD & ATTRIBUTE
                  </Button>
                </Link>
              </>
            ) : filter === "unattributed" ? (
              <>
                <CheckIcon className="h-12 w-12 text-[#4ade80] mx-auto mb-4" />
                <h3 className="text-xl font-black tracking-tighter text-[#e8f5e8] mb-2">
                  ALL DESIGNS ATTRIBUTED
                </h3>
                <p className="text-[#6b8e6b] font-mono text-sm max-w-md mx-auto mb-6">
                  Great work! Every design in your portfolio has a partner attributed. 
                  This maximizes your reach and shared earnings.
                </p>
                <Link href="/artist/designs/upload">
                  <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black">
                    <Plus className="h-4 w-4 mr-2" />
                    ADD NEW DESIGN
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 text-[#6b8e6b] mx-auto mb-4" />
                <h3 className="text-xl font-black tracking-tighter text-[#e8f5e8] mb-2">
                  NO DESIGNS FOUND
                </h3>
                <p className="text-[#6b8e6b] font-mono text-sm">
                  Try a different filter or upload new designs.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDesigns.map((design) => (
            <Card
              key={design.id}
              className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden group"
            >
              {/* Design Preview */}
              <div className="relative aspect-square bg-[#050805]">
                {design.image ? (
                  <Image
                    src={design.image}
                    alt={design.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-[#1a2e1a]" />
                  </div>
                )}
                
                {/* Status Badge */}
                <Badge
                  className={`absolute top-2 left-2 rounded-none text-[10px] ${
                    design.status === "active"
                      ? "bg-[#4ade80] text-black"
                      : design.status === "pending"
                      ? "bg-[#fbbf24] text-black"
                      : "bg-[#6b8e6b]/30 text-[#6b8e6b]"
                  }`}
                >
                  {design.status.toUpperCase()}
                </Badge>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onCreateGarment(design.id)}
                    className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none text-xs font-black"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    CREATE GARMENT
                  </Button>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Title */}
                <div>
                  <h3 className="font-black text-[#e8f5e8] truncate">
                    {design.title}
                  </h3>
                  <p className="text-xs text-[#6b8e6b] font-mono">
                    {new Date(design.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Partner Attribution */}
                {design.partnerName ? (
                  <div className="flex items-center gap-2 p-2 bg-[#4ade80]/5 border border-[#4ade80]/20">
                    <User className="h-3 w-3 text-[#4ade80]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#6b8e6b] truncate">
                        {design.partnerName}
                      </p>
                      <p className="text-[10px] text-[#4ade80] font-mono">
                        {design.royaltySplit}% royalty
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-[#fbbf24]/5 border border-[#fbbf24]/20">
                    <User className="h-3 w-3 text-[#fbbf24]" />
                    <p className="text-xs text-[#fbbf24]">No partner attributed</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-[#050805]">
                    <div className="flex items-center gap-1 text-[#6b8e6b] mb-1">
                      <TrendingUp className="h-3 w-3" />
                      SALES
                    </div>
                    <div className="font-black text-[#e8f5e8]">{design.sales}</div>
                  </div>
                  <div className="p-2 bg-[#050805]">
                    <div className="flex items-center gap-1 text-[#6b8e6b] mb-1">
                      <DollarSign className="h-3 w-3" />
                      EARNED
                    </div>
                    <div className="font-black text-[#4ade80]">
                      ${design.earnings.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Empty State: No designs at all in portfolio
function EmptyPortfolio() {
  return (
    <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden">
      <CardContent className="p-12 md:p-16 text-center">
        {/* Icon Cluster */}
        <div className="relative inline-block mb-8">
          <div className="w-28 h-28 bg-[#050805] border-2 border-[#1a2e1a] flex items-center justify-center">
            <Palette className="h-12 w-12 text-[#6b8e6b]" />
          </div>
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#050805] border border-[#4ade80]/30 flex items-center justify-center">
            <Upload className="h-5 w-5 text-[#4ade80]" />
          </div>
          <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-[#050805] border border-[#fbbf24]/30 flex items-center justify-center">
            <Share2 className="h-5 w-5 text-[#fbbf24]" />
          </div>
        </div>

        <h3 className="text-3xl font-black tracking-tighter text-[#e8f5e8] mb-4">
          YOUR PORTFOLIO IS EMPTY
        </h3>

        <p className="text-[#6b8e6b] font-mono text-sm max-w-lg mx-auto mb-3">
          Your portfolio is where your tattoo designs live. Upload your art to create 
          merchandise, attribute to partners, and start earning from the tattoo economy.
        </p>

        <p className="text-xs text-[#6b8e6b] max-w-md mx-auto mb-10">
          Every design can be printed on garments, attributed to the canvas who wears it, 
          and generate passive income for both of you.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left max-w-2xl mx-auto">
          <div className="p-5 bg-[#050805] border border-[#1a2e1a] hover:border-[#4ade80]/30 transition-colors">
            <div className="w-10 h-10 bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center mb-3">
              <Upload className="h-5 w-5 text-[#4ade80]" />
            </div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">UPLOAD</p>
            <p className="text-xs text-[#6b8e6b]">
              Add your designs to the platform. Vector, high-res, or sketches.
            </p>
          </div>
          <div className="p-5 bg-[#050805] border border-[#1a2e1a] hover:border-[#fbbf24]/30 transition-colors">
            <div className="w-10 h-10 bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center mb-3">
              <User className="h-5 w-5 text-[#fbbf24]" />
            </div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">ATTRIBUTE</p>
            <p className="text-xs text-[#6b8e6b]">
              Link designs to partners who have them tattooed. They earn too.
            </p>
          </div>
          <div className="p-5 bg-[#050805] border border-[#1a2e1a] hover:border-[#dc2626]/30 transition-colors">
            <div className="w-10 h-10 bg-[#dc2626]/10 border border-[#dc2626]/30 flex items-center justify-center mb-3">
              <DollarSign className="h-5 w-5 text-[#dc2626]" />
            </div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">MONETIZE</p>
            <p className="text-xs text-[#6b8e6b]">
              Create garments, sell worldwide, earn from every sale.
            </p>
          </div>
        </div>

        <Link href="/artist/designs/upload">
          <Button
            size="lg"
            className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black tracking-wider px-8"
          >
            <Plus className="h-5 w-5 mr-2" />
            UPLOAD YOUR FIRST DESIGN
          </Button>
        </Link>

        <p className="mt-6 text-xs text-[#6b8e6b] font-mono">
          Supports PNG, JPG, SVG • Max 50MB per file
        </p>
      </CardContent>
    </Card>
  )
}

// Simple check icon component
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
