import { supabaseBrowser } from "@/lib/supabase/client"

export type Referral = {
  id: string
  referrer_id: string
  referred_artist_id: string
  referral_code: string
  status: "pending" | "completed" | "expired"
  commission_rate: number
  commission_duration_months: number
  total_sales_generated: number
  total_commission_paid: number
  created_at: string
  artist_approved_at: string | null
  expires_at: string | null
  referred_artist?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
}

export type ReferralEarning = {
  id: string
  referral_id: string
  order_item_id: string
  sale_amount: number
  commission_amount: number
  status: "pending" | "paid" | "cancelled"
  paid_at: string | null
  created_at: string
  order?: {
    order_number: string
    created_at: string
  }
  product_design?: {
    design: {
      title: string
    }
  }
}

export async function getMyReferrals(): Promise<Referral[]> {
  const supabase = supabaseBrowser()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error("Not authenticated")
  
  const { data, error } = await supabase
    .from("referrals")
    .select(`
      *,
      referred_artist:referred_artist_id(id, display_name, avatar_url)
    `)
    .eq("referrer_id", userData.user.id)
    .order("created_at", { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getMyReferralEarnings(): Promise<ReferralEarning[]> {
  const supabase = supabaseBrowser()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error("Not authenticated")
  
  const { data, error } = await supabase
    .from("referral_earnings")
    .select(`
      *,
      referral:referral_id(referrer_id),
      order_item:order_item_id(
        order:order_id(order_number, created_at),
        product_design:product_design_id(
          design:design_id(title)
        )
      )
    `)
    .eq("referral.referrer_id", userData.user.id)
    .order("created_at", { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getReferralStats(): Promise<{
  total_referrals: number
  active_referrals: number
  total_earnings: number
  pending_earnings: number
}> {
  const supabase = supabaseBrowser()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { total_referrals: 0, active_referrals: 0, total_earnings: 0, pending_earnings: 0 }
  }
  
  const { data, error } = await supabase
    .from("referrals")
    .select("status, total_commission_paid")
    .eq("referrer_id", userData.user.id)
  
  if (error) throw error
  
  const referrals = data || []
  
  // Get pending earnings
  const { data: pendingData } = await supabase
    .from("referral_earnings")
    .select("commission_amount")
    .eq("status", "pending")
    .eq("referral.referrer_id", userData.user.id)
  
  const pendingEarnings = (pendingData || []).reduce((sum: number, e: { commission_amount: number }) => sum + e.commission_amount, 0)
  
  return {
    total_referrals: referrals.length,
    active_referrals: referrals.filter((r: { status: string; expires_at: string | null }) => r.status === "completed" && !r.expires_at).length,
    total_earnings: referrals.reduce((sum: number, r: { total_commission_paid: number }) => sum + r.total_commission_paid, 0),
    pending_earnings: pendingEarnings,
  }
}

export async function getMyReferralCode(): Promise<string | null> {
  const supabase = supabaseBrowser()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null
  
  const { data, error } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", userData.user.id)
    .single()
  
  if (error) throw error
  return data?.referral_code || null
}

// Calculate revenue split including referral commission
export function calculateRevenueSplit(
  saleAmount: number,
  hasReferral: boolean,
  commissionRate: number = 0.05
): {
  platform: number
  artist: number
  referrer: number
  manufacturing: number
} {
  const platformFee = Math.round(saleAmount * 0.15) // 15% platform fee
  const referrerCommission = hasReferral 
    ? Math.round(saleAmount * commissionRate) 
    : 0
  const manufacturing = Math.round(saleAmount * 0.25) // 25% manufacturing
  const artist = saleAmount - platformFee - referrerCommission - manufacturing
  
  return {
    platform: platformFee,
    artist: Math.max(0, artist),
    referrer: referrerCommission,
    manufacturing,
  }
}

// Check if artist has active referral
export async function getArtistReferralInfo(artistId: string): Promise<{
  has_referral: boolean
  referrer_id: string | null
  commission_rate: number
  expires_at: string | null
} | null> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("referrals")
    .select("referrer_id, commission_rate, expires_at")
    .eq("referred_artist_id", artistId)
    .eq("status", "completed")
    .gt("expires_at", new Date().toISOString())
    .single()
  
  if (error && error.code !== "PGRST116") throw error
  
  if (!data) return null
  
  return {
    has_referral: true,
    referrer_id: data.referrer_id,
    commission_rate: data.commission_rate,
    expires_at: data.expires_at,
  }
}
