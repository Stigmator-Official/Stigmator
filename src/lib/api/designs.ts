import { supabaseBrowser } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"

export type Design = {
  id: string
  artist_id: string
  studio_id: string | null
  title: string
  description: string | null
  images: string[]
  tags: string[]
  style_tags: string[]
  is_original_flash: boolean
  is_exclusive: boolean
  created_at: string
  updated_at: string
  artist?: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

export async function getDesigns(): Promise<Design[]> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("designs")
    .select(`
      *,
      artist:artist_id(id, display_name, avatar_url)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    logger.error("Error fetching designs:", error)
    throw error
  }

  return data || []
}

export async function getDesignsByArtist(artistId: string): Promise<Design[]> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("designs")
    .select("*")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false })

  if (error) {
    logger.error("Error fetching artist designs:", error)
    throw error
  }

  return data || []
}

export async function getDesignById(id: string): Promise<Design | null> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("designs")
    .select(`
      *,
      artist:artist_id(id, display_name, avatar_url)
    `)
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    logger.error("Error fetching design:", error)
    throw error
  }

  return data
}

export type CreateDesignInput = {
  title: string
  description?: string
  images: string[]
  tags?: string[]
  style_tags?: string[]
  is_original_flash?: boolean
}

export async function createDesign(input: CreateDesignInput): Promise<Design> {
  const supabase = supabaseBrowser()
  
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("Must be logged in to create a design")
  }

  const { data, error } = await supabase
    .from("designs")
    .insert({
      artist_id: userData.user.id,
      title: input.title,
      description: input.description || null,
      images: input.images,
      tags: input.tags || [],
      style_tags: input.style_tags || [],
      is_original_flash: input.is_original_flash || false,
      is_exclusive: false,
    })
    .select()
    .single()

  if (error) {
    logger.error("Error creating design:", error)
    throw error
  }

  return data
}

export async function updateDesign(
  id: string, 
  input: Partial<CreateDesignInput>
): Promise<Design> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("designs")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    logger.error("Error updating design:", error)
    throw error
  }

  return data
}

export async function deleteDesign(id: string): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { error } = await supabase
    .from("designs")
    .delete()
    .eq("id", id)

  if (error) {
    logger.error("Error deleting design:", error)
    throw error
  }
}
