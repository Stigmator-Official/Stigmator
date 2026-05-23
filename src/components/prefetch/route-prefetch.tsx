"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { getShopItems } from "@/lib/api/products"
import { getArtists } from "@/lib/api/artists"

// Prefetch data for common routes
export function RoutePrefetch() {
  const queryClient = useQueryClient()
  const pathname = usePathname()

  useEffect(() => {
    // Prefetch shop data when on homepage
    if (pathname === "/") {
      queryClient.prefetchQuery({
        queryKey: ["shop", "items"],
        queryFn: getShopItems,
        staleTime: 1000 * 60 * 5,
      })
    }

    // Prefetch artists when on shop page
    if (pathname === "/shop") {
      queryClient.prefetchQuery({
        queryKey: ["artists"],
        queryFn: getArtists,
        staleTime: 1000 * 60 * 5,
      })
    }
  }, [pathname, queryClient])

  return null
}

// Component to prefetch on hover
export function usePrefetchOnHover() {
  const queryClient = useQueryClient()

  const prefetchShop = () => {
    queryClient.prefetchQuery({
      queryKey: ["shop", "items"],
      queryFn: getShopItems,
      staleTime: 1000 * 60 * 5,
    })
  }

  const prefetchArtists = () => {
    queryClient.prefetchQuery({
      queryKey: ["artists"],
      queryFn: getArtists,
      staleTime: 1000 * 60 * 5,
    })
  }

  return { prefetchShop, prefetchArtists }
}
