/**
 * Ink Portfolio System Types
 * 
 * Attribution system where tattoo clients earn royalties
 * when designs inked on their body sell on merchandise.
 */

export interface InkAttribution {
  id: string
  designId: string
  designTitle: string
  designImage: string
  artistId: string
  artistName: string
  artistAvatar: string
  
  // The person who has this tattoo on their body
  canvasId: string | null // null until activated
  canvasName: string | null
  canvasEmail: string | null
  
  // Attribution details
  tattooLocation: string // "forearm", "back", "chest", etc.
  dateInked: string
  
  // Earnings structure
  canvasPercentage: number // 5-25% typically
  artistPercentage: number // remainder after platform fee
  
  // Activation
  activationCode: string // e.g., "INK-DRAGON-7X9K"
  activatedAt: string | null
  status: "pending" | "active" | "inactive"
  
  // Earnings tracking
  totalSales: number
  totalEarned: number
  lastSaleAt: string | null
}

export interface CanvasEarnings {
  attributedDesigns: InkAttribution[]
  totalEarned: number
  pendingPayout: number
  lifetimeSales: number
  
  // Earnings by source
  byDesign: {
    designId: string
    title: string
    artistName: string
    earnings: number
    sales: number
  }[]
  
  // Recent activity
  recentSales: {
    id: string
    designTitle: string
    artistName: string
    itemSold: string // "Classic Tee", "Hoodie", etc.
    amount: number
    canvasShare: number
    date: string
  }[]
}

export interface ActivationRequest {
  code: string
  userId: string
  userEmail: string
  userName: string
}

export interface InkPortfolioStats {
  totalTattoos: number
  activeTattoos: number
  totalEarned: number
  availableCredit: number
  pendingActivation: number
}
