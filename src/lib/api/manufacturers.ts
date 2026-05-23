"use client"

import { supabaseBrowser } from "@/lib/supabase/client"

export type ManufacturerSpecialty = 
  | "screen_printing"
  | "dtg"              // Direct-to-garment
  | "embroidery"
  | "sublimation"
  | "cut_and_sew"
  | "all_over_print"
  | "specialty_finishes"

export type ManufacturerCertification =
  | "organic_certified"
  | "fair_trade"
  | "carbon_neutral"
  | "usa_made"
  | "small_batch"
  | "vegan"

export type ManufacturerCapacity = {
  daily_units: number
  current_load: number
  max_order_size: number
  min_order_size: number
  lead_time_days: number
  rush_available: boolean
  rush_lead_time_days?: number
  rush_surcharge_percent: number
}

export type ManufacturerRating = {
  overall: number
  quality: number
  communication: number
  turnaround: number
  value: number
  total_reviews: number
}

export type Manufacturer = {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  logo_url?: string
  banner_url?: string
  website?: string
  location: {
    city: string
    state?: string
    country: string
    timezone: string
  }
  specialties: ManufacturerSpecialty[]
  certifications: ManufacturerCertification[]
  capacity: ManufacturerCapacity
  rating: ManufacturerRating
  base_pricing: {
    tshirt: number
    longsleeve: number
    hoodie: number
    tank: number
    crewneck: number
    [key: string]: number
  }
  shipping_options: {
    domestic: boolean
    international: boolean
    express_available: boolean
  }
  portfolio_images?: string[]
  is_verified: boolean
  is_active: boolean
  created_at: string
}

export type JobRequest = {
  id: string
  manufacturer_id: string
  artist_id: string
  garment_id: string
  status: "pending" | "quoted" | "accepted" | "in_production" | "shipped" | "delivered" | "cancelled"
  quantity: number
  unit_price: number
  total_price: number
  shipping_cost: number
  turnaround_days: number
  artwork_url: string
  mockup_url: string
  special_instructions?: string
  manufacturer_notes?: string
  estimated_completion?: string
  shipped_at?: string
  tracking_number?: string
  created_at: string
  updated_at: string
  manufacturer?: Manufacturer
}

// Get all active manufacturers
export async function getManufacturers(
  options?: {
    specialty?: ManufacturerSpecialty
    country?: string
    verifiedOnly?: boolean
    hasCapacity?: boolean
    limit?: number
  }
): Promise<Manufacturer[]> {
  const supabase = supabaseBrowser()

  let query = supabase
    .from("manufacturers")
    .select("*")
    .eq("is_active", true)

  if (options?.specialty) {
    query = query.contains("specialties", [options.specialty])
  }

  if (options?.country) {
    query = query.eq("location->>country", options.country)
  }

  if (options?.verifiedOnly) {
    query = query.eq("is_verified", true)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
    .order("rating->>overall", { ascending: false })

  if (error) {
    console.error("Error fetching manufacturers:", error)
    throw error
  }

  // Filter by capacity if requested
  let manufacturers = data || []
  if (options?.hasCapacity) {
    manufacturers = manufacturers.filter(
      (m: { capacity: { current_load: number; daily_units: number } }) => m.capacity.current_load < m.capacity.daily_units * 7 // Has capacity within a week
    )
  }

  return manufacturers
}

// Get manufacturer by ID
export async function getManufacturerById(id: string): Promise<Manufacturer | null> {
  const supabase = supabaseBrowser()

  const { data, error } = await supabase
    .from("manufacturers")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Error fetching manufacturer:", error)
    throw error
  }

  return data
}

// Get manufacturer by slug
export async function getManufacturerBySlug(slug: string): Promise<Manufacturer | null> {
  const supabase = supabaseBrowser()

  const { data, error } = await supabase
    .from("manufacturers")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Error fetching manufacturer:", error)
    throw error
  }

  return data
}

