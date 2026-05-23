import { supabaseBrowser } from "@/lib/supabase/client"

export type PartnershipCode = {
  id: string
  code: string
  design_id: string
  artist_id: string
  artist_share: number
  client_share: number
  studio_share: number
  client_name: string
  client_email: string
  tattoo_location?: string
  session_date?: string
  status: "active" | "pending" | "redeemed" | "expired"
  expires_at: string
  created_at: string
  redeemed_at?: string
  design?: {
    title: string
    images: string[]
  }
}

export type DesignPartnership = {
  id: string
  partnership_code_id: string
  partner_id: string
  design_id: string
  artist_share: number
  client_share: number
  studio_share: number
  verification_status: "pending" | "verified" | "rejected"
  verification_photo_url?: string
  verified_at?: string
  total_earnings: number
  created_at: string
  partner?: {
    display_name: string
    email: string
    avatar_url?: string
  }
  design?: {
    title: string
    images: string[]
  }
}

export type CreatePartnershipCodeInput = {
  design_id: string
  artist_share: number
  client_share: number
  studio_share: number
  client_name: string
  client_email: string
  tattoo_location?: string
  session_date?: string
}

// Generate a unique partnership code
function generatePartnershipCode(): string {
  const prefix = "INK"
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Excluding confusing chars
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  const year = new Date().getFullYear()
  return `${prefix}-${code.slice(0, 4)}-${year}-${code.slice(4, 8)}`
}

export async function createPartnershipCode(
  input: CreatePartnershipCodeInput
): Promise<PartnershipCode> {
  const supabase = supabaseBrowser()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Generate unique code
  const code = generatePartnershipCode()
  
  // Set expiration (30 days from now)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const { data, error } = await supabase
    .from("partnership_codes")
    .insert({
      code,
      design_id: input.design_id,
      artist_id: user.id,
      artist_share: input.artist_share,
      client_share: input.client_share,
      studio_share: input.studio_share,
      client_name: input.client_name,
      client_email: input.client_email,
      tattoo_location: input.tattoo_location,
      session_date: input.session_date,
      status: "active",
      expires_at: expiresAt.toISOString(),
    })
    .select(`
      *,
      design:design_id(title, images)
    `)
    .single()

  if (error) {
    console.error("Error creating partnership code:", error)
    throw error
  }

  return data
}

export async function getArtistPartnershipCodes(): Promise<PartnershipCode[]> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("partnership_codes")
    .select(`
      *,
      design:design_id(title, images)
    `)
    .eq("artist_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching partnership codes:", error)
    throw error
  }

  return data || []
}

export async function getPartnershipCodeByCode(code: string): Promise<PartnershipCode | null> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("partnership_codes")
    .select(`
      *,
      design:design_id(title, images)
    `)
    .eq("code", code)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Error fetching partnership code:", error)
    throw error
  }

  return data
}

export async function redeemPartnershipCode(
  code: string,
  verificationPhotoUrl?: string
): Promise<DesignPartnership> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Get the partnership code
  const { data: partnershipCode, error: codeError } = await supabase
    .from("partnership_codes")
    .select("*")
    .eq("code", code)
    .single()

  if (codeError || !partnershipCode) {
    throw new Error("Invalid partnership code")
  }

  if (partnershipCode.status !== "active") {
    throw new Error("Code is no longer active")
  }

  if (new Date(partnershipCode.expires_at) < new Date()) {
    // Update code to expired
    await supabase
      .from("partnership_codes")
      .update({ status: "expired" })
      .eq("id", partnershipCode.id)
    throw new Error("Code has expired")
  }

  // Check if user already has partnership for this design
  const { data: existingPartnership } = await supabase
    .from("design_partnerships")
    .select("id")
    .eq("partnership_code_id", partnershipCode.id)
    .eq("partner_id", user.id)
    .single()

  if (existingPartnership) {
    throw new Error("You have already redeemed this code")
  }

  // Create design partnership
  const { data: partnership, error: partnershipError } = await supabase
    .from("design_partnerships")
    .insert({
      partnership_code_id: partnershipCode.id,
      partner_id: user.id,
      design_id: partnershipCode.design_id,
      artist_share: partnershipCode.artist_share,
      client_share: partnershipCode.client_share,
      studio_share: partnershipCode.studio_share,
      verification_status: verificationPhotoUrl ? "pending" : "verified",
      verification_photo_url: verificationPhotoUrl,
      total_earnings: 0,
    })
    .select(`
      *,
      partner:partner_id(display_name, email, avatar_url),
      design:design_id(title, images)
    `)
    .single()

  if (partnershipError) {
    console.error("Error creating design partnership:", partnershipError)
    throw partnershipError
  }

  // Update code status to redeemed
  await supabase
    .from("partnership_codes")
    .update({
      status: "redeemed",
      redeemed_at: new Date().toISOString(),
    })
    .eq("id", partnershipCode.id)

  return partnership
}

