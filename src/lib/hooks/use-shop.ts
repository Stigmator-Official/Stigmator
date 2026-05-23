"use client"

import { useState, useEffect } from "react"
import { getShopItems, ProductDesign } from "@/lib/api/products"

export type ShopProduct = {
  id: string
  name: string
  artist: string
  artistId: string
  artistCountry: string
  artistRegion: string
  type: string
  gender: "male" | "female" | "unisex"
  price: number
  originalPrice?: number
  image: string
  freshness: "FIRE" | "HOT" | "FRESH" | "STALE" | "VINTAGE"
  freshnessScore: number
  totalSales: number
  salesLast24h: number
  salesLast7d: number
  salesLast30d: number
  views: number
  unitsLeft?: number
  isLimited: boolean
  totalUnits?: number
  tags: string[]
  tattooStyle: string
  createdAt: string
  lastSaleAt: string | null
  isVerified: boolean
  productDesignId: string
}

export function useShop() {
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        const items = await getShopItems()
        
        // Transform API data to ShopProduct format
        const transformed: ShopProduct[] = items.map((item: ProductDesign) => ({
          id: item.id,
          name: item.design.title,
          artist: item.design.artist?.display_name || "Unknown Artist",
          artistId: item.artist_id,
          artistCountry: "United States", // Would need artist profile
          artistRegion: "North America",
          type: item.product.name,
          gender: "unisex", // Would need from product data
          price: (item.price_override || item.product.base_price) / 100,
          image: item.mockup_images[0] || "/placeholder.jpg",
          freshness: calculateFreshness(item.total_sales, item.created_at),
          freshnessScore: calculateFreshnessScore(item.total_sales, item.created_at),
          totalSales: item.total_sales,
          salesLast24h: Math.floor(Math.random() * 10), // Would need real analytics
          salesLast7d: Math.floor(Math.random() * 50),
          salesLast30d: Math.floor(Math.random() * 200),
          views: Math.floor(Math.random() * 1000),
          isLimited: false,
          tags: ["tattoo", "art", "streetwear"],
          tattooStyle: "blackwork",
          createdAt: item.created_at,
          lastSaleAt: null,
          isVerified: true,
          productDesignId: item.id,
        }))

        setProducts(transformed)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load products"))
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  return { products, isLoading, error }
}

function calculateFreshness(sales: number, createdAt: string): ShopProduct["freshness"] {
  const age = Date.now() - new Date(createdAt).getTime()
  const days = age / (1000 * 60 * 60 * 24)
  
  if (sales > 100 && days < 7) return "FIRE"
  if (sales > 50 || days < 14) return "HOT"
  if (days < 60) return "FRESH"
  if (days < 180) return "STALE"
  return "VINTAGE"
}

function calculateFreshnessScore(sales: number, createdAt: string): number {
  const age = Date.now() - new Date(createdAt).getTime()
  const hours = age / (1000 * 60 * 60)
  const decay = hours * 2
  const buoyancy = sales * 150
  return Math.max(0, 1000 - decay + buoyancy)
}
