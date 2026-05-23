"use client"

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { supabaseBrowser } from "@/lib/supabase/client"
import type { GarmentType } from "@/lib/mockup/types"

// ============================================================================
// Types
// ============================================================================

export interface DesignTransform {
  position: { x: number; y: number }
  scale: number
  rotation: number
}

export interface CameraAngle {
  theta: number
  phi: number
  zoom: number
}

export interface Preset {
  id: string
  name: string
  description: string | null
  tags: string[]
  garmentType: GarmentType
  variantId: string
  colorHex: string
  fabricType: string
  designFileId: string | null
  designTransform: DesignTransform
  printArea: string
  cameraAngle: CameraAngle
  lightingPreset: string
  isDefault: boolean
  isPublic: boolean
  artistId: string
  thumbnailUrl: string | null
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface PresetInput {
  name: string
  description?: string
  tags?: string[]
  garmentType: GarmentType
  variantId: string
  colorHex: string
  fabricType: string
  designFileId?: string
  designTransform: DesignTransform
  printArea: string
  cameraAngle: CameraAngle
  lightingPreset: string
  isDefault?: boolean
  isPublic?: boolean
}

export interface PresetFilters {
  publicOnly?: boolean
  tags?: string[]
  artistId?: string
  searchQuery?: string
}

// ============================================================================
// Query Functions
// ============================================================================

async function fetchPresets(filters: PresetFilters = {}): Promise<Preset[]> {
  const supabase = supabaseBrowser()
  
  let query = supabase
    .from("mockup_presets")
    .select("*")
    .order("updated_at", { ascending: false })

  if (filters.publicOnly) {
    query = query.eq("is_public", true)
  }

  if (filters.artistId) {
    query = query.eq("artist_id", filters.artistId)
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.contains("tags", filters.tags)
  }

  if (filters.searchQuery) {
    query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching presets:", error)
    throw error
  }

  return (data || []).map(transformPresetFromDB)
}

async function fetchPreset(presetId: string): Promise<Preset | null> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("mockup_presets")
    .select("*")
    .eq("id", presetId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Error fetching preset:", error)
    throw error
  }

  return data ? transformPresetFromDB(data) : null
}

async function fetchPresetsByGarment(garmentType: GarmentType): Promise<Preset[]> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("mockup_presets")
    .select("*")
    .eq("garment_type", garmentType)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching presets by garment:", error)
    throw error
  }

  return (data || []).map(transformPresetFromDB)
}

async function fetchDefaultPreset(): Promise<Preset | null> {
  const supabase = supabaseBrowser()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  const { data, error } = await supabase
    .from("mockup_presets")
    .select("*")
    .eq("artist_id", userData.user.id)
    .eq("is_default", true)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Error fetching default preset:", error)
    throw error
  }

  return data ? transformPresetFromDB(data) : null
}

// ============================================================================
// Mutation Functions
// ============================================================================

async function createPreset(input: PresetInput): Promise<Preset> {
  const supabase = supabaseBrowser()
  
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("Must be logged in to create a preset")
  }

  // If setting as default, unset existing default first
  if (input.isDefault) {
    await supabase
      .from("mockup_presets")
      .update({ is_default: false })
      .eq("artist_id", userData.user.id)
      .eq("is_default", true)
  }

  const { data, error } = await supabase
    .from("mockup_presets")
    .insert({
      artist_id: userData.user.id,
      name: input.name,
      description: input.description || null,
      tags: input.tags || [],
      garment_type: input.garmentType,
      variant_id: input.variantId,
      color_hex: input.colorHex,
      fabric_type: input.fabricType,
      design_file_id: input.designFileId || null,
      design_transform: input.designTransform as unknown as Record<string, unknown>,
      print_area: input.printArea,
      camera_angle: input.cameraAngle as unknown as Record<string, unknown>,
      lighting_preset: input.lightingPreset,
      is_default: input.isDefault || false,
      is_public: input.isPublic || false,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating preset:", error)
    throw error
  }

  return transformPresetFromDB(data)
}

