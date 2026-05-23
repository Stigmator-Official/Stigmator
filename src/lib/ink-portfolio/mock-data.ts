/**
 * Ink Portfolio Mock Data Generator
 */

import { InkAttribution, CanvasEarnings, InkPortfolioStats } from "./types"

const DESIGN_NAMES = [
  "NEON SERPENT", "INK DEMON", "SKULL ROSE", "TRIBAL WAVE", 
  "CYBER WOLF", "FLAME HEART", "MOON PHASES", "VOID WALKER"
]

const TATTOO_LOCATIONS = [
  "Full Sleeve - Right Arm",
  "Chest Piece",
  "Full Back",
  "Thigh - Left Leg",
  "Forearm - Left",
  "Calf - Right Leg",
  "Shoulder Cap",
  "Hand & Fingers"
]

const ARTIST_NAMES = [
  "Alex Rivera", "Maya Chen", "Ghost Ink", "Raven", 
  "Blade", "Soul Stitcher", "Neon Dreams"
]

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function generateCode(): string {
  const prefix = "INK"
  const design = DESIGN_NAMES[Math.floor(Math.random() * DESIGN_NAMES.length)].split(" ")[0]
  const code = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${design}-${code}`
}

function randomDate(daysAgo: number = 365): string {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date.toISOString()
}

export function generateMockInkAttributions(canvasId: string, count: number = 3): InkAttribution[] {
  return Array.from({ length: count }, (_, i) => {
    const isActivated = i < 2 // First 2 are activated, last one pending
    const artistName = ARTIST_NAMES[Math.floor(Math.random() * ARTIST_NAMES.length)]
    const designTitle = DESIGN_NAMES[Math.floor(Math.random() * DESIGN_NAMES.length)]
    const canvasPercentage = [10, 15, 20, 25][Math.floor(Math.random() * 4)]
    
    return {
      id: generateId(),
      designId: generateId(),
      designTitle,
      designImage: `/api/placeholder/400/400`,
      artistId: generateId(),
      artistName,
      artistAvatar: `/api/placeholder/100/100`,
      
      canvasId: isActivated ? canvasId : null,
      canvasName: isActivated ? "Jordan Smith" : null,
      canvasEmail: isActivated ? "jordan@example.com" : null,
      
      tattooLocation: TATTOO_LOCATIONS[Math.floor(Math.random() * TATTOO_LOCATIONS.length)],
      dateInked: randomDate(730), // Up to 2 years ago
      
      canvasPercentage,
      artistPercentage: 60, // After 15% platform fee
      
      activationCode: generateCode(),
      activatedAt: isActivated ? randomDate(180) : null,
      status: isActivated ? "active" : "pending",
      
      totalSales: isActivated ? Math.floor(Math.random() * 50) + 5 : 0,
      totalEarned: isActivated ? Math.floor(Math.random() * 500) + 50 : 0,
      lastSaleAt: isActivated ? randomDate(7) : null,
    }
  })
}

export function generateMockCanvasEarnings(canvasId: string): CanvasEarnings {
  const attributions = generateMockInkAttributions(canvasId, 4)
  
  const byDesign = attributions
    .filter(a => a.status === "active")
    .map(a => ({
      designId: a.designId,
      title: a.designTitle,
      artistName: a.artistName,
      earnings: a.totalEarned,
      sales: a.totalSales,
    }))
  
  const recentSales = attributions
    .filter(a => a.status === "active")
    .flatMap(a => [
      {
        id: generateId(),
        designTitle: a.designTitle,
        artistName: a.artistName,
        itemSold: ["Classic Tee", "Oversized Hoodie", "Crop Top", "Tote Bag"][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 40) + 30,
        canvasShare: Math.floor(a.canvasPercentage),
        date: randomDate(14),
      }
    ])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
  
  const totalEarned = attributions.reduce((sum, a) => sum + a.totalEarned, 0)
  
  return {
    attributedDesigns: attributions,
    totalEarned,
    pendingPayout: Math.floor(totalEarned * 0.8), // 80% available
    lifetimeSales: attributions.reduce((sum, a) => sum + a.totalSales, 0),
    byDesign,
    recentSales,
  }
}

export function calculateInkPortfolioStats(earnings: CanvasEarnings): InkPortfolioStats {
  return {
    totalTattoos: earnings.attributedDesigns.length,
    activeTattoos: earnings.attributedDesigns.filter(a => a.status === "active").length,
    totalEarned: earnings.totalEarned,
    availableCredit: earnings.pendingPayout,
    pendingActivation: earnings.attributedDesigns.filter(a => a.status === "pending").length,
  }
}

// Storage helpers
const STORAGE_KEY = "ink_portfolio"

export function saveInkPortfolio(data: CanvasEarnings): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

export function loadInkPortfolio(): CanvasEarnings | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as CanvasEarnings
    }
  }
  return null
}

export function generateAndStoreInkPortfolio(userId: string): CanvasEarnings {
  const data = generateMockCanvasEarnings(userId)
  saveInkPortfolio(data)
  return data
}
