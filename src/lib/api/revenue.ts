import { supabaseBrowser } from "@/lib/supabase/client"

export type RevenueRecipient = {
  recipient_id: string
  recipient_type: "artist" | "client" | "studio" | "platform"
  amount: number
  percentage: number
  description: string
}

export type RevenueCalculation = {
  sale_amount: number
  platform_fee: number
  remaining: number
  recipients: RevenueRecipient[]
}

export type ProductDesignWithPartnerships = {
  id: string
  artist_id: string
  price_override: number | null
  product: {
    base_price: number
  }
  design: {
    id: string
    partnerships: {
      partner_id: string
      artist_share: number
      client_share: number
      studio_share: number
    }[]
  }
}

const PLATFORM_FEE_PERCENTAGE = 0.15

/**
 * Calculate revenue distribution for a single product design sale
 */
export function calculateRevenueSplit(
  saleAmountCents: number,
  designPartnerships: {
    partner_id: string
    artist_share: number
    client_share: number
    studio_share: number
  }[],
  artistId: string,
  options?: {
    depositRecoupEnabled?: boolean
    depositAmount?: number
    depositRecoupedAmount?: number
  }
): RevenueCalculation {
  const platformFee = Math.round(saleAmountCents * PLATFORM_FEE_PERCENTAGE)
  const remaining = saleAmountCents - platformFee
  
  const recipients: RevenueRecipient[] = [
    {
      recipient_id: "platform",
      recipient_type: "platform",
      amount: platformFee,
      percentage: PLATFORM_FEE_PERCENTAGE * 100,
      description: "Platform fee",
    },
  ]

  // Check if deposit recoup is active
  if (options?.depositRecoupEnabled && options.depositAmount && options.depositAmount > 0) {
    const remainingDeposit = options.depositAmount - (options.depositRecoupedAmount || 0)
    
    if (remainingDeposit > 0) {
      // During recoup phase, artist gets 100% of remaining
      const recoupAmount = Math.min(remaining, remainingDeposit + remaining) // Artist keeps all during recoup
      
      recipients.push({
        recipient_id: artistId,
        recipient_type: "artist",
        amount: remaining,
        percentage: 85, // 100% of remaining 85%
        description: "Deposit recoup",
      })

      return {
        sale_amount: saleAmountCents,
        platform_fee: platformFee,
        remaining,
        recipients,
      }
    }
  }

  // Normal revenue sharing
  if (designPartnerships.length === 0) {
    // No partnerships - artist gets 100% of remaining
    recipients.push({
      recipient_id: artistId,
      recipient_type: "artist",
      amount: remaining,
      percentage: 85, // 100% of remaining 85%
      description: "Artist earnings",
    })
  } else {
    // Get the first partnership (primary one)
    const primaryPartnership = designPartnerships[0]
    const totalShares = primaryPartnership.artist_share + 
                       primaryPartnership.client_share + 
                       primaryPartnership.studio_share

    // Calculate amounts based on shares
    const artistAmount = Math.floor((remaining * primaryPartnership.artist_share) / totalShares)
    const clientAmount = Math.floor((remaining * primaryPartnership.client_share) / totalShares)
    const studioAmount = remaining - artistAmount - clientAmount // Remainder to studio to avoid rounding issues

    if (artistAmount > 0) {
      recipients.push({
        recipient_id: artistId,
        recipient_type: "artist",
        amount: artistAmount,
        percentage: (primaryPartnership.artist_share / totalShares) * 85,
        description: "Artist earnings",
      })
    }

    if (clientAmount > 0 && primaryPartnership.client_share > 0) {
      recipients.push({
        recipient_id: primaryPartnership.partner_id,
        recipient_type: "client",
        amount: clientAmount,
        percentage: (primaryPartnership.client_share / totalShares) * 85,
        description: "Client partnership share",
      })
    }

    if (studioAmount > 0 && primaryPartnership.studio_share > 0) {
      // Studio payment - in real implementation, this would go to studio account
      recipients.push({
        recipient_id: "studio",
        recipient_type: "studio",
        amount: studioAmount,
        percentage: (primaryPartnership.studio_share / totalShares) * 85,
        description: "Studio share",
      })
    }
  }

  return {
    sale_amount: saleAmountCents,
    platform_fee: platformFee,
    remaining,
    recipients,
  }
}

/**
 * Calculate revenue for multi-design garments
 * Each design gets proportional share based on design_weights
 */
