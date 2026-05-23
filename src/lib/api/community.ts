"use client"

import { supabaseBrowser } from "@/lib/supabase/client"

// ============ FOLLOWS ============

export type Follow = {
  id: string
  follower_id: string
  following_id: string
  following_type: "artist" | "design" | "collection" | "style"
  created_at: string
  following?: {
    id: string
    display_name: string
    avatar_url?: string
    bio?: string
  }
}

export async function follow(
  targetId: string,
  targetType: Follow["following_type"]
): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("follows")
    .insert({
      follower_id: user.id,
      following_id: targetId,
      following_type: targetType,
    })

  if (error) {
    if (error.code === "23505") return // Already following
    console.error("Error following:", error)
    throw error
  }

  // Notify if following an artist
  if (targetType === "artist") {
    await supabase.from("notifications").insert({
      user_id: targetId,
      type: "follow",
      title: "New Follower",
      message: "Someone started following you",
      priority: "low",
      action_url: `/artists/${user.id}`,
      metadata: {
        follower_id: user.id,
      },
    })
  }
}

export async function unfollow(
  targetId: string,
  targetType: Follow["following_type"]
): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetId)
    .eq("following_type", targetType)

  if (error) {
    console.error("Error unfollowing:", error)
    throw error
  }
}

export async function isFollowing(
  targetId: string,
  targetType: Follow["following_type"]
): Promise<boolean> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetId)
    .eq("following_type", targetType)
    .maybeSingle()

  if (error) {
    console.error("Error checking follow status:", error)
    return false
  }

  return !!data
}

export async function getFollowers(userId: string): Promise<Follow[]> {
  const supabase = supabaseBrowser()

  const { data, error } = await supabase
    .from("follows")
    .select(`*, follower:profiles!follower_id(id, display_name, avatar_url)`)
    .eq("following_id", userId)
    .eq("following_type", "artist")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching followers:", error)
    throw error
  }

  return data || []
}

export async function getFollowing(userId: string): Promise<Follow[]> {
  const supabase = supabaseBrowser()

  const { data, error } = await supabase
    .from("follows")
    .select(`*, following:profiles!following_id(id, display_name, avatar_url, bio)`)
    .eq("follower_id", userId)
    .eq("following_type", "artist")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching following:", error)
    throw error
  }

  return data || []
}

// ============ FAVORITES/COLLECTIONS ============

export type Favorite = {
  id: string
  user_id: string
  design_id: string
  collection_id?: string
  created_at: string
  design?: {
    id: string
    title: string
    images: string[]
    artist: {
      id: string
      display_name: string
      avatar_url?: string
    }
  }
}

export type Collection = {
  id: string
  user_id: string
  name: string
  description?: string
  is_public: boolean
  cover_image?: string
  item_count: number
  created_at: string
  updated_at: string
}

export async function addToFavorites(
  designId: string,
  collectionId?: string
): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("favorites")
    .insert({
      user_id: user.id,
      design_id: designId,
      collection_id: collectionId,
    })

  if (error) {
    if (error.code === "23505") return // Already favorited
    console.error("Error adding favorite:", error)
    throw error
  }
}

export async function removeFromFavorites(designId: string): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("design_id", designId)

  if (error) {
    console.error("Error removing favorite:", error)
    throw error
  }
}

export async function getFavorites(): Promise<Favorite[]> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      *,
      design:designs(id, title, images, artist:artist_id(id, display_name, avatar_url))
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching favorites:", error)
    throw error
  }

  return data || []
}

export async function createCollection(
  name: string,
  options?: {
    description?: string
    isPublic?: boolean
  }
): Promise<Collection> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id: user.id,
      name,
      description: options?.description,
      is_public: options?.isPublic ?? true,
      item_count: 0,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating collection:", error)
    throw error
  }

  return data
}

export async function getCollections(
  userId?: string,
  options?: { publicOnly?: boolean }
): Promise<Collection[]> {
  const supabase = supabaseBrowser()

  let query = supabase
    .from("collections")
    .select("*")

  if (userId) {
    query = query.eq("user_id", userId)
  }

  if (options?.publicOnly) {
    query = query.eq("is_public", true)
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching collections:", error)
    throw error
  }

  return data || []
}

// ============ FRESH DROPS (Artist Releases) ============

export type FreshDrop = {
  id: string
  artist_id: string
  title: string
  description: string
  cover_image: string
  garment_ids: string[]
  drop_date: string
  is_featured: boolean
  created_at: string
  artist?: {
    id: string
    display_name: string
    avatar_url?: string
    location?: string
  }
  garments?: {
    id: string
    name: string
    price: number
    mockup_image: string
    is_limited: boolean
    remaining?: number
  }[]
}

export async function getFreshDrops(
  options?: {
    featured?: boolean
    limit?: number
    followingOnly?: boolean
  }
): Promise<FreshDrop[]> {
  const supabase = supabaseBrowser()

  let query = supabase
    .from("fresh_drops")
    .select(`
      *,
      artist:artist_id(id, display_name, avatar_url, location),
      garments:garments(id, name, price, mockup_images, is_limited, limited_quantity)
    `)

  if (options?.featured) {
    query = query.eq("is_featured", true)
  }

  // If following only, filter by follows
  if (options?.followingOnly) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id)
        .eq("following_type", "artist")

      const artistIds = follows?.map((f: { following_id: string }) => f.following_id) || []
      if (artistIds.length > 0) {
        query = query.in("artist_id", artistIds)
      } else {
        return []
      }
    }
  }

  query = query
    .lte("drop_date", new Date().toISOString())
    .order("drop_date", { ascending: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching fresh drops:", error)
    throw error
  }

  return (data || []).map((drop: any) => ({
    ...drop,
    garments: drop.garments?.map((g: any) => ({
      ...g,
      mockup_image: g.mockup_images?.[0],
      remaining: g.is_limited ? g.limited_quantity : undefined,
    })),
  }))
}

