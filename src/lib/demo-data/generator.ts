/**
 * Demo Data Generator - Ink Partnership Model
 * 
 * Universal partnership system where:
 * - Artists upload designs and attribute them to partners (people with the tattoo)
 * - Partners earn royalties from sales of apparel featuring that design
 * - Any role can have tattoos attributed to them and earn royalties
 */

// Ink Portfolio types (local to avoid circular deps)
export interface InkedTattoo {
  id: string
  designId: string
  designTitle: string
  artistId: string
  artistName: string
  artistEmail: string
  location: string
  dateInked: string
  royaltyPercentage: number
  totalSales: number
  totalEarned: number
  status: "active" | "inactive"
}

export type UserRole = "artist" | "customer" | "fulfillment" | "admin"

// ============================================================================
// TYPES
// ============================================================================

export interface Design {
  id: string
  title: string
  description: string
  imageUrl: string
  previewUrl: string
  status: "draft" | "pending" | "active" | "archived"
  category: string
  tags: string[]
  createdAt: string
  artistId: string
  artistName: string
  sales: number
  earnings: number
  // Partner attribution
  partnerId?: string
  partnerName?: string
  partnerLocation?: string
  partnerSplit?: number
  activationCode?: string
}

export interface Garment {
  id: string
  designId: string
  designTitle: string
  designImage?: string
  name: string
  type: "tshirt" | "hoodie" | "tank" | "longsleeve"
  status: "draft" | "active" | "out_of_stock"
  price: number
  inventory: number
  sales: number
  earnings: number
  createdAt: string
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  createdAt: string
}

export interface OrderItem {
  id: string
  garmentId: string
  designTitle: string
  garmentType: string
  size: string
  color: string
  price: number
  quantity: number
}

export interface ProductionJob {
  id: string
  garmentId: string
  designTitle: string
  garmentType: string
  status: "pending" | "in_production" | "completed"
  submittedAt: string
  artistId: string
  artistName: string
  manufacturerId: string
}

// Legacy types for compatibility
export interface Partnership {
  id: string
  artistId: string
  artistName: string
  code: string
  discount: number
  commission: number
  usageCount: number
  active: boolean
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
}

export interface GivenTattoo {
  id: string
  designId: string
  designTitle: string
  designImage?: string
  partnerName: string
  partnerId: string
  location: string
  royaltyPercentage: number
  totalSales: number
  partnerEarnings: number
  artistEarnings: number
  dateAttributed: string
}

export interface ArtistStats {
  totalEarnings: number
  totalSales: number
  designCount: number
  partnerCount: number
  garmentCount: number
  monthlyGrowth: number
}

export interface CustomerStats {
  totalOrders: number
  totalSpent: number
  inkEarnings: number
  tattooCount: number
}

export interface ManufacturerStats {
  totalJobs: number
  completedJobs: number
  totalEarnings: number
  inkEarnings: number
  tattooCount: number
}

export type RoleSpecificStats = ArtistStats | CustomerStats | ManufacturerStats

export interface DemoData {
  user?: {
    id: string
    email: string
    fullName: string
    displayName: string
    role: UserRole
    avatar: string
    createdAt: string
  }
  designs: Design[]
  garments: Garment[]
  orders: Order[]
  productionJobs: ProductionJob[]
  inkPortfolio: InkedTattoo[]
  givenTattoos: GivenTattoo[]
  partnerships?: Partnership[] // Legacy compatibility
  notifications?: Notification[] // Legacy compatibility
  stats: RoleSpecificStats
}

// ============================================================================
// MOCK DATA
// ============================================================================

const DESIGN_TITLES = [
  "NEON SERPENT", "INK DEMON", "SKULL ROSE", "TRIBAL WAVE", "CYBER WOLF",
  "FLAME HEART", "MOON PHASES", "SACRED GEOMETRY", "TOKYO DRIFT", "VOID WALKER",
  "FLORAL SNAKE", "GEOMETRIC LION", "WATERCOLOR SKULL", "LINEWORK MANDALA", 
  "DOTWORK EYE", "BLACK ROSE", "ONI MASK", "KOI FISH", "PHOENIX RISING"
]

