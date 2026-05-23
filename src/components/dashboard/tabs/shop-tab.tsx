"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ShoppingBag,
  Heart,
  TrendingUp,
  Sparkles,
  Search,
  ArrowRight,
  Users,
  Zap,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface DesignItem {
  id: string
  title: string
  artistName: string
  category: string
  price: number
  image?: string
  sales: number
  isNew?: boolean
  partnerCount?: number
}

interface SavedItem {
  id: string
  designId: string
  title: string
  artistName: string
  price: number
  addedAt: string
}

interface ShopTabProps {
  featuredDesigns?: DesignItem[]
  savedItems?: SavedItem[]
}

// Demo featured designs
const defaultFeaturedDesigns: DesignItem[] = [
  { id: "1", title: "NEON SERPENT", artistName: "Ghost Ink", category: "Neo-Traditional", price: 65, sales: 234, isNew: true, partnerCount: 3 },
  { id: "2", title: "INK DEMON", artistName: "Dark Matter", category: "Blackwork", price: 55, sales: 189, partnerCount: 2 },
  { id: "3", title: "SKULL ROSE", artistName: "Bloodline", category: "Traditional", price: 45, sales: 312, partnerCount: 1 },
  { id: "4", title: "CYBER WOLF", artistName: "Sacred Skin", category: "Geometric", price: 70, sales: 156, isNew: true, partnerCount: 4 },
]

export function ShopTab({ featuredDesigns = defaultFeaturedDesigns, savedItems = [] }: ShopTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "new" | "trending" | "partnership">("all")

  const filteredDesigns = featuredDesigns.filter((design) => {
    if (activeFilter === "new") return design.isNew
    if (activeFilter === "trending") return design.sales > 200
    if (activeFilter === "partnership") return (design.partnerCount || 0) > 0
    return true
  })

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="bg-[#0a0f0a] border-[#60a5fa]/30 rounded-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#60a5fa]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <Badge className="bg-[#60a5fa] text-black rounded-none text-[10px] font-black mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                FEATURED DROP
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black text-[#e8f5e8] tracking-tighter mb-2">
                VOID WALKER COLLECTION
              </h2>
              <p className="text-[#6b8e6b] mb-6 max-w-md">
                Limited edition designs from top underground artists. 
                Each purchase supports the artist and their tattoo partners.
              </p>
              <div className="flex gap-3">
                <Link href="/shop">
                  <Button className="bg-[#60a5fa] hover:bg-[#3b82f6] text-black rounded-none font-black">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    SHOP NOW
                  </Button>
                </Link>
                <Link href="/artists">
                  <Button variant="outline" className="border-[#60a5fa]/50 text-[#60a5fa] hover:bg-[#60a5fa]/10 rounded-none font-black">
                    EXPLORE ARTISTS
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-64 h-64 bg-[#050805] border border-[#1a2e1a] flex items-center justify-center">
              <Zap className="h-24 w-24 text-[#60a5fa]/30" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH DESIGNS, ARTISTS..."
            className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none pl-10 font-black uppercase"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "new", "trending", "partnership"] as const).map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-none text-xs font-black ${
                activeFilter === filter
                  ? "bg-[#60a5fa] text-black"
                  : "border-[#1a2e1a] text-[#6b8e6b]"
              }`}
            >
              {filter.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Designs Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-[#e8f5e8] tracking-tighter flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#60a5fa]" />
            TRENDING DESIGNS
          </h3>
          <Link href="/shop">
            <Button variant="outline" size="sm" className="rounded-none border-[#1a2e1a] text-[#6b8e6b] text-xs font-black">
              VIEW ALL
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDesigns.map((design) => (
            <Card
              key={design.id}
              className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden group hover:border-[#60a5fa]/50 transition-colors"
            >
              {/* Design Image */}
              <div className="relative aspect-[3/4] bg-[#050805]">
                {design.image ? (
                  <Image
                    src={design.image}
                    alt={design.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-[#1a2e1a]" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {design.isNew && (
                    <Badge className="bg-[#60a5fa] text-black rounded-none text-[10px] font-black">
                      NEW
                    </Badge>
                  )}
                  {(design.partnerCount || 0) > 0 && (
                    <Badge className="bg-[#4ade80] text-black rounded-none text-[10px] font-black flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {design.partnerCount} PARTNERS
                    </Badge>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-black/80 rounded-none border border-[#1a2e1a] hover:border-[#dc2626] hover:text-[#dc2626]"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-1 text-[10px] font-mono bg-black/80 border border-[#1a2e1a] text-[#6b8e6b]">
                    {design.category.toUpperCase()}
                  </span>
                </div>
              </div>

              <CardContent className="p-4">
                {/* Artist */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-[#60a5fa]/20 flex items-center justify-center">
                    <span className="text-[10px] text-[#60a5fa] font-black">
                      {design.artistName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-[#6b8e6b] font-mono">
                    {design.artistName.toUpperCase()}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-black text-[#e8f5e8] truncate mb-1">
                  {design.title}
                </h4>

                {/* Price & Action */}
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-xl font-black text-[#60a5fa]">
                      ${design.price}
                    </span>
                    <span className="text-[10px] text-[#6b8e6b] font-mono block">
                      {design.sales} SOLD
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#60a5fa] hover:bg-[#3b82f6] text-black rounded-none text-xs font-black"
                  >
                    VIEW
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Saved Items Section */}
      {savedItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-[#e8f5e8] tracking-tighter flex items-center gap-2">
              <Heart className="h-5 w-5 text-[#dc2626]" />
              SAVED ITEMS
            </h3>
            <Link href="/saved">
              <Button variant="outline" size="sm" className="rounded-none border-[#1a2e1a] text-[#6b8e6b] text-xs font-black">
                VIEW ALL
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {savedItems.slice(0, 4).map((item) => (
              <Card
                key={item.id}
                className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden group hover:border-[#dc2626]/50 transition-colors"
              >
                <div className="relative aspect-square bg-[#050805] mb-3">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-[#1a2e1a] group-hover:text-[#dc2626]/50 transition-colors" />
                  </div>
                </div>
                <CardContent className="p-4 pt-0">
                  <h4 className="font-bold text-[#e8f5e8] text-sm truncate">{item.title}</h4>
                  <p className="text-xs text-[#6b8e6b]">{item.artistName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-black text-[#60a5fa]">${item.price}</span>
                    <Button variant="ghost" size="sm" className="h-8 text-[#6b8e6b] hover:text-[#dc2626]">
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Browse by Category */}
      <div>
        <h3 className="text-lg font-black text-[#e8f5e8] tracking-tighter mb-4">
          BROWSE BY CATEGORY
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "TRADITIONAL", count: 128 },
            { name: "NEO-TRADITIONAL", count: 86 },
            { name: "BLACKWORK", count: 64 },
            { name: "JAPANESE", count: 52 },
            { name: "GEOMETRIC", count: 93 },
            { name: "WATERCOLOR", count: 45 },
            { name: "MINIMALIST", count: 76 },
            { name: "REALISM", count: 38 },
          ].map((category) => (
            <Link key={category.name} href={`/shop?category=${category.name.toLowerCase()}`}>
              <div className="p-4 bg-[#0a0f0a] border border-[#1a2e1a] hover:border-[#60a5fa]/50 transition-colors group">
                <div className="font-black text-[#e8f5e8] group-hover:text-[#60a5fa] transition-colors">
                  {category.name}
                </div>
                <div className="text-xs text-[#6b8e6b] font-mono">
                  {category.count} DESIGNS
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
