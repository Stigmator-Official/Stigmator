"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabaseBrowser } from "@/lib/supabase/client"

// ============================================================================
// Types
// ============================================================================

export interface MockupRender {
  id: string
  presetId: string
  angle: string
  width: number
  height: number
  format: "png" | "jpg" | "webp"
  storagePath: string
  publicUrl: string
  fileSize: number
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export interface RenderInput {
  presetId: string
  angle: string
  width: number
  height: number
  format: "png" | "jpg" | "webp"
  imageData: string // base64 dataURL from canvas
}

export interface RenderUploadOptions {
  onProgress?: (progress: number) => void
}

// ============================================================================
// Query Functions
// ============================================================================

async function fetchRenders(presetId: string): Promise<MockupRender[]> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("mockup_renders")
    .select("*")
    .eq("preset_id", presetId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching renders:", error)
    throw error
  }

  return (data || []).map(transformRenderFromDB)
}

async function fetchPrimaryRender(presetId: string): Promise<MockupRender | null> {
  const supabase = supabaseBrowser()
  
  const { data, error } = await supabase
    .from("mockup_renders")
    .select("*")
    .eq("preset_id", presetId)
    .eq("is_primary", true)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Error fetching primary render:", error)
    throw error
  }

  return data ? transformRenderFromDB(data) : null
}

// ============================================================================
// Mutation Functions
// ============================================================================

async function uploadRenderMutation({
  input,
  options = {},
}: {
  input: RenderInput
  options?: RenderUploadOptions
}): Promise<MockupRender> {
  const supabase = supabaseBrowser()
  const { onProgress } = options

  // Convert base64 to blob
  const base64Data = input.imageData.split(",")[1]
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: `image/${input.format}` })

  // Upload to Supabase Storage
  const result = await uploadRender(input.presetId, input.angle, blob, onProgress)

  // Save metadata to database
  const { data, error } = await supabase
    .from("mockup_renders")
    .insert({
      preset_id: input.presetId,
      angle: input.angle,
      width: input.width,
      height: input.height,
      format: input.format,
      storage_path: result.path,
      public_url: result.url,
      file_size: blob.size,
      is_primary: false,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving render metadata:", error)
    throw error
  }

  return transformRenderFromDB(data)
}

async function deleteRender(id: string): Promise<void> {
  const supabase = supabaseBrowser()
  
  // First get the render to find storage path
  const { data: render, error: fetchError } = await supabase
    .from("mockup_renders")
    .select("storage_path")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Error fetching render for deletion:", fetchError)
    throw fetchError
  }

  // Delete from storage
  if (render?.storage_path) {
    const { error: storageError } = await supabase.storage
      .from("mockup-renders")
      .remove([render.storage_path])

    if (storageError) {
      console.warn("Error deleting render from storage:", storageError)
    }
  }

  // Delete from database
  const { error } = await supabase
    .from("mockup_renders")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting render:", error)
    throw error
  }
}

async function setPrimaryRender({ 
  id, 
  presetId 
}: { 
  id: string
  presetId: string 
}): Promise<void> {
  const supabase = supabaseBrowser()
  
  // Unset existing primary
  await supabase
    .from("mockup_renders")
    .update({ is_primary: false })
    .eq("preset_id", presetId)
    .eq("is_primary", true)

  // Set new primary
  const { error } = await supabase
    .from("mockup_renders")
    .update({ is_primary: true })
    .eq("id", id)

  if (error) {
    console.error("Error setting primary render:", error)
    throw error
  }
}

// ============================================================================
// Storage Upload
// ============================================================================

export async function uploadRender(
  presetId: string,
  angle: string,
  imageBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<{ path: string; url: string }> {
  const supabase = supabaseBrowser()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error("Must be logged in to upload renders")
  }

  const fileExt = imageBlob.type.split("/")[1] || "png"
  const fileName = `${Date.now()}_${angle}.${fileExt}`
  const filePath = `${userData.user.id}/${presetId}/${fileName}`

  const { error: uploadError, data } = await supabase.storage
    .from("mockup-renders")
    .upload(filePath, imageBlob, {
      contentType: imageBlob.type,
      upsert: false,
    })

  if (uploadError) {
    console.error("Error uploading render to storage:", uploadError)
    throw uploadError
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("mockup-renders")
    .getPublicUrl(filePath)

  // Simulate progress
  if (onProgress) {
    onProgress(100)
  }

  return {
    path: filePath,
    url: urlData.publicUrl,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function transformRenderFromDB(dbRender: Record<string, unknown>): MockupRender {
  return {
    id: dbRender.id as string,
    presetId: dbRender.preset_id as string,
    angle: dbRender.angle as string,
    width: dbRender.width as number,
    height: dbRender.height as number,
    format: dbRender.format as "png" | "jpg" | "webp",
    storagePath: dbRender.storage_path as string,
    publicUrl: dbRender.public_url as string,
    fileSize: dbRender.file_size as number,
    isPrimary: dbRender.is_primary as boolean,
    createdAt: dbRender.created_at as string,
    updatedAt: dbRender.updated_at as string,
  }
}

// ============================================================================
// Query Hooks
// ============================================================================

export function useRenders(presetId: string) {
  return useQuery({
    queryKey: ["mockup-renders", presetId],
    queryFn: () => fetchRenders(presetId),
    enabled: !!presetId,
  })
}

export function usePrimaryRender(presetId: string) {
  return useQuery({
    queryKey: ["mockup-renders", presetId, "primary"],
    queryFn: () => fetchPrimaryRender(presetId),
    enabled: !!presetId,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

export function useUploadRender() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: uploadRenderMutation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ["mockup-renders", data.presetId] 
      })
      
      if (data.isPrimary) {
        queryClient.invalidateQueries({ 
          queryKey: ["mockup-renders", data.presetId, "primary"] 
        })
      }
    },
  })
}

export function useDeleteRender() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteRender,
    onSuccess: (_, id) => {
      // Invalidate all render lists since we don't know which preset this belonged to
      queryClient.invalidateQueries({ queryKey: ["mockup-renders"] })
    },
  })
}

export function useSetPrimaryRender() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: setPrimaryRender,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["mockup-renders", variables.presetId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ["mockup-renders", variables.presetId, "primary"] 
      })
    },
  })
}
