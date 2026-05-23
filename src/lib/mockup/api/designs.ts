"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabaseBrowser } from "@/lib/supabase/client"

// ============================================================================
// Types
// ============================================================================

export interface DesignFile {
  id: string
  originalName: string
  publicUrl: string
  width: number
  height: number
  format: string
  hasTransparency: boolean
  dominantColors: Array<{ hex: string; percent: number }>
  fileSize: number
  artistId: string
  createdAt: string
  updatedAt: string
}

export interface DesignUploadInput {
  file: File
  onProgress?: (progress: number) => void
}

export interface DesignColors {
  hex: string
  percent: number
}

// ============================================================================
// Query Functions
// ============================================================================

async function fetchDesignFiles(): Promise<DesignFile[]> {
  const supabase = supabaseBrowser()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return []

  const { data, error } = await supabase
    .from("mockup_design_files")
    .select("*")
    .eq("artist_id", userData.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching design files:", error)
    throw error
  }

  return (data || []).map(transformDesignFromDB)
}

async function fetchDesignFile(designId: string): Promise<DesignFile | null> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("mockup_design_files")
    .select("*")
    .eq("id", designId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Error fetching design file:", error)
    throw error
  }

  return data ? transformDesignFromDB(data) : null
}

// ============================================================================
// Mutation Functions
// ============================================================================

async function uploadDesignMutation({ 
  input 
}: { 
  input: DesignUploadInput 
}): Promise<DesignFile> {
  const result = await uploadDesignFile(input.file, input.onProgress)
  return result
}

async function deleteDesignFile(id: string): Promise<void> {
  const supabase = supabaseBrowser()
  
  // Get the design file to find storage path
  const { data: design, error: fetchError } = await supabase
    .from("mockup_design_files")
    .select("storage_path")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Error fetching design for deletion:", fetchError)
    throw fetchError
  }

  // Delete from storage
  if (design?.storage_path) {
    const { error: storageError } = await supabase.storage
      .from("mockup-designs")
      .remove([design.storage_path])

    if (storageError) {
      console.warn("Error deleting design from storage:", storageError)
    }
  }

  // Delete from database
  const { error } = await supabase
    .from("mockup_design_files")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting design file:", error)
    throw error
  }
}

// ============================================================================
// Upload with Progress Tracking
// ============================================================================

export async function uploadDesignFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<DesignFile> {
  const supabase = supabaseBrowser()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error("Must be logged in to upload designs")
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "png"
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
  const filePath = `${userData.user.id}/${fileName}`

  // Upload to Supabase Storage with progress simulation
  const { error: uploadError, data: uploadData } = await supabase.storage
    .from("mockup-designs")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error("Error uploading design to storage:", uploadError)
    throw uploadError
  }

  // Report progress at 50%
  if (onProgress) {
    onProgress(50)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("mockup-designs")
    .getPublicUrl(filePath)

  // Analyze the image
  const analysis = await analyzeImage(file)

  // Report progress at 80%
  if (onProgress) {
    onProgress(80)
  }

  // Save metadata to database
  const { data, error } = await supabase
    .from("mockup_design_files")
    .insert({
      artist_id: userData.user.id,
      original_name: file.name,
      storage_path: filePath,
      public_url: urlData.publicUrl,
      width: analysis.width,
      height: analysis.height,
      format: fileExt,
      has_transparency: analysis.hasTransparency,
      dominant_colors: analysis.dominantColors as unknown as Record<string, unknown>[],
      file_size: file.size,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving design metadata:", error)
    // Clean up uploaded file
    await supabase.storage.from("mockup-designs").remove([filePath])
    throw error
  }

  // Report 100% progress
  if (onProgress) {
    onProgress(100)
  }

  return transformDesignFromDB(data)
}

// ============================================================================
// Design Analysis
// ============================================================================

async function analyzeImage(file: File): Promise<{
  width: number
  height: number
  hasTransparency: boolean
  dominantColors: DesignColors[]
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      // Downsample for faster analysis
      const maxDimension = 100
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data

      // Check for transparency
      let hasTransparency = false
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 255) {
          hasTransparency = true
          break
        }
      }

      // Extract dominant colors
      const colors = extractDominantColors(pixels)

      resolve({
        width: img.width,
        height: img.height,
        hasTransparency,
        dominantColors: colors,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image for analysis"))
    }

    img.src = url
  })
}

function extractDominantColors(
  pixels: Uint8ClampedArray,
  colorCount: number = 5
): DesignColors[] {
  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>()

  // Sample every 4th pixel for performance
  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const a = pixels[i + 3]

    // Skip transparent pixels
    if (a < 128) continue

    // Quantize colors for grouping
    const quantizedR = Math.round(r / 32) * 32
    const quantizedG = Math.round(g / 32) * 32
    const quantizedB = Math.round(b / 32) * 32
    
    const key = `${quantizedR},${quantizedG},${quantizedB}`
    
    const existing = colorMap.get(key)
    if (existing) {
      existing.count++
    } else {
      colorMap.set(key, { r, g, b, count: 1 })
    }
  }

  // Sort by frequency and get top colors
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, colorCount)

  const totalCount = sortedColors.reduce((sum, [, data]) => sum + data.count, 0)

  return sortedColors.map(([, data]) => ({
    hex: rgbToHex(data.r, data.g, data.b),
    percent: Math.round((data.count / totalCount) * 100),
  }))
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`
}

export async function analyzeDesignColors(
  designId: string
): Promise<DesignColors[]> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("mockup_design_files")
    .select("dominant_colors")
    .eq("id", designId)
    .single()

  if (error) {
    console.error("Error fetching design colors:", error)
    throw error
  }

  return (data?.dominant_colors as DesignColors[]) || []
}

// ============================================================================
// Helper Functions
// ============================================================================

function transformDesignFromDB(dbDesign: Record<string, unknown>): DesignFile {
  return {
    id: dbDesign.id as string,
    originalName: dbDesign.original_name as string,
    publicUrl: dbDesign.public_url as string,
    width: dbDesign.width as number,
    height: dbDesign.height as number,
    format: dbDesign.format as string,
    hasTransparency: dbDesign.has_transparency as boolean,
    dominantColors: (dbDesign.dominant_colors as DesignColors[]) || [],
    fileSize: dbDesign.file_size as number,
    artistId: dbDesign.artist_id as string,
    createdAt: dbDesign.created_at as string,
    updatedAt: dbDesign.updated_at as string,
  }
}

// ============================================================================
// Query Hooks
// ============================================================================

export function useDesignFiles() {
  return useQuery({
    queryKey: ["mockup-design-files"],
    queryFn: fetchDesignFiles,
  })
}

export function useDesignFile(designId: string) {
  return useQuery({
    queryKey: ["mockup-design-files", designId],
    queryFn: () => fetchDesignFile(designId),
    enabled: !!designId,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

export function useUploadDesign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: uploadDesignMutation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mockup-design-files"] })
      queryClient.setQueryData(["mockup-design-files", data.id], data)
    },
  })
}

export function useDeleteDesign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteDesignFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mockup-design-files"] })
    },
  })
}