async function updatePreset({ 
  id, 
  updates 
}: { 
  id: string
  updates: Partial<PresetInput> 
}): Promise<Preset> {
  const supabase = supabaseBrowser()
  
  // If setting as default, unset existing default first
  if (updates.isDefault) {
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      await supabase
        .from("mockup_presets")
        .update({ is_default: false })
        .eq("artist_id", userData.user.id)
        .eq("is_default", true)
    }
  }

  const dbUpdates: Record<string, unknown> = {}
  
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags
  if (updates.garmentType !== undefined) dbUpdates.garment_type = updates.garmentType
  if (updates.variantId !== undefined) dbUpdates.variant_id = updates.variantId
  if (updates.colorHex !== undefined) dbUpdates.color_hex = updates.colorHex
  if (updates.fabricType !== undefined) dbUpdates.fabric_type = updates.fabricType
  if (updates.designFileId !== undefined) dbUpdates.design_file_id = updates.designFileId
  if (updates.designTransform !== undefined) dbUpdates.design_transform = updates.designTransform as unknown as Record<string, unknown>
  if (updates.printArea !== undefined) dbUpdates.print_area = updates.printArea
  if (updates.cameraAngle !== undefined) dbUpdates.camera_angle = updates.cameraAngle as unknown as Record<string, unknown>
  if (updates.lightingPreset !== undefined) dbUpdates.lighting_preset = updates.lightingPreset
  if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault
  if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic

  const { data, error } = await supabase
    .from("mockup_presets")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating preset:", error)
    throw error
  }

  return transformPresetFromDB(data)
}

async function deletePreset(id: string): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { error } = await supabase
    .from("mockup_presets")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting preset:", error)
    throw error
  }
}

async function duplicatePreset(id: string): Promise<Preset> {
  const supabase = supabaseBrowser()
  
  // Fetch the original preset
  const { data: original, error: fetchError } = await supabase
    .from("mockup_presets")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError || !original) {
    throw new Error("Preset not found")
  }

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error("Must be logged in to duplicate a preset")
  }

  // Create a copy with modified name
  const { data, error } = await supabase
    .from("mockup_presets")
    .insert({
      ...original,
      id: undefined, // Let Supabase generate new ID
      name: `${original.name} (Copy)`,
      artist_id: userData.user.id,
      is_default: false,
      is_public: false,
      usage_count: 0,
      created_at: undefined,
      updated_at: undefined,
    })
    .select()
    .single()

  if (error) {
    console.error("Error duplicating preset:", error)
    throw error
  }

  return transformPresetFromDB(data)
}

// ============================================================================
// Action Functions
// ============================================================================

async function setDefaultPreset(presetId: string): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error("Must be logged in")
  }

  // Unset existing default
  await supabase
    .from("mockup_presets")
    .update({ is_default: false })
    .eq("artist_id", userData.user.id)
    .eq("is_default", true)

  // Set new default
  const { error } = await supabase
    .from("mockup_presets")
    .update({ is_default: true })
    .eq("id", presetId)

  if (error) {
    console.error("Error setting default preset:", error)
    throw error
  }
}

async function togglePublicPreset({ 
  id, 
  isPublic 
}: { 
  id: string
  isPublic: boolean 
}): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { error } = await supabase
    .from("mockup_presets")
    .update({ is_public: isPublic })
    .eq("id", id)

  if (error) {
    console.error("Error toggling preset visibility:", error)
    throw error
  }
}

