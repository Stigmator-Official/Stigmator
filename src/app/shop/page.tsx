"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useShopItems } from "@/lib/query/hooks"
import { useCart } from "@/lib/cart/cart-context"
import { useToast } from "@/components/toast/toast-context"
import { usePageView, useProductAnalytics } from "@/lib/analytics"
import { ProductGridSkeleton, ProductListSkeleton, ShopHeaderSkeleton } from "@/components/skeletons/product-skeleton"
import { SectionErrorFallback } from "@/components/error/error-boundary"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { FreshnessFilter, FreshnessBadge } from "@/components/shop/freshness-filter"
import { useSearch } from "@/lib/search/use-search"

// Simple filter interface for shop page
interface ShopFilterState {
  gender: "all" | "male" | "female" | "unisex"
  type: string
  style: string
  priceRange: [number, number]
  sortBy: "freshness" | "price-asc" | "price-desc" | "sales" | "newest"
}

const createInitialFilters = (): ShopFilterState => ({
  gender: "all",
  type: "all",
  style: "all",
  priceRange: [0, 1000],
  sortBy: "freshness"
})
import { 
  Search, 
  Filter, 
  Heart, 
  TrendingUp,
  TrendingDown,
  Package,
  Grid3X3,
  List,
  Sparkles,
  Flame,
  MapPin,
  ChevronUp,
  ChevronDown,
  ShoppingCart,
  Check,
  X,
  SlidersHorizontal
} from "lucide-react"
import type { ProductDesign } from "@/lib/api/products"

// Garment type options
const GARMENT_TYPES = ["all", "t-shirt", "hoodie", "longsleeve", "tank", "hat"]
const TATTOO_STYLES = ["all", "Traditional", "Neo-Traditional", "Japanese", "Blackwork", "Geometric", "Watercolor", "Minimalist", "Realism"]
const GENDER_OPTIONS = [
  { value: "all", label: "ALL" },
  { value: "male", label: "MEN" },
  { value: "female", label: "WOMEN" },
  { value: "unisex", label: "UNISEX" },
]

// Transform API data to ShopProduct format
function transformProduct(item: ProductDesign) {
  const price = (item.price_override || item.product.base_price) / 100
  const age = Date.now() - new Date(item.created_at).getTime()
  const days = age / (1000 * 60 * 60 * 24)
  
  let freshness: "FIRE" | "HOT" | "FRESH" | "STALE" | "VINTAGE" = "FRESH"
  if (item.total_sales > 100 && days < 7) freshness = "FIRE"
  else if (item.total_sales > 50 || days < 14) freshness = "HOT"
  else if (days < 60) freshness = "FRESH"
  else if (days < 180) freshness = "STALE"
  else freshness = "VINTAGE"
  
  return {
    id: item.id,
    productDesignId: item.id,
    name: item.design.title,
    artist: item.design.artist?.display_name || "Unknown Artist",
    artistId: item.artist_id,
    artistCountry: "United States",
    artistRegion: "North America",
    type: item.product.name,
    gender: "unisex" as const,
    price,
    image: item.mockup_images[0] || "/placeholder.jpg",
    freshness,
    freshnessScore: Math.max(0, 1000 - (days * 2) + (item.total_sales * 150)),
    totalSales: item.total_sales,
    salesLast24h: 0,
    salesLast7d: 0,
    salesLast30d: 0,
    views: 0,
    isLimited: false,
    tags: ["tattoo", "art", "streetwear"],
    tattooStyle: "blackwork",
    createdAt: item.created_at,
    lastSaleAt: null,
    isVerified: true,
    original: item,
  }
}