const TATTOO_LOCATIONS = [
  "Left Arm", "Right Arm", "Chest", "Back", "Left Leg", "Right Leg",
  "Shoulder", "Forearm", "Calf", "Thigh", "Ribs", "Neck"
]

const PARTNER_NAMES = [
  "Alex Chen", "Jordan Rivera", "Casey Park", "Morgan Lee", "Taylor Wong",
  "Sam Patel", "Jamie Kim", "Riley Singh", "Quinn Thompson", "Avery Martinez"
]

const CATEGORIES = ["Traditional", "Neo-Traditional", "Japanese", "Blackwork", "Watercolor", "Geometric", "Minimalist"]

// ============================================================================
// HELPERS
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function randomDate(daysAgo: number = 90): string {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date.toISOString()
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateActivationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "INK-"
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length))
  code += "-"
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length))
  return code
}

// ============================================================================
// ROLE-SPECIFIC GENERATORS
// ============================================================================

export function generateArtistData(
  userId: string, 
  email: string, 
  userName: string
): DemoData {
  const designs: Design[] = []
  const garments: Garment[] = []
  const givenTattoos: GivenTattoo[] = []
  const inkPortfolio: InkedTattoo[] = []
  
  const numDesigns = randomInt(5, 10)
  let totalEarnings = 0
  let totalSales = 0

  // Generate designs (some with partners, some without)
  for (let i = 0; i < numDesigns; i++) {
    const hasPartner = Math.random() > 0.3 // 70% have partners
    const partnerSplit = hasPartner ? randomInt(10, 30) : 0
    const designSales = randomInt(0, 100)
    const designEarnings = designSales * randomInt(20, 50)
    
    const design: Design = {
      id: generateId(),
      title: randomChoice(DESIGN_TITLES),
      description: "A striking tattoo design",
      imageUrl: `/api/placeholder/400/400`,
      previewUrl: `/api/placeholder/400/400`,
      status: randomChoice(["active", "active", "active", "pending", "draft"]),
      category: randomChoice(CATEGORIES),
      tags: [],
      createdAt: randomDate(90),
      artistId: userId,
      artistName: userName,
      sales: designSales,
      earnings: designEarnings,
      partnerId: hasPartner ? generateId() : undefined,
      partnerName: hasPartner ? randomChoice(PARTNER_NAMES) : undefined,
      partnerLocation: hasPartner ? randomChoice(TATTOO_LOCATIONS) : undefined,
      partnerSplit: hasPartner ? partnerSplit : undefined,
      activationCode: hasPartner ? generateActivationCode() : undefined,
    }
    designs.push(design)
    
    totalSales += designSales
    totalEarnings += hasPartner 
      ? Math.round(designEarnings * ((100 - partnerSplit) / 100))
      : designEarnings

    // Add to given tattoos if has partner
    if (hasPartner && design.partnerId && design.partnerName) {
      givenTattoos.push({
        id: design.id,
        designId: design.id,
        designTitle: design.title,
        designImage: design.previewUrl,
        partnerName: design.partnerName,
        partnerId: design.partnerId,
        location: design.partnerLocation || "Unknown",
        royaltyPercentage: partnerSplit,
        totalSales: designSales,
        partnerEarnings: Math.round(designEarnings * (partnerSplit / 100)),
        artistEarnings: Math.round(designEarnings * ((100 - partnerSplit) / 100)),
        dateAttributed: design.createdAt,
      })
    }

    // Generate garments for active designs
    if (design.status === "active") {
      const numGarments = randomInt(2, 4)
      const types: Garment["type"][] = ["tshirt", "hoodie", "tank", "longsleeve"]
      
      for (let j = 0; j < numGarments; j++) {
        const garmentSales = Math.floor(designSales / numGarments)
        const garmentEarnings = Math.floor(designEarnings / numGarments)
        
        garments.push({
          id: generateId(),
          designId: design.id,
          designTitle: design.title,
          designImage: design.previewUrl,
          name: `${design.title} ${types[j].toUpperCase()}`,
          type: types[j],
          status: randomChoice(["active", "active", "active", "out_of_stock"]),
          price: randomInt(30, 80),
          inventory: randomInt(0, 100),
          sales: garmentSales,
          earnings: garmentEarnings,
          createdAt: randomDate(60),
        })
      }
    }
  }

  // Artist can also have tattoos from OTHER artists (universal ink portfolio)
  const numReceivedTattoos = randomInt(0, 3)
  let inkEarnings = 0
  
  for (let i = 0; i < numReceivedTattoos; i++) {
    const sales = randomInt(10, 50)
    const royalty = randomInt(10, 25)
    const earnings = Math.round(sales * 30 * (royalty / 100))
    inkEarnings += earnings
    
    inkPortfolio.push({
      id: generateId(),
      designId: generateId(),
      designTitle: randomChoice(DESIGN_TITLES),
      artistId: generateId(),
      artistName: randomChoice(["Ghost Ink", "Dark Matter", "Bloodline", "Sacred Skin"]),
      artistEmail: "artist@example.com",
      location: randomChoice(TATTOO_LOCATIONS),
      dateInked: randomDate(180),
      royaltyPercentage: royalty,
      totalSales: sales,
      totalEarned: earnings,
      status: "active",
    })
  }

  // Legacy partnerships (empty array for compatibility)
  const partnerships: Partnership[] = []
  
  // Legacy notifications (empty array for compatibility)
  const notifications: Notification[] = []

  const stats: ArtistStats = {
    totalEarnings,
    totalSales,
    designCount: designs.length,
    partnerCount: givenTattoos.length,
    garmentCount: garments.length,
    monthlyGrowth: randomInt(5, 30),
  }

  return {
    designs,
    garments,
    orders: [],
    productionJobs: [],
    inkPortfolio,
    givenTattoos,
    partnerships,
    notifications,
    stats,
  }
}