export async function getUserPartnerships(): Promise<DesignPartnership[]> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("design_partnerships")
    .select(`
      *,
      partner:partner_id(display_name, email, avatar_url),
      design:design_id(title, images)
    `)
    .eq("partner_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user partnerships:", error)
    throw error
  }

  return data || []
}

export async function getPartnershipsForDesign(designId: string): Promise<DesignPartnership[]> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("design_partnerships")
    .select(`
      *,
      partner:partner_id(display_name, email, avatar_url),
      design:design_id(title, images)
    `)
    .eq("design_id", designId)
    .eq("verification_status", "verified")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching design partnerships:", error)
    throw error
  }

  return data || []
}

export async function verifyPartnership(
  partnershipId: string,
  status: "verified" | "rejected"
): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Verify the current user is the artist for this partnership
  const { data: partnership } = await supabase
    .from("design_partnerships")
    .select(`
      id,
      partnership_code:partnership_code_id(artist_id)
    `)
    .eq("id", partnershipId)
    .single()

  if (!partnership || partnership.partnership_code.artist_id !== user.id) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("design_partnerships")
    .update({
      verification_status: status,
      verified_at: status === "verified" ? new Date().toISOString() : null,
    })
    .eq("id", partnershipId)

  if (error) {
    console.error("Error verifying partnership:", error)
    throw error
  }
}

export type UpdatePartnershipCodeInput = {
  artist_share?: number
  client_share?: number
  studio_share?: number
  client_name?: string
  client_email?: string
  tattoo_location?: string
  session_date?: string
}

export async function updatePartnershipCode(
  codeId: string,
  input: UpdatePartnershipCodeInput
): Promise<PartnershipCode> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Verify ownership and status
  const { data: code } = await supabase
    .from("partnership_codes")
    .select("artist_id, status")
    .eq("id", codeId)
    .single()

  if (!code || code.artist_id !== user.id) {
    throw new Error("Unauthorized")
  }

  if (code.status === "redeemed") {
    throw new Error("Cannot modify a redeemed code")
  }

  // Validate shares if provided
  if (input.artist_share !== undefined || input.client_share !== undefined || input.studio_share !== undefined) {
    const { data: currentCode } = await supabase
      .from("partnership_codes")
      .select("artist_share, client_share, studio_share")
      .eq("id", codeId)
      .single()

    const newArtistShare = input.artist_share ?? currentCode?.artist_share ?? 50
    const newClientShare = input.client_share ?? currentCode?.client_share ?? 30
    const newStudioShare = input.studio_share ?? currentCode?.studio_share ?? 20

    if (newArtistShare + newClientShare + newStudioShare !== 100) {
      throw new Error("Shares must total 100%")
    }
  }

  const { data, error } = await supabase
    .from("partnership_codes")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", codeId)
    .select(`
      *,
      design:design_id(title, images)
    `)
    .single()

  if (error) {
    console.error("Error updating partnership code:", error)
    throw error
  }

  return data
}

export async function deletePartnershipCode(codeId: string): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Verify ownership
  const { data: code } = await supabase
    .from("partnership_codes")
    .select("artist_id, status")
    .eq("id", codeId)
    .single()

  if (!code || code.artist_id !== user.id) {
    throw new Error("Unauthorized")
  }

  if (code.status === "redeemed") {
    throw new Error("Cannot delete a redeemed code")
  }

  const { error } = await supabase
    .from("partnership_codes")
    .delete()
    .eq("id", codeId)

  if (error) {
    console.error("Error deleting partnership code:", error)
    throw error
  }
}
