// STIGMATOR Freshness Ranking Algorithm
// A gravity-based system where sales provide buoyancy

export interface RankableItem {
  id: string
  createdAt: string // ISO date
  totalSales: number
  salesLast24h: number
  salesLast7d: number
  salesLast30d: number
  views: number
  lastSaleAt: string | null
  status: "FIRE" | "HOT" | "FRESH" | "STALE" | "VINTAGE"
}

interface RankingScore {
  score: number
  gravity: number
  buoyancy: number
  freshnessScore: number
  newStatus: "FIRE" | "HOT" | "FRESH" | "STALE" | "VINTAGE"
}

// Algorithm constants
const GRAVITY = {
  hourlyDecay: 2,           // Points lost per hour
  staleThreshold: 168,      // Hours (7 days) before stale
  archiveThreshold: 720,    // Hours (30 days) before archive consideration
}

const BUOYANCY = {
  sale24h: 150,             // Points per sale in last 24h
  sale7d: 50,               // Points per sale in last 7d
  sale30d: 10,              // Points per sale in last 30d
  viewConversion: 0.1,      // Points per view (tiny)
}

const STATUS_THRESHOLDS = {
  FIRE: 800,                // Score >= 800
  HOT: 500,                 // Score >= 500
  FRESH: 100,               // Score >= 100
  STALE: 0,                 // Score >= 0
  // Below 0 = ARCHIVE (not shown)
}

/**
 * Calculate ranking score for an item
 * Higher score = higher position in shop
 */
export function calculateRankingScore(item: RankableItem): RankingScore {
  const now = new Date()
  const createdAt = new Date(item.createdAt)
  const hoursSinceListed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
  
  // Base score starts high for new items (honeymoon period)
  let baseScore = 1000
  
  // Gravity: Items sink over time
  const gravity = hoursSinceListed * GRAVITY.hourlyDecay
  
  // Buoyancy: Sales push items back up
  const recentSalesBoost = 
    (item.salesLast24h * BUOYANCY.sale24h) +
    (item.salesLast7d * BUOYANCY.sale7d) +
    (item.salesLast30d * BUOYANCY.sale30d)
  
  // View engagement (small factor)
  const engagementBoost = item.views * BUOYANCY.viewConversion
  
  const buoyancy = recentSalesBoost + engagementBoost
  
  // Final score
  const score = Math.max(0, baseScore - gravity + buoyancy)
  
  // Determine status based on score
  let newStatus: RankableItem["status"]
  if (score >= STATUS_THRESHOLDS.FIRE) {
    newStatus = "FIRE"
  } else if (score >= STATUS_THRESHOLDS.HOT) {
    newStatus = "HOT"
  } else if (score >= STATUS_THRESHOLDS.FRESH) {
    newStatus = "FRESH"
  } else if (score >= STATUS_THRESHOLDS.STALE) {
    newStatus = "STALE"
  } else {
    newStatus = "STALE" // Archive would be filtered out
  }
  
  // Vintage special case: Stale but recently sold
  if (newStatus === "STALE" && item.lastSaleAt) {
    const hoursSinceLastSale = (now.getTime() - new Date(item.lastSaleAt).getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastSale < 48) {
      newStatus = "VINTAGE"
    }
  }
  
  return {
    score,
    gravity,
    buoyancy,
    freshnessScore: Math.min(100, Math.round((score / 1000) * 100)),
    newStatus
  }
}

/**
 * Sort items by ranking score (descending)
 */
export function sortByRanking<T extends RankableItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const scoreA = calculateRankingScore(a).score
    const scoreB = calculateRankingScore(b).score
    return scoreB - scoreA // Higher score first
  })
}

/**
 * Get trending velocity (how fast an item is rising/falling)
 */
export function getTrendingVelocity(item: RankableItem): {
  direction: "rising" | "falling" | "stable"
  velocity: number
} {
  const score = calculateRankingScore(item)
  const hoursSinceListed = (new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60)
  
  // Expected score for age
  const expectedScore = Math.max(0, 1000 - (hoursSinceListed * GRAVITY.hourlyDecay))
  
  // Difference from expected
  const velocity = score.score - expectedScore
  
  if (velocity > 100) return { direction: "rising", velocity }
  if (velocity < -100) return { direction: "falling", velocity }
  return { direction: "stable", velocity }
}

/**
 * Simulate what happens after a sale
 */
export function simulateSale(item: RankableItem): {
  before: RankingScore
  after: RankingScore
  positionJump: number
} {
  const before = calculateRankingScore(item)
  
  // Simulate sale
  const afterItem = {
    ...item,
    salesLast24h: item.salesLast24h + 1,
    totalSales: item.totalSales + 1,
    lastSaleAt: new Date().toISOString()
  }
  
  const after = calculateRankingScore(afterItem)
  
  // Estimate position jump (simplified)
  const positionJump = Math.floor((after.score - before.score) / 50)
  
  return { before, after, positionJump }
}

/**
 * Calculate time until item goes stale
 */
export function getTimeUntilStale(item: RankableItem): {
  hoursRemaining: number
  salesNeededToStayFresh: number
} {
  const score = calculateRankingScore(item)
  const hoursRemaining = Math.max(0, (score.score - STATUS_THRESHOLDS.STALE) / GRAVITY.hourlyDecay)
  
  // How many sales needed in next 24h to maintain FRESH status
  const targetScore = STATUS_THRESHOLDS.FRESH
  const currentDecay = GRAVITY.hourlyDecay * 24
  const scoreNeeded = targetScore - (score.score - currentDecay)
  const salesNeeded = Math.ceil(scoreNeeded / BUOYANCY.sale24h)
  
  return {
    hoursRemaining: Math.round(hoursRemaining),
    salesNeededToStayFresh: Math.max(0, salesNeeded)
  }
}