export function generateCustomerData(
  userId: string,
  email: string,
  userName: string
): DemoData {
  const orders: Order[] = []
  const inkPortfolio: InkedTattoo[] = []
  
  // Generate orders
  const numOrders = randomInt(2, 6)
  let totalSpent = 0
  
  for (let i = 0; i < numOrders; i++) {
    const numItems = randomInt(1, 4)
    const items: OrderItem[] = []
    let orderTotal = 0

    for (let j = 0; j < numItems; j++) {
      const price = randomInt(30, 120)
      const quantity = randomInt(1, 3)
      orderTotal += price * quantity

      items.push({
        id: generateId(),
        garmentId: generateId(),
        designTitle: randomChoice(DESIGN_TITLES),
        garmentType: randomChoice(["T-Shirt", "Hoodie", "Tank Top", "Long Sleeve"]),
        size: randomChoice(["XS", "S", "M", "L", "XL", "XXL"]),
        color: randomChoice(["Black", "White", "Navy", "Olive", "Maroon"]),
        price,
        quantity,
      })
    }

    orders.push({
      id: generateId(),
      customerId: userId,
      customerName: userName,
      items,
      total: orderTotal,
      status: randomChoice(["pending", "processing", "shipped", "delivered"]),
      createdAt: randomDate(90),
    })
    
    totalSpent += orderTotal
  }

  // Collectors have tattoos attributed to them (that's how they become partners)
  const numTattoos = randomInt(1, 4)
  let inkEarnings = 0
  
  for (let i = 0; i < numTattoos; i++) {
    const sales = randomInt(20, 100)
    const royalty = randomInt(15, 30)
    const earnings = Math.round(sales * 35 * (royalty / 100))
    inkEarnings += earnings
    
    inkPortfolio.push({
      id: generateId(),
      designId: generateId(),
      designTitle: randomChoice(DESIGN_TITLES),
      artistId: generateId(),
      artistName: randomChoice(["Ghost Ink", "Dark Matter", "Bloodline", "Sacred Skin", "Iron Palm"]),
      artistEmail: "artist@example.com",
      location: randomChoice(TATTOO_LOCATIONS),
      dateInked: randomDate(200),
      royaltyPercentage: royalty,
      totalSales: sales,
      totalEarned: earnings,
      status: "active",
    })
  }

  const stats: CustomerStats = {
    totalOrders: orders.length,
    totalSpent,
    inkEarnings,
    tattooCount: inkPortfolio.length,
  }

  return {
    designs: [],
    garments: [],
    orders,
    productionJobs: [],
    inkPortfolio,
    givenTattoos: [],
    partnerships: [],
    notifications: [],
    stats,
  }
}