export function calculateMultiDesignRevenue(
  saleAmountCents: number,
  designs: {
    design_id: string
    artist_id: string
    weight_percentage: number // 0-100, total across all designs should be 100
    partnerships: {
      partner_id: string
      artist_share: number
      client_share: number
      studio_share: number
    }[]
  }[]
): RevenueCalculation {
  const platformFee = Math.round(saleAmountCents * PLATFORM_FEE_PERCENTAGE)
  const remaining = saleAmountCents - platformFee
  
  const recipients: RevenueRecipient[] = [
    {
      recipient_id: "platform",
      recipient_type: "platform",
      amount: platformFee,
      percentage: PLATFORM_FEE_PERCENTAGE * 100,
      description: "Platform fee",
    },
  ]

  // Calculate each design's share
  for (const design of designs) {
    const designShare = Math.floor((remaining * design.weight_percentage) / 100)
    
    if (design.partnerships.length === 0) {
      // No partnerships - artist gets 100% of design share
      recipients.push({
        recipient_id: design.artist_id,
        recipient_type: "artist",
        amount: designShare,
        percentage: (design.weight_percentage / 100) * 85,
        description: `Artist earnings (${design.weight_percentage}% of garment)`,
      })
    } else {
      // Split among partners
      const primaryPartnership = design.partnerships[0]
      const totalShares = primaryPartnership.artist_share + 
                         primaryPartnership.client_share + 
                         primaryPartnership.studio_share

      const artistAmount = Math.floor((designShare * primaryPartnership.artist_share) / totalShares)
      const clientAmount = Math.floor((designShare * primaryPartnership.client_share) / totalShares)
      const studioAmount = designShare - artistAmount - clientAmount

      if (artistAmount > 0) {
        recipients.push({
          recipient_id: design.artist_id,
          recipient_type: "artist",
          amount: artistAmount,
          percentage: (primaryPartnership.artist_share / totalShares) * (design.weight_percentage / 100) * 85,
          description: `Artist earnings (${design.weight_percentage}% of garment)`,
        })
      }

      if (clientAmount > 0 && primaryPartnership.client_share > 0) {
        recipients.push({
          recipient_id: primaryPartnership.partner_id,
          recipient_type: "client",
          amount: clientAmount,
          percentage: (primaryPartnership.client_share / totalShares) * (design.weight_percentage / 100) * 85,
          description: `Client partnership (${design.weight_percentage}% of garment)`,
        })
      }

      if (studioAmount > 0 && primaryPartnership.studio_share > 0) {
        recipients.push({
          recipient_id: "studio",
          recipient_type: "studio",
          amount: studioAmount,
          percentage: (primaryPartnership.studio_share / totalShares) * (design.weight_percentage / 100) * 85,
          description: `Studio share (${design.weight_percentage}% of garment)`,
        })
      }
    }
  }

  return {
    sale_amount: saleAmountCents,
    platform_fee: platformFee,
    remaining,
    recipients,
  }
}

/**
 * Record earnings for an order item
 */
export async function recordEarnings(
  orderItemId: string,
  calculation: RevenueCalculation
): Promise<void> {
  const supabase = supabaseBrowser()

  const earningsRecords = calculation.recipients
    .filter(r => r.recipient_type !== "platform") // Platform earnings tracked separately
    .map(r => ({
      order_item_id: orderItemId,
      sale_amount: calculation.sale_amount,
      platform_fee: calculation.platform_fee,
      remaining_amount: calculation.remaining,
      recipient_id: r.recipient_id,
      recipient_type: r.recipient_type,
      amount: r.amount,
      percentage: r.percentage,
      description: r.description,
      paid: false as const,
    }))

  if (earningsRecords.length === 0) return

  const { error } = await supabase
    .from("earnings_breakdown")
    .insert(earningsRecords)

  if (error) {
    console.error("Error recording earnings:", error)
    throw error
  }
}

/**
 * Get earnings summary for a user (artist or partner)
 */
export async function getUserEarningsSummary(userId: string): Promise<{
  totalEarnings: number
  pendingEarnings: number
  paidEarnings: number
  earningsByDesign: { design_id: string; design_title: string; amount: number }[]
}> {
  const supabase = supabaseBrowser()

  const { data: earnings, error } = await supabase
    .from("earnings_breakdown")
    .select(`
      amount,
      paid,
      order_item:order_item_id(
        product_design:product_design_id(
          design:design_id(id, title)
        )
      )
    `)
    .eq("recipient_id", userId)

  if (error) {
    console.error("Error fetching earnings:", error)
    throw error
  }

  let totalEarnings = 0
  let pendingEarnings = 0
  let paidEarnings = 0
  const designEarnings: Record<string, { title: string; amount: number }> = {}

  earnings?.forEach((earning: any) => {
    const amount = earning.amount
    totalEarnings += amount

    if (!earning.paid) {
      pendingEarnings += amount
    } else if (earning.paid) {
      paidEarnings += amount
    }

    const designId = earning.order_item?.product_design?.design?.id
    const designTitle = earning.order_item?.product_design?.design?.title
    
    if (designId && designTitle) {
      if (!designEarnings[designId]) {
        designEarnings[designId] = { title: designTitle, amount: 0 }
      }
      designEarnings[designId].amount += amount
    }
  })

  return {
    totalEarnings,
    pendingEarnings,
    paidEarnings,
    earningsByDesign: Object.entries(designEarnings)
      .map(([design_id, data]) => ({
        design_id,
        design_title: data.title,
        amount: data.amount,
      }))
      .sort((a, b) => b.amount - a.amount),
  }
}

/**
 * Get deposit recoup status for a product design
 */
export async function getDepositRecoupStatus(
  productDesignId: string
): Promise<{
  depositAmount: number
  recoupEnabled: boolean
  recoupTargetSales: number
  currentSales: number
  recoupedAmount: number
  isRecoupComplete: boolean
}> {
  const supabase = supabaseBrowser()

  const { data: productDesign, error } = await supabase
    .from("product_designs")
    .select(`
      deposit_amount,
      deposit_recoup_enabled,
      deposit_recoup_sales_target,
      total_sales
    `)
    .eq("id", productDesignId)
    .single()

  if (error) {
    console.error("Error fetching deposit recoup status:", error)
    throw error
  }

  // Calculate recouped amount from earnings
  const { data: earnings } = await supabase
    .from("earnings_breakdown")
    .select("amount")
    .eq("order_item_id", productDesignId)
    .eq("recipient_type", "artist")
    .eq("description", "Deposit recoup")

  const recoupedAmount = earnings?.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0

  return {
    depositAmount: productDesign.deposit_amount || 0,
    recoupEnabled: productDesign.deposit_recoup_enabled || false,
    recoupTargetSales: productDesign.deposit_recoup_sales_target || 0,
    currentSales: productDesign.total_sales || 0,
    recoupedAmount,
    isRecoupComplete: recoupedAmount >= (productDesign.deposit_amount || 0),
  }
}
