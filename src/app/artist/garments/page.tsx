"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Eye, Edit2, Package, Clock, Shirt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClientBrowser } from "@/lib/supabase/client"

interface Garment {
  id: string
  name: string
  design_name: string
  status: "active" | "pending" | "draft"
  price: number
  sales: number
  revenue: number
  image_url: string | null
  created_at: string
}

interface Stats {
  total: number
  active: number
  pending: number
  totalRevenue: number
}

export default function ArtistGarmentsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "draft">("all")
  const [garments, setGarments] = useState<Garment[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    pending: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGarments()
  }, [])

  const loadGarments = async () => {
    setLoading(true)
    try {
      const supabase = createClientBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setGarments([])
        setLoading(false)
        return
      }
      
      const { data } = await supabase
        .from("product_designs")
        .select(`
          id,
          total_sales,
          is_active,
          created_at,
          design:design_id(title),
          product:product_id(name, base_price)
        `)
        .eq("artist_id", user.id)
        .order("created_at", { ascending: false })
      
      if (data) {
        const mapped: Garment[] = data.map((item: any) => ({
          id: item.id,
          name: item.product?.name || "Untitled",
          design_name: item.design?.title || "",
          status: item.is_active ? "active" : "draft",
          price: (item.product?.base_price || 0) / 100,
          sales: item.total_sales || 0,
          revenue: ((item.product?.base_price || 0) * (item.total_sales || 0)) / 100,
          image_url: null,
          created_at: item.created_at,
        }))
        
        setGarments(mapped)
        setStats({
          total: mapped.length,
          active: mapped.filter(g => g.status === "active").length,
          pending: 0,
          totalRevenue: mapped.reduce((sum, g) => sum + g.revenue, 0),
        })
      }
    } catch {
      setGarments([])
    } finally {
      setLoading(false)
    }
  }

  const filteredGarments = filter === "all" 
    ? garments 
    : garments.filter(g => g.status === filter)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 bg-[#4ade80]/20 text-[#4ade80] text-xs font-black">ACTIVE</span>
      case "pending":
        return <span className="px-2 py-1 bg-[#fbbf24]/20 text-[#fbbf24] text-xs font-black flex items-center gap-1"><Clock className="h-3 w-3" />PENDING</span>
      case "draft":
        return <span className="px-2 py-1 bg-[#6b8e6b]/20 text-[#6b8e6b] text-xs font-black">DRAFT</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8]">
              YOUR GARMENTS
            </h1>
            <p className="text-[#6b8e6b] mt-1">
              Manage your wearable art collection
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/artist/garments/pending">
              <Button variant="outline" className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none">
                <Clock className="h-4 w-4 mr-2" />
                PENDING
              </Button>
            </Link>
            <Link href="/artist/garments/create">
              <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-[#080a08] font-black rounded-none">
                <Plus className="h-4 w-4 mr-2" />
                CREATE NEW
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <p className="text-xs font-mono text-[#6b8e6b]">TOTAL GARMENTS</p>
              <p className="text-3xl font-black text-[#e8f5e8]">
                {loading ? "—" : stats.total}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <p className="text-xs font-mono text-[#6b8e6b]">ACTIVE</p>
              <p className="text-3xl font-black text-[#4ade80]">
                {loading ? "—" : stats.active}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <p className="text-xs font-mono text-[#6b8e6b]">PENDING</p>
              <p className="text-3xl font-black text-[#fbbf24]">
                {loading ? "—" : stats.pending}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <p className="text-xs font-mono text-[#6b8e6b]">TOTAL REVENUE</p>
              <p className="text-3xl font-black text-[#4ade80]">
                {loading ? "—" : `$${stats.totalRevenue.toLocaleString()}`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["all", "active", "pending", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 font-black text-sm rounded-none border transition-colors ${
                filter === f
                  ? "bg-[#4ade80] text-[#080a08] border-[#4ade80]"
                  : "bg-transparent text-[#6b8e6b] border-[#1a2e1a] hover:border-[#4ade80]"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Garments Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#0a0f0a] border border-[#1a2e1a] animate-pulse">
                <div className="aspect-square bg-[#1a2e1a]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#1a2e1a] rounded w-3/4" />
                  <div className="h-3 bg-[#1a2e1a] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : garments.length === 0 ? (
          <div className="border border-dashed border-[#1a2e1a] p-16 text-center">
            <Shirt className="h-16 w-16 text-[#6b8e6b] mx-auto mb-4" />
            <h3 className="text-2xl font-black tracking-tighter text-[#e8f5e8] mb-2">
              NO GARMENTS YET
            </h3>
            <p className="text-[#6b8e6b] font-mono text-sm max-w-md mx-auto mb-6">
              Turn your tattoo designs into wearable art. Create your first garment 
              to start selling to your fans.
            </p>
            <Link href="/artist/garments/create">
              <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-[#080a08] font-black rounded-none px-8">
                <Plus className="h-4 w-4 mr-2" />
                CREATE YOUR FIRST GARMENT
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGarments.map((garment) => (
              <Card key={garment.id} className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none group">
                <div className="relative aspect-square bg-[#050805] overflow-hidden">
                  {garment.image_url ? (
                    <img
                      src={garment.image_url}
                      alt={garment.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-[#1a2e1a]" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(garment.status)}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-3 bg-[#4ade80] text-[#080a08] hover:bg-[#3ec46e] transition-colors">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button className="p-3 bg-[#e8f5e8] text-[#080a08] hover:bg-white transition-colors">
                      <Edit2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-black text-[#e8f5e8] tracking-tight truncate">
                    {garment.name}
                  </h3>
                  <p className="text-xs text-[#6b8e6b] mb-3">Design: {garment.design_name}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-[#1a2e1a]">
                    <div>
                      <p className="text-xs font-mono text-[#6b8e6b]">PRICE</p>
                      <p className="font-black text-[#e8f5e8]">${garment.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-[#6b8e6b]">SALES</p>
                      <p className="font-black text-[#4ade80]">{garment.sales}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredGarments.length === 0 && !loading && garments.length > 0 && (
          <div className="text-center py-16 border border-dashed border-[#1a2e1a]">
            <Package className="h-12 w-12 text-[#1a2e1a] mx-auto mb-4" />
            <p className="text-[#6b8e6b] font-mono">NO GARMENTS FOUND FOR THIS FILTER</p>
          </div>
        )}
      </div>
    </div>
  )
}