export function generateFulfillmentData(
  userId: string,
  email: string,
  userName: string
): DemoData {
  const jobs: ProductionJob[] = []
  const inkPortfolio: InkedTattoo[] = []
  
  const numJobs = randomInt(8, 20)
  
  for (let i = 0; i < numJobs; i++) {
    jobs.push({
      id: generateId(),
      garmentId: generateId(),
      designTitle: randomChoice(DESIGN_TITLES),
      garmentType: randomChoice(["T-Shirt", "Hoodie", "Tank Top", "Long Sleeve"]),
      status: randomChoice(["pending", "pending", "in_production", "in_production", "completed", "completed", "completed"]),
      submittedAt: randomDate(60),
      artistId: generateId(),
      artistName: `Artist ${randomInt(1, 50)}`,
      manufacturerId: userId,
    })
  }

  const completedJobs = jobs.filter(j => j.status === "completed").length
  const baseEarnings = completedJobs * randomInt(15, 35)

  // Makers can also have tattoos
  const numTattoos = randomInt(0, 2)
  let inkEarnings = 0
  
  for (let i = 0; i < numTattoos; i++) {
    const sales = randomInt(10, 40)
    const royalty = randomInt(10, 25)
    const earnings = Math.round(sales * 30 * (royalty / 100))
    inkEarnings += earnings
    
    inkPortfolio.push({
      id: generateId(),
      designId: generateId(),
      designTitle: randomChoice(DESIGN_TITLES),
      artistId: generateId(),
      artistName: randomChoice(["Ghost Ink", "Dark Matter", "Bloodline"]),
      artistEmail: "artist@example.com",
      location: randomChoice(TATTOO_LOCATIONS),
      dateInked: randomDate(365),
      royaltyPercentage: royalty,
      totalSales: sales,
      totalEarned: earnings,
      status: "active",
    })
  }

  const stats: ManufacturerStats = {
    totalJobs: jobs.length,
    completedJobs,
    totalEarnings: baseEarnings,
    inkEarnings,
    tattooCount: inkPortfolio.length,
  }

  return {
    designs: [],
    garments: [],
    orders: [],
    productionJobs: jobs,
    inkPortfolio,
    givenTattoos: [],
    partnerships: [],
    notifications: [],
    stats,
  }
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export function generateDemoData(
  userId: string,
  email: string,
  userName: string,
  role: UserRole
): DemoData {
  switch (role) {
    case "artist":
      return generateArtistData(userId, email, userName)
    case "customer":
      return generateCustomerData(userId, email, userName)
    case "fulfillment":
      return generateFulfillmentData(userId, email, userName)
    default:
      return generateCustomerData(userId, email, userName)
  }
}

// ============================================================================
// LOCAL STORAGE COMPATIBILITY
// ============================================================================

const DEMO_DATA_KEY = "stigmator_demo_data"
const DEMO_USER_KEY = "stigmator_demo_user"

export function saveDemoData(data: DemoData): void {
  if (typeof window === "undefined") return
  localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(data))
}

export function loadDemoData(): DemoData | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(DEMO_DATA_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as DemoData
  } catch {
    return null
  }
}

export function clearDemoData(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(DEMO_DATA_KEY)
  localStorage.removeItem(DEMO_USER_KEY)
}

export function getCurrentDemoUser(): { id: string; name: string; role: UserRole } | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("demo_user")
  if (!stored) return null
  try {
    const user = JSON.parse(stored)
    return {
      id: user.id,
      name: user.name,
      role: user.role as UserRole,
    }
  } catch {
    return null
  }
}

// Default export for compatibility
export default generateDemoData