export default function ShopPage() {
  usePageView()
  const { data: items, isLoading, error } = useShopItems()
  const { addItem } = useCart()
  const { success, error: showError } = useToast()
  const { trackAddToCart } = useProductAnalytics()
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [freshnessFilter, setFreshnessFilter] = useState<"ALL" | "FIRE" | "HOT" | "FRESH" | "STALE" | "VINTAGE">("ALL")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ShopFilterState>(createInitialFilters())
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set())

  const products = useMemo(() => items?.map(transformProduct) || [], [items])
  
  // Calculate freshness counts
  const freshnessCounts = useMemo(() => ({
    all: products.length,
    fire: products.filter(p => p.freshness === "FIRE").length,
    hot: products.filter(p => p.freshness === "HOT").length,
    fresh: products.filter(p => p.freshness === "FRESH").length,
    stale: products.filter(p => p.freshness === "STALE").length,
    vintage: products.filter(p => p.freshness === "VINTAGE").length,
  }), [products])
  
  const { query, setQuery, results: searchResults } = useSearch(products, 300)

  const filteredProducts = useMemo(() => {
    let result = searchResults

    if (freshnessFilter !== "ALL") {
      result = result.filter(p => p.freshness === freshnessFilter)
    }

    if (filters.gender !== "all") {
      result = result.filter(p => p.gender === filters.gender)
    }

    if (filters.type !== "all") {
      result = result.filter(p => p.type.toLowerCase().includes(filters.type.toLowerCase()))
    }

    if (filters.style !== "all") {
      result = result.filter(p => p.tattooStyle === filters.style)
    }

    result = result.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1])

    switch (filters.sortBy) {
      case "freshness":
        result.sort((a, b) => b.freshnessScore - a.freshnessScore)
        break
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "sales":
        result.sort((a, b) => b.totalSales - a.totalSales)
        break
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return result
  }, [searchResults, freshnessFilter, filters])

  const handleAddToCart = (product: ReturnType<typeof transformProduct>, size: string, color: string) => {
    try {
      addItem({
        product_design_id: product.productDesignId,
        design_title: product.name,
        product_name: `${product.type} (${color})`,
        artist_name: product.artist,
        artist_id: product.artistId,
        mockup_image: product.image,
        size,
        color,
        quantity: 1,
        unit_price: Math.round(product.price * 100),
      }, { silent: true })
      
      // Show success feedback
      setRecentlyAdded(prev => new Set(prev).add(product.id))
      setTimeout(() => {
        setRecentlyAdded(prev => {
          const next = new Set(prev)
          next.delete(product.id)
          return next
        })
      }, 2000)
      
      trackAddToCart(product.productDesignId, 1, product.price)
      success("Added to cart", `${product.name} has been added to your bag`)
    } catch (err) {
      showError("Failed to add", "Please try again later")
    }
  }

  const clearFilters = () => {
    setFilters(createInitialFilters())
    setFreshnessFilter("ALL")
    setQuery("")
  }

  const hasActiveFilters = freshnessFilter !== "ALL" || 
    filters.gender !== "all" || 
    filters.type !== "all" || 
    filters.style !== "all" ||
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 1000 ||
    query.length > 0

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 texture-grain">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8">
          <ShopHeaderSkeleton />
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-12 texture-grain">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8">
          <SectionErrorFallback 
            error={error instanceof Error ? error : new Error(String(error))} 
            retry={() => window.location.reload()} 
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-[#4ade80]" />
            <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8]">
              THE FLASH
            </h1>
          </div>
          <p className="text-[#6b8e6b]">
            Fresh designs from tattoo artists worldwide. Updated in real-time.
          </p>
        </div>

        {/* Freshness Filter Bar */}
        <FreshnessFilter 
          activeFilter={freshnessFilter}
          onFilterChange={setFreshnessFilter}
          counts={freshnessCounts}
        />

        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6b8e6b]" />
            <Input
              placeholder="Search designs, artists, styles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-[#0a0f0a] border-[#1a2e1a] rounded-none h-12 text-[#e8f5e8] focus:border-[#4ade80]"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8e6b] hover:text-[#e8f5e8]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-[#1a2e1a] rounded-none h-12 ${showFilters ? 'bg-[#4ade80] text-[#080a08]' : 'text-[#6b8e6b]'}`}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              FILTERS
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 bg-[#dc2626] rounded-full" />
              )}
            </Button>
            
            <div className="flex border border-[#1a2e1a] rounded-none">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 ${viewMode === "grid" ? "bg-[#4ade80] text-[#080a08]" : "text-[#6b8e6b] hover:text-[#e8f5e8]"}`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 ${viewMode === "list" ? "bg-[#4ade80] text-[#080a08]" : "text-[#6b8e6b] hover:text-[#e8f5e8]"}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-6 border border-[#1a2e1a] mb-6 bg-[#0a0f0a]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black tracking-tighter text-[#e8f5e8]">FILTERS</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#dc2626] hover:text-[#ff4444] flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Gender Filter */}
              <div>
                <label className="block font-mono text-xs text-[#6b8e6b] mb-2">GENDER</label>
                <div className="flex flex-wrap gap-2">
                  {GENDER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters(prev => ({ ...prev, gender: option.value as any }))}
                      className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                        filters.gender === option.value
                          ? "bg-[#4ade80] text-black"
                          : "bg-[#050805] border border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Garment Type Filter */}
              <div>
                <label className="block font-mono text-xs text-[#6b8e6b] mb-2">GARMENT TYPE</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-[#050805] border border-[#1a2e1a] rounded-none h-10 px-3 text-[#e8f5e8] text-sm focus:border-[#4ade80] focus:outline-none"
                >
                  {GARMENT_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tattoo Style Filter */}
              <div>
                <label className="block font-mono text-xs text-[#6b8e6b] mb-2">TATTOO STYLE</label>
                <select
                  value={filters.style}
                  onChange={(e) => setFilters(prev => ({ ...prev, style: e.target.value }))}
                  className="w-full bg-[#050805] border border-[#1a2e1a] rounded-none h-10 px-3 text-[#e8f5e8] text-sm focus:border-[#4ade80] focus:outline-none"
                >
                  {TATTOO_STYLES.map(style => (
                    <option key={style} value={style}>
                      {style === "all" ? "All Styles" : style}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block font-mono text-xs text-[#6b8e6b] mb-2">SORT BY</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full bg-[#050805] border border-[#1a2e1a] rounded-none h-10 px-3 text-[#e8f5e8] text-sm focus:border-[#4ade80] focus:outline-none"
                >
                  <option value="freshness">Freshness (Default)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="sales">Most Popular</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="mt-6 pt-6 border-t border-[#1a2e1a]">
              <div className="flex items-center justify-between mb-3">
                <label className="font-mono text-xs text-[#6b8e6b]">PRICE RANGE</label>
                <span className="text-sm text-[#e8f5e8]">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </span>
              </div>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                max={1000}
                step={10}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Results Count & Active Filters */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[#6b8e6b] font-mono text-sm">
            SHOWING {filteredProducts.length} {filteredProducts.length === 1 ? "PIECE" : "PIECES"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#dc2626] hover:text-[#ff4444] flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#1a2e1a] bg-[#0a0f0a]">
            <Package className="h-16 w-16 text-[#1a2e1a] mx-auto mb-4" />
            <p className="text-[#6b8e6b] font-mono mb-2">NO PIECES MATCH YOUR FILTERS</p>
            <p className="text-sm text-[#6b8e6b]/70 mb-4">Try adjusting your search or filters</p>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none"
            >
              Clear all filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={(size, color) => handleAddToCart(product, size, color)}
                isRecentlyAdded={recentlyAdded.has(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductListItem 
                key={product.id} 
                product={product}
                onAddToCart={() => handleAddToCart(product, "M", "Black")}
                isRecentlyAdded={recentlyAdded.has(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const SIZE_OPTIONS = ["S", "M", "L", "XL"]
const COLOR_OPTIONS = ["Black", "White", "Natural"]

function ProductCard({ 
  product, 
  onAddToCart,
  isRecentlyAdded 
}: { 
  product: ReturnType<typeof transformProduct>
  onAddToCart: (size: string, color: string) => void 
  isRecentlyAdded: boolean
}) {
  const isFire = product.freshness === "FIRE"
  const isHot = product.freshness === "HOT"
  const isTrendingUp = product.salesLast24h > 5
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [selectedSize, setSelectedSize] = useState("M")
  const [selectedColor, setSelectedColor] = useState("Black")

  return (
    <Card 
      className={`bg-[#0a0f0a] rounded-none overflow-hidden group relative border-2 transition-all duration-300 ${
        isFire ? "border-[#dc2626]" : "border-[#1a2e1a] hover:border-[#4ade80]"
      } ${isHovered ? 'shadow-lg shadow-[#4ade80]/5' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Image - Clickable to product detail */}
        <Link href={`/shop/product/${product.productDesignId}`} className="block">
          <div className={`relative aspect-square overflow-hidden transition-colors ${
            isFire ? "bg-gradient-to-br from-[#dc2626]/20 to-[#1a2e1a]" : "bg-[#1a2e1a]"
          }`}>
            <OptimizedImage
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              transform={{ width: 400, height: 400, resize: "cover" }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            
            {isFire && (
              <div className="absolute inset-0 bg-[#dc2626]/10 animate-pulse" />
            )}
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
              <FreshnessBadge status={product.freshness} size="sm" />
              {product.isLimited && (
                <Badge className="bg-[#fbbf24] text-black rounded-none text-xs">
                  LIMITED
                </Badge>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button 
                className="p-2 bg-[#0a0f0a] text-[#6b8e6b] hover:text-[#dc2626] transition-colors border border-[#1a2e1a]"
                onClick={(e) => e.preventDefault()}
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>

            {/* Sales Overlay */}
            {(isFire || isHot) && (
              <div className="absolute bottom-3 right-3 z-10">
                <Badge className={`rounded-none font-black ${
                  isFire 
                    ? "bg-[#dc2626] text-white animate-pulse" 
                    : "bg-[#f97316] text-white"
                }`}>
                  {isFire && <Flame className="h-3 w-3 mr-1" />}
                  {product.totalSales} SALES
                </Badge>
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="p-4">
          <Link href={`/shop/product/${product.productDesignId}`} className="block">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-black text-lg text-[#e8f5e8] group-hover:text-[#4ade80] transition-colors">
                  {product.name}
                </h3>
              </div>
              {isTrendingUp && (
                <TrendingUp className="h-4 w-4 text-[#4ade80]" />
              )}
            </div>
          </Link>
          
          <Link href={`/artists/${product.artistId}`}>
            <p className="text-sm text-[#6b8e6b] hover:text-[#4ade80] transition-colors mb-3">
              {product.artist}
            </p>
          </Link>

          <div className="flex items-center gap-2 text-xs text-[#6b8e6b] mb-3">
            <MapPin className="h-3 w-3" />
            <span>{product.artistCountry}</span>
            <span>•</span>
            <span>{product.type}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-[#4ade80]">${product.price}</span>
            </div>
            <div className="flex flex-col gap-2">
              {/* Quick Variant Selectors */}
              <div className="flex gap-1">
                {SIZE_OPTIONS.map(size => (
                  <button
                    key={size}
                    onClick={(e) => { e.preventDefault(); setSelectedSize(size) }}
                    className={`px-2 py-0.5 text-[10px] font-mono border transition-colors ${
                      selectedSize === size
                        ? "bg-[#4ade80] text-black border-[#4ade80]"
                        : "bg-transparent text-[#6b8e6b] border-[#1a2e1a] hover:border-[#4ade80]"
                    }`}
                    aria-label={`Select size ${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    onClick={(e) => { e.preventDefault(); setSelectedColor(color) }}
                    className={`px-2 py-0.5 text-[10px] font-mono border transition-colors ${
                      selectedColor === color
                        ? "bg-[#4ade80] text-black border-[#4ade80]"
                        : "bg-transparent text-[#6b8e6b] border-[#1a2e1a] hover:border-[#4ade80]"
                    }`}
                    aria-label={`Select color ${color}`}
                  >
                    {color.toUpperCase()}
                  </button>
                ))}
              </div>
              <Button 
                onClick={(e) => { e.preventDefault(); onAddToCart(selectedSize, selectedColor); }}
                disabled={isRecentlyAdded}
                className={`rounded-none font-black transition-all duration-300 ${
                  isRecentlyAdded
                    ? "bg-[#4ade80] text-black"
                    : "bg-[#dc2626] hover:bg-[#b91c1c] text-white"
                }`}
              >
                {isRecentlyAdded ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    ADDED
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    ADD TO CART
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductListItem({ 
  product, 
  onAddToCart,
  isRecentlyAdded 
}: { 
  product: ReturnType<typeof transformProduct>
  onAddToCart: () => void 
  isRecentlyAdded: boolean
}) {
  const isFire = product.freshness === "FIRE"
  const isTrendingUp = product.salesLast24h > 5

  return (
    <Card className={`bg-[#0a0f0a] rounded-none overflow-hidden group border-2 transition-all duration-300 hover:border-[#4ade80] ${
      isFire ? "border-[#dc2626]" : "border-[#1a2e1a]"
    }`}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <Link href={`/shop/product/${product.productDesignId}`} className={`w-full sm:w-48 h-48 flex-shrink-0 relative ${
            isFire ? "bg-gradient-to-br from-[#dc2626]/20 to-[#1a2e1a]" : "bg-[#1a2e1a]"
          }`}>
            <OptimizedImage
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              transform={{ width: 200, height: 200, resize: "cover" }}
              sizes="200px"
            />
            {isFire && <div className="absolute inset-0 bg-[#dc2626]/10 animate-pulse" />}
          </Link>
          
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <FreshnessBadge status={product.freshness} size="sm" />
                {isTrendingUp && (
                  <Badge className="bg-[#4ade80]/20 text-[#4ade80] rounded-none text-xs">
                    <ChevronUp className="h-3 w-3 mr-1" />
                    RISING
                  </Badge>
                )}
                {product.isLimited && (
                  <Badge className="bg-[#fbbf24] text-black rounded-none text-xs">
                    LIMITED
                  </Badge>
                )}
              </div>
              
              <Link href={`/shop/product/${product.productDesignId}`}>
                <h3 className="font-black text-xl text-[#e8f5e8] group-hover:text-[#4ade80] transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Link href={`/artists/${product.artistId}`}>
                  <p className="text-sm text-[#6b8e6b] hover:text-[#4ade80] transition-colors">
                    {product.artist}
                  </p>
                </Link>
                <span className="text-[#1a2e1a]">•</span>
                <span className="text-xs text-[#6b8e6b] flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {product.artistCountry}
                </span>
              </div>
              <p className="text-xs text-[#6b8e6b] mt-1">{product.type} • {product.gender}</p>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {product.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-1 bg-[#1a2e1a] text-[#6b8e6b]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="text-2xl font-black text-[#4ade80]">${product.price}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  onClick={onAddToCart}
                  disabled={isRecentlyAdded}
                  className={`rounded-none font-black transition-all duration-300 ${
                    isRecentlyAdded
                      ? "bg-[#4ade80] text-black"
                      : isFire 
                        ? "bg-[#dc2626] hover:bg-[#b91c1c] text-white animate-pulse" 
                        : "bg-[#dc2626] hover:bg-[#b91c1c] text-white"
                  }`}
                >
                  {isRecentlyAdded ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      ADDED
                    </>
                  ) : (
                    <>
                      {isFire && <Flame className="h-4 w-4 mr-2" />}
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      ADD TO CART
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