// Match manufacturer to job requirements
export async function matchManufacturers(
  requirements: {
    garmentType: string
    quantity: number
    specialty?: ManufacturerSpecialty
    certifications?: ManufacturerCertification[]
    country?: string
    rush?: boolean
  }
): Promise<{ manufacturer: Manufacturer; matchScore: number; reasons: string[] }[]> {
  const supabase = supabaseBrowser()

  const { data: manufacturers, error } = await supabase
    .from("manufacturers")
    .select("*")
    .eq("is_active", true)

  if (error) {
    console.error("Error fetching manufacturers for matching:", error)
    throw error
  }

  const matches = (manufacturers || []).map((m: { 
    base_pricing: Record<string, number>; 
    capacity: { 
      min_order_size: number; 
      max_order_size: number; 
      rush_available: boolean;
      current_load: number;
      daily_units: number;
    }; 
    specialties: string[]; 
    lead_times: { standard: number }; 
    rating: { overall: number };
    certifications: string[];
    location: { country: string };
  }) => {
    const reasons: string[] = []
    let score = 0

    // Base pricing match
    const basePrice = m.base_pricing[requirements.garmentType.toLowerCase()]
    if (basePrice) {
      score += 20
      reasons.push(`Specializes in ${requirements.garmentType}`)
    }

    // Capacity match
    if (requirements.quantity >= m.capacity.min_order_size &&
        requirements.quantity <= m.capacity.max_order_size) {
      score += 25
      reasons.push(`Handles ${requirements.quantity} unit orders`)
    }

    // Specialty match
    if (requirements.specialty && m.specialties.includes(requirements.specialty)) {
      score += 20
      reasons.push(`Expert in ${requirements.specialty.replace("_", " ")}`)
    }

    // Certification match
    if (requirements.certifications) {
      const certMatches = requirements.certifications.filter(c => 
        m.certifications.includes(c)
      ).length
      if (certMatches > 0) {
        score += certMatches * 5
        reasons.push(`${certMatches} matching certifications`)
      }
    }

    // Location match
    if (requirements.country && m.location.country === requirements.country) {
      score += 15
      reasons.push(`Located in ${requirements.country}`)
    }

    // Rush capability
    if (requirements.rush && m.capacity.rush_available) {
      score += 10
      reasons.push("Rush orders available")
    }

    // Rating bonus
    score += m.rating.overall * 5

    // Capacity penalty
    const capacityRatio = m.capacity.current_load / m.capacity.daily_units
    if (capacityRatio > 0.8) {
      score -= 10
      reasons.push("Currently busy (longer lead time)")
    }

    return {
      manufacturer: m,
      matchScore: Math.max(0, Math.round(score)),
      reasons,
    }
  })

  return matches.sort((a: { matchScore: number }, b: { matchScore: number }) => b.matchScore - a.matchScore)
}

// Request quote from manufacturer
export async function requestQuote(
  manufacturerId: string,
  garmentId: string,
  quantity: number,
  options?: {
    rush?: boolean
    specialInstructions?: string
    artworkUrl?: string
    mockupUrl?: string
  }
): Promise<JobRequest> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("job_requests")
    .insert({
      manufacturer_id: manufacturerId,
      artist_id: user.id,
      garment_id: garmentId,
      status: "pending",
      quantity,
      special_instructions: options?.specialInstructions,
      artwork_url: options?.artworkUrl,
      mockup_url: options?.mockupUrl,
    })
    .select()
    .single()

  if (error) {
    console.error("Error requesting quote:", error)
    throw error
  }

  // Notify manufacturer
  await supabase.from("notifications").insert({
    user_id: manufacturerId, // Assuming manufacturer has a user account
    type: "manufacturer_update",
    title: "New Quote Request",
    message: `Artist is requesting a quote for ${quantity} units`,
    priority: "normal",
    action_url: `/manufacturer/dashboard/jobs/${data.id}`,
    action_text: "Review Request",
    metadata: {
      job_request_id: data.id,
      garment_id: garmentId,
      artist_id: user.id,
      quantity,
    },
  })

  return data
}

// Get job requests for artist
export async function getArtistJobRequests(
  options?: {
    status?: JobRequest["status"]
    limit?: number
  }
): Promise<JobRequest[]> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  let query = supabase
    .from("job_requests")
    .select("*, manufacturer:manufacturers(*)")
    .eq("artist_id", user.id)
    .order("created_at", { ascending: false })

  if (options?.status) {
    query = query.eq("status", options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching job requests:", error)
    throw error
  }

  return data || []
}