async function incrementPresetUsage(presetId: string): Promise<void> {
  const supabase = supabaseBrowser()
  
  const { error } = await supabase.rpc("increment_preset_usage", {
    preset_id: presetId,
  })

  if (error) {
    // Fallback: manual increment if RPC not available
    const { data: preset } = await supabase
      .from("mockup_presets")
      .select("usage_count")
      .eq("id", presetId)
      .single()

    if (preset) {
      await supabase
        .from("mockup_presets")
        .update({ usage_count: (preset.usage_count || 0) + 1 })
        .eq("id", presetId)
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function transformPresetFromDB(dbPreset: Record<string, unknown>): Preset {
  return {
    id: dbPreset.id as string,
    name: dbPreset.name as string,
    description: dbPreset.description as string | null,
    tags: (dbPreset.tags as string[]) || [],
    garmentType: dbPreset.garment_type as GarmentType,
    variantId: dbPreset.variant_id as string,
    colorHex: dbPreset.color_hex as string,
    fabricType: dbPreset.fabric_type as string,
    designFileId: dbPreset.design_file_id as string | null,
    designTransform: (dbPreset.design_transform as DesignTransform) || { position: { x: 0, y: 0 }, scale: 1, rotation: 0 },
    printArea: dbPreset.print_area as string,
    cameraAngle: (dbPreset.camera_angle as CameraAngle) || { theta: 0, phi: 0, zoom: 1 },
    lightingPreset: dbPreset.lighting_preset as string,
    isDefault: dbPreset.is_default as boolean,
    isPublic: dbPreset.is_public as boolean,
    artistId: dbPreset.artist_id as string,
    thumbnailUrl: dbPreset.thumbnail_url as string | null,
    usageCount: dbPreset.usage_count as number,
    createdAt: dbPreset.created_at as string,
    updatedAt: dbPreset.updated_at as string,
  }
}

// ============================================================================
// Query Hooks
// ============================================================================

export function usePresets(
  options: PresetFilters & { queryOptions?: Omit<UseQueryOptions<Preset[], Error>, "queryKey" | "queryFn"> } = {}
) {
  const { queryOptions, ...filters } = options
  
  return useQuery<Preset[], Error>({
    queryKey: ["mockup-presets", filters],
    queryFn: () => fetchPresets(filters),
    ...(queryOptions as any),
  })
}

export function usePreset(presetId: string) {
  return useQuery({
    queryKey: ["mockup-presets", presetId],
    queryFn: () => fetchPreset(presetId),
    enabled: !!presetId,
  })
}

export function usePresetsByGarment(garmentType: GarmentType) {
  return useQuery({
    queryKey: ["mockup-presets", "garment", garmentType],
    queryFn: () => fetchPresetsByGarment(garmentType),
    enabled: !!garmentType,
  })
}

export function useDefaultPreset() {
  return useQuery({
    queryKey: ["mockup-presets", "default"],
    queryFn: fetchDefaultPreset,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

export function useCreatePreset() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createPreset,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mockup-presets"] })
      queryClient.setQueryData(["mockup-presets", data.id], data)
      
      if (data.isDefault) {
        queryClient.invalidateQueries({ queryKey: ["mockup-presets", "default"] })
      }
    },
  })
}

export function useUpdatePreset() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updatePreset,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mockup-presets"] })
      queryClient.setQueryData(["mockup-presets", data.id], data)
      
      if (data.isDefault) {
        queryClient.invalidateQueries({ queryKey: ["mockup-presets", "default"] })
      }
    },
  })
}

export function useDeletePreset() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deletePreset,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["mockup-presets"] })
      queryClient.removeQueries({ queryKey: ["mockup-presets", id] })
    },
  })
}

export function useDuplicatePreset() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: duplicatePreset,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mockup-presets"] })
      queryClient.setQueryData(["mockup-presets", data.id], data)
    },
  })
}

// ============================================================================
// Action Hooks
// ============================================================================

export function useSetDefaultPreset() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: setDefaultPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mockup-presets"] })
      queryClient.invalidateQueries({ queryKey: ["mockup-presets", "default"] })
    },
  })
}

export function useTogglePublicPreset() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: togglePublicPreset,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mockup-presets"] })
      queryClient.invalidateQueries({ queryKey: ["mockup-presets", variables.id] })
    },
  })
}

export function useIncrementPresetUsage() {
  return useMutation({
    mutationFn: incrementPresetUsage,
  })
}
