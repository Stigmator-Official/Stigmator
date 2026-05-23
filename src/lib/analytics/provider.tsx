"use client"

import { createContext, useContext, useCallback, ReactNode } from "react"

// Simple analytics context - can be swapped for Plausible, PostHog, etc.
type AnalyticsEvent = 
  | { name: "page_view"; properties: { path: string } }
  | { name: "product_view"; properties: { product_id: string; product_name: string } }
  | { name: "add_to_cart"; properties: { product_id: string; quantity: number; price: number } }
  | { name: "remove_from_cart"; properties: { product_id: string } }
  | { name: "checkout_started"; properties: { value: number; items: number } }
  | { name: "purchase"; properties: { transaction_id: string; value: number; items: number } }
  | { name: "search"; properties: { query: string; results_count: number } }
  | { name: "design_upload"; properties: { design_id: string; artist_id: string } }
  | { name: "artist_apply"; properties: { artist_id: string } }

interface AnalyticsContextType {
  track: (event: AnalyticsEvent) => void
  pageView: (path: string) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

// Console logger for development
function logEvent(event: AnalyticsEvent) {
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", event.name, event.properties)
  }
}

// Plausible implementation (when you add your domain)
function trackPlausible(eventName: string, props?: Record<string, unknown>) {
  if (typeof window !== "undefined" && "plausible" in window) {
    // @ts-expect-error - plausible is added by script
    window.plausible(eventName, { props })
  }
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const track = useCallback((event: AnalyticsEvent) => {
    logEvent(event)
    
    // Map events to Plausible
    const eventMap: Record<string, string> = {
      page_view: "pageview",
      product_view: "Product View",
      add_to_cart: "Add to Cart",
      remove_from_cart: "Remove from Cart",
      checkout_started: "Checkout Started",
      purchase: "Purchase",
      search: "Search",
      design_upload: "Design Upload",
      artist_apply: "Artist Apply",
    }
    
    const plausibleEvent = eventMap[event.name]
    if (plausibleEvent) {
      trackPlausible(plausibleEvent, event.properties)
    }
    
    // Google Analytics 4 (optional)
    if (typeof window !== "undefined" && "gtag" in window) {
      // @ts-expect-error - gtag is added by script
      window.gtag("event", event.name, event.properties)
    }
  }, [])

  const pageView = useCallback((path: string) => {
    track({ name: "page_view", properties: { path } })
  }, [track])

  return (
    <AnalyticsContext.Provider value={{ track, pageView }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}

// Hook for tracking page views
import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function usePageView() {
  const { pageView } = useAnalytics()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      pageView(pathname)
    }
  }, [pathname, pageView])
}

// Helper for product analytics
export function useProductAnalytics() {
  const { track } = useAnalytics()

  const trackProductView = useCallback((productId: string, productName: string) => {
    track({ name: "product_view", properties: { product_id: productId, product_name: productName } })
  }, [track])

  const trackAddToCart = useCallback((productId: string, quantity: number, price: number) => {
    track({ name: "add_to_cart", properties: { product_id: productId, quantity, price } })
  }, [track])

  const trackRemoveFromCart = useCallback((productId: string) => {
    track({ name: "remove_from_cart", properties: { product_id: productId } })
  }, [track])

  return { trackProductView, trackAddToCart, trackRemoveFromCart }
}

// Helper for search analytics
export function useSearchAnalytics() {
  const { track } = useAnalytics()

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    track({ name: "search", properties: { query, results_count: resultsCount } })
  }, [track])

  return { trackSearch }
}