// Get job requests for manufacturer
export async function getManufacturerJobRequests(
  manufacturerId: string,
  options?: {
    status?: JobRequest["status"]
    limit?: number
  }
): Promise<JobRequest[]> {
  const supabase = supabaseBrowser()

  let query = supabase
    .from("job_requests")
    .select("*")
    .eq("manufacturer_id", manufacturerId)
    .order("created_at", { ascending: false })

  if (options?.status) {
    query = query.eq("status", options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching manufacturer job requests:", error)
    throw error
  }

  return data || []
}

// Submit quote (manufacturer)
export async function submitQuote(
  jobRequestId: string,
  quote: {
    unitPrice: number
    shippingCost: number
    turnaroundDays: number
    notes?: string
  }
): Promise<JobRequest> {
  const supabase = supabaseBrowser()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: jobRequest } = await supabase
    .from("job_requests")
    .select("quantity, artist_id")
    .eq("id", jobRequestId)
    .single()

  const totalPrice = quote.unitPrice * jobRequest.quantity

  const { data, error } = await supabase
    .from("job_requests")
    .update({
      status: "quoted",
      unit_price: quote.unitPrice,
      total_price: totalPrice,
      shipping_cost: quote.shippingCost,
      turnaround_days: quote.turnaroundDays,
      manufacturer_notes: quote.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobRequestId)
    .select()
    .single()

  if (error) {
    console.error("Error submitting quote:", error)
    throw error
  }

  // Notify artist
  await supabase.from("notifications").insert({
    user_id: jobRequest.artist_id,
    type: "manufacturer_update",
    title: "Quote Received",
    message: `Manufacturer quoted $${(totalPrice / 100).toFixed(2)} for your job`,
    priority: "normal",
    action_url: `/artist/dashboard/garments/quotes/${jobRequestId}`,
    action_text: "Review Quote",
    metadata: {
      job_request_id: jobRequestId,
      quote_amount: totalPrice,
    },
  })

  return data
}

// Accept/reject quote (artist)
export async function respondToQuote(
  jobRequestId: string,
  accept: boolean,
  reason?: string
): Promise<JobRequest> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: jobRequest } = await supabase
    .from("job_requests")
    .select("manufacturer_id")
    .eq("id", jobRequestId)
    .single()

  const newStatus = accept ? "accepted" : "cancelled"

  const { data, error } = await supabase
    .from("job_requests")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobRequestId)
    .select()
    .single()

  if (error) {
    console.error("Error responding to quote:", error)
    throw error
  }

  // Notify manufacturer
  await supabase.from("notifications").insert({
    user_id: jobRequest.manufacturer_id,
    type: "manufacturer_update",
    title: accept ? "Quote Accepted" : "Quote Declined",
    message: accept 
      ? "Artist accepted your quote. Job is now in production queue."
      : `Artist declined your quote${reason ? `: ${reason}` : ""}`,
    priority: accept ? "high" : "normal",
    action_url: `/manufacturer/dashboard/jobs/${jobRequestId}`,
    action_text: "View Job",
    metadata: {
      job_request_id: jobRequestId,
      accepted: accept,
    },
  })

  return data
}

// Update job status (manufacturer)
export async function updateJobStatus(
  jobRequestId: string,
  status: JobRequest["status"],
  updates?: {
    trackingNumber?: string
    estimatedCompletion?: string
    notes?: string
  }
): Promise<JobRequest> {
  const supabase = supabaseBrowser()

  const { data: jobRequest } = await supabase
    .from("job_requests")
    .select("artist_id, status")
    .eq("id", jobRequestId)
    .single()

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === "shipped") {
    updateData.shipped_at = new Date().toISOString()
    updateData.tracking_number = updates?.trackingNumber
  }

  if (updates?.estimatedCompletion) {
    updateData.estimated_completion = updates.estimatedCompletion
  }

  if (updates?.notes) {
    updateData.manufacturer_notes = updates.notes
  }

  const { data, error } = await supabase
    .from("job_requests")
    .update(updateData)
    .eq("id", jobRequestId)
    .select()
    .single()

  if (error) {
    console.error("Error updating job status:", error)
    throw error
  }

  // Map status to notification
  const statusMessages: Record<string, { title: string; message: string }> = {
    in_production: {
      title: "Production Started",
      message: "Your garment is now in production",
    },
    shipped: {
      title: "Order Shipped",
      message: updates?.trackingNumber 
        ? `Tracking: ${updates.trackingNumber}`
        : "Your order has shipped",
    },
    delivered: {
      title: "Order Delivered",
      message: "Your order has been delivered",
    },
  }

  const msg = statusMessages[status]
  if (msg) {
    await supabase.from("notifications").insert({
      user_id: jobRequest.artist_id,
      type: "manufacturer_update",
      title: msg.title,
      message: msg.message,
      priority: status === "shipped" ? "high" : "normal",
      action_url: `/artist/dashboard/orders/${jobRequestId}`,
      action_text: "Track Order",
      metadata: {
        job_request_id: jobRequestId,
        status,
        tracking_number: updates?.trackingNumber,
      },
    })
  }

  return data
}