// ============ WORN ART (Customer Showcases) ============

export type WornArt = {
  id: string
  user_id: string
  design_id: string
  garment_id: string
  image_url: string
  caption?: string
  tags: string[]
  likes_count: number
  comments_count: number
  is_featured: boolean
  created_at: string
  user?: {
    id: string
    display_name: string
    avatar_url?: string
  }
  design?: {
    id: string
    title: string
    artist: {
      id: string
      display_name: string
    }
  }
  garment?: {
    id: string
    name: string
  }
}

export async function submitWornArt(
  input: {
    designId: string
    garmentId: string
    imageFile: File
    caption?: string
    tags?: string[]
  }
): Promise<WornArt> {
  const supabase = supabaseBrowser()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Upload image
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("worn-art")
    .upload(`${user.id}/${Date.now()}_${input.imageFile.name}`, input.imageFile)

  if (uploadError) {
    console.error("Error uploading image:", uploadError)
    throw uploadError
  }

  const { data: urlData } = supabase.storage
    .from("worn-art")
    .getPublicUrl(uploadData.path)

  // Create worn art entry
  const { data, error } = await supabase
    .from("worn_art")
    .insert({
      user_id: user.id,
      design_id: input.designId,
      garment_id: input.garmentId,
      image_url: urlData.publicUrl,
      caption: input.caption,
      tags: input.tags || [],
    })
    .select()
    .single()

  if (error) {
    console.error("Error submitting worn art:", error)
    throw error
  }

  // Notify artist
  const { data: design } = await supabase
    .from("designs")
    .select("artist_id, title")
    .eq("id", input.designId)
    .single()

  if (design) {
    await supabase.from("notifications").insert({
      user_id: design.artist_id,
      type: "community_updates",
      title: "Your Design Was Showcased",
      message: `Someone shared a photo wearing "${design.title}"`,
      priority: "normal",
      action_url: `/community/worn-art/${data.id}`,
      metadata: {
        worn_art_id: data.id,
        design_id: input.designId,
      },
    })
  }

  return data
}

export async function getWornArt(
  options?: {
    designId?: string
    artistId?: string
    featured?: boolean
    limit?: number
  }
): Promise<WornArt[]> {
  const supabase = supabaseBrowser()

  let query = supabase
    .from("worn_art")
    .select(`
      *,
      user:user_id(id, display_name, avatar_url),
      design:design_id(id, title, artist:artist_id(id, display_name)),
      garment:garment_id(id, name)
    `)

  if (options?.designId) {
    query = query.eq("design_id", options.designId)
  }

  if (options?.artistId) {
    query = query.eq("design.artist_id", options.artistId)
  }

  if (options?.featured) {
    query = query.eq("is_featured", true)
  }

  query = query.order("created_at", { ascending: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching worn art:", error)
    throw error
  }

  return data || []
}

// ============ ARTIST SPOTLIGHT ============

export type ArtistSpotlight = {
  id: string
  artist_id: string
  interview_content: string
  featured_designs: string[]
  video_url?: string
  published_at: string
  read_time: number
  artist?: {
    id: string
    display_name: string
    avatar_url?: string
    bio?: string
    location?: string
    total_sales: number
    total_designs: number
  }
}

export async function getArtistSpotlights(
  options?: { limit?: number }
): Promise<ArtistSpotlight[]> {
  const supabase = supabaseBrowser()

  const { data, error } = await supabase
    .from("artist_spotlights")
    .select(`
      *,
      artist:artist_id(id, display_name, avatar_url, bio, location, total_sales, total_designs)
    `)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(options?.limit || 10)

  if (error) {
    console.error("Error fetching spotlights:", error)
    throw error
  }

  return data || []
}

// ============ STYLE DISCOVERY ============

export type TattooStyle = {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  artist_count: number
  design_count: number
  featured_artists?: string[]
}

export async function getTattooStyles(): Promise<TattooStyle[]> {
  const supabase = supabaseBrowser()

  const { data, error } = await supabase
    .from("tattoo_styles")
    .select("*")
    .order("name")

  if (error) {
    console.error("Error fetching tattoo styles:", error)
    throw error
  }

  return data || []
}

export async function getStyleDiscovery(
  styleSlug: string
): Promise<{
  style: TattooStyle
  featuredArtists: any[]
  trendingDesigns: any[]
  freshDrops: FreshDrop[]
} | null> {
  const supabase = supabaseBrowser()

  const { data: style, error } = await supabase
    .from("tattoo_styles")
    .select("*")
    .eq("slug", styleSlug)
    .single()

  if (error || !style) return null

  // Get featured artists for this style
  const { data: artists } = await supabase
    .from("artist_profiles")
    .select(`
      *,
      user:user_id(id, display_name, avatar_url, location)
    `)
    .contains("specialties", [style.name])
    .limit(6)

  // Get trending designs
  const { data: designs } = await supabase
    .from("designs")
    .select(`
      *,
      artist:artist_id(id, display_name, avatar_url)
    `)
    .eq("style", style.name)
    .eq("is_active", true)
    .order("total_sales", { ascending: false })
    .limit(8)

  // Get fresh drops
  const freshDrops = await getFreshDrops({ limit: 4 })

  return {
    style,
    featuredArtists: artists || [],
    trendingDesigns: designs || [],
    freshDrops,
  }
}
