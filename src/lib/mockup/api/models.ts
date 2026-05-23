"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabaseBrowser } from "@/lib/supabase/client"
import type { GarmentType, PrintArea } from "@/lib/mockup/types"

// ============================================================================
// Types
// ============================================================================

export interface UVRegion {
  u: [number, number]
  v: [number, number]
}

export interface GarmentModel {
  id: string
  type: GarmentType
  variantId: string
  name: string
  displayName: string
  description: string | null
  modelUrl: string
  textureUrl: string | null
  normalMapUrl: string | null
  roughnessMapUrl: string | null
  polygonCount: number
  lodLevels: number
  uvRegions: Record<string, UVRegion>
  printAreas: Record<string, PrintArea>
  defaultCameraPosition: { x: number; y: number; z: number }
  defaultCameraTarget: { x: number; y: number; z: number }
  defaultFov: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Query Functions
// ============================================================================

async function fetchGarmentModels(): Promise<GarmentModel[]> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("mockup_garment_models")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching garment models:", error)
    throw error
  }

  return (data || []).map(transformModelFromDB)
}

async function fetchGarmentModelsByType(type: GarmentType): Promise<GarmentModel[]> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("mockup_garment_models")
    .select("*")
    .eq("type", type)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching garment models by type:", error)
    throw error
  }

  return (data || []).map(transformModelFromDB)
}

async function fetchGarmentModel(modelId: string): Promise<GarmentModel | null> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("mockup_garment_models")
    .select("*")
    .eq("id", modelId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Error fetching garment model:", error)
    throw error
  }

  return data ? transformModelFromDB(data) : null
}

// ============================================================================
// Preload Functions
// ============================================================================

interface PreloadResult {
  success: boolean
  model: GarmentModel
  error?: string
}

async function preloadModels(models: GarmentModel[]): Promise<PreloadResult[]> {
  const results: PreloadResult[] = []

  for (const model of models) {
    try {
      // Preload the model file
      if (model.modelUrl) {
        await preloadResource(model.modelUrl)
      }

      // Preload textures
      const textures = [
        model.textureUrl,
        model.normalMapUrl,
        model.roughnessMapUrl,
      ].filter(Boolean) as string[]

      await Promise.all(textures.map(preloadResource))

      results.push({ success: true, model })
    } catch (error) {
      results.push({
        success: false,
        model,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return results
}

function preloadResource(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if it's a texture or model file
    const isImage = /\.(png|jpg|jpeg|webp|gif)$/i.test(url)
    const isGLTF = /\.(gltf|glb)$/i.test(url)

    if (isImage) {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    } else if (isGLTF) {
      // For GLTF files, we'll just fetch the headers to cache the connection
      fetch(url, { method: "HEAD", mode: "no-cors" })
        .then(() => resolve())
        .catch(() => reject(new Error(`Failed to preload model: ${url}`)))
    } else {
      // Unknown type, try a generic fetch
      fetch(url, { method: "HEAD", mode: "no-cors" })
        .then(() => resolve())
        .catch(() => reject(new Error(`Failed to preload resource: ${url}`)))
    }
  })
}

// ============================================================================
// Helper Functions
// ============================================================================

function transformModelFromDB(dbModel: Record<string, unknown>): GarmentModel {
  return {
    id: dbModel.id as string,
    type: dbModel.type as GarmentType,
    variantId: dbModel.variant_id as string,
    name: dbModel.name as string,
    displayName: dbModel.display_name as string,
    description: dbModel.description as string | null,
    modelUrl: dbModel.model_url as string,
    textureUrl: dbModel.texture_url as string | null,
    normalMapUrl: dbModel.normal_map_url as string | null,
    roughnessMapUrl: dbModel.roughness_map_url as string | null,
    polygonCount: dbModel.polygon_count as number,
    lodLevels: dbModel.lod_levels as number,
    uvRegions: (dbModel.uv_regions as Record<string, UVRegion>) || {},
    printAreas: (dbModel.print_areas as Record<string, PrintArea>) || {},
    defaultCameraPosition: (dbModel.default_camera_position as { x: number; y: number; z: number }) || { x: 0, y: 0, z: 5 },
    defaultCameraTarget: (dbModel.default_camera_target as { x: number; y: number; z: number }) || { x: 0, y: 0, z: 0 },
    defaultFov: dbModel.default_fov as number,
    isActive: dbModel.is_active as boolean,
    createdAt: dbModel.created_at as string,
    updatedAt: dbModel.updated_at as string,
  }
}

// ============================================================================
// Query Hooks
// ============================================================================

export function useGarmentModels() {
  return useQuery({
    queryKey: ["mockup-garment-models"],
    queryFn: fetchGarmentModels,
    staleTime: 1000 * 60 * 5, // 5 minutes - models don't change often
  })
}

export function useGarmentModelsByType(type: GarmentType) {
  return useQuery({
    queryKey: ["mockup-garment-models", "type", type],
    queryFn: () => fetchGarmentModelsByType(type),
    enabled: !!type,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGarmentModel(modelId: string) {
  return useQuery({
    queryKey: ["mockup-garment-models", modelId],
    queryFn: () => fetchGarmentModel(modelId),
    enabled: !!modelId,
    staleTime: 1000 * 60 * 5,
  })
}

// ============================================================================
// Preload Hook
// ============================================================================

export function usePreloadModel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (modelIds: string[]) => {
      // Fetch models that aren't already in cache
      const modelsToFetch: string[] = []
      const existingModels: GarmentModel[] = []

      for (const id of modelIds) {
        const cached = queryClient.getQueryData<GarmentModel>([
          "mockup-garment-models",
          id,
        ])
        if (cached) {
          existingModels.push(cached)
        } else {
          modelsToFetch.push(id)
        }
      }

      // Fetch missing models
      const fetchedModels = await Promise.all(
        modelsToFetch.map((id) => fetchGarmentModel(id))
      )

      // Cache the fetched models
      fetchedModels.forEach((model) => {
        if (model) {
          queryClient.setQueryData(["mockup-garment-models", model.id], model)
          existingModels.push(model)
        }
      })

      // Preload the actual files
      return preloadModels(existingModels)
    },
  })
}
