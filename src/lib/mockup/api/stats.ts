"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"

// ============================================================================
// Types
// ============================================================================

export interface ArtistMockupStats {
  totalPresets: number
  totalRenders: number
  publicPresets: number
  mostUsedPreset: string | null
  mostUsedPresetCount: number
  storageUsedBytes: number
  rendersByFormat: {
    png: number
    jpg: number
    webp: number
  }
  presetsByGarmentType: Record<string, number>
  lastRenderAt: string | null
}

export interface PresetUsageStats {
  presetId: string
  presetName: string
  totalRenders: number
  rendersByAngle: Record<string, number>
  lastRenderedAt: string | null
  monthlyUsage: Array<{
    month: string
    count: number
  }>
}

export interface RealtimeStatsUpdate {
  artistId: string
  type: "preset_created" | "preset_updated" | "preset_deleted" | "render_uploaded"
  timestamp: string
  data?: Record<string, unknown>
}

// ============================================================================
// Query Functions
// ============================================================================

async function fetchArtistMockupStats(artistId?: string): Promise<ArtistMockupStats> {
  const supabase = supabaseBrowser()
  
  let targetArtistId = artistId
  
  if (!targetArtistId) {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("Must be logged in to fetch stats")
    }
    targetArtistId = userData.user.id
  }

  // Fetch preset stats
  const { data: presets, error: presetsError } = await supabase
    .from("mockup_presets")
    .select("id, name, usage_count, garment_type, is_public")
    .eq("artist_id", targetArtistId)

  if (presetsError) {
    console.error("Error fetching preset stats:", presetsError)
    throw presetsError
  }

  // Fetch render stats
  const { data: renders, error: rendersError } = await supabase
    .from("mockup_renders")
    .select("id, format, file_size, created_at, preset_id")
    .eq("artist_id", targetArtistId)

  if (rendersError) {
    console.error("Error fetching render stats:", rendersError)
    throw rendersError
  }

  // Calculate stats
  const presetList = presets || []
  const renderList = renders || []

  // Find most used preset
  let mostUsedPreset: { id: string; name: string; count: number } | null = null
  for (const preset of presetList) {
    if (!mostUsedPreset || (preset.usage_count || 0) > mostUsedPreset.count) {
      mostUsedPreset = {
        id: preset.id,
        name: preset.name,
        count: preset.usage_count || 0,
      }
    }
  }

  // Calculate renders by format
  const rendersByFormat = {
    png: 0,
    jpg: 0,
    webp: 0,
  }
  for (const render of renderList) {
    if (render.format in rendersByFormat) {
      rendersByFormat[render.format as keyof typeof rendersByFormat]++
    }
  }

  // Calculate presets by garment type
  const presetsByGarmentType: Record<string, number> = {}
  for (const preset of presetList) {
    const type = preset.garment_type || "unknown"
    presetsByGarmentType[type] = (presetsByGarmentType[type] || 0) + 1
  }

  // Calculate storage used
  const storageUsedBytes = renderList.reduce(
    (total: number, render: any) => total + (render.file_size || 0),
    0
  )

  // Find last render date
  const lastRenderAt = renderList.length > 0
    ? renderList.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0].created_at
    : null

  return {
    totalPresets: presetList.length,
    totalRenders: renderList.length,
    publicPresets: presetList.filter((p: any) => p.is_public).length,
    mostUsedPreset: mostUsedPreset?.name || null,
    mostUsedPresetCount: mostUsedPreset?.count || 0,
    storageUsedBytes,
    rendersByFormat,
    presetsByGarmentType,
    lastRenderAt,
  }
}

async function fetchPresetUsageStats(presetId: string): Promise<PresetUsageStats> {
  const supabase = supabaseBrowser()
  
  // Fetch preset details
  const { data: preset, error: presetError } = await supabase
    .from("mockup_presets")
    .select("id, name, usage_count")
    .eq("id", presetId)
    .single()

  if (presetError) {
    console.error("Error fetching preset for stats:", presetError)
    throw presetError
  }

  // Fetch renders for this preset
  const { data: renders, error: rendersError } = await supabase
    .from("mockup_renders")
    .select("id, angle, created_at")
    .eq("preset_id", presetId)
    .order("created_at", { ascending: false })

  if (rendersError) {
    console.error("Error fetching render stats:", rendersError)
    throw rendersError
  }

  const renderList = renders || []

  // Calculate renders by angle
  const rendersByAngle: Record<string, number> = {}
  for (const render of renderList) {
    const angle = render.angle || "unknown"
    rendersByAngle[angle] = (rendersByAngle[angle] || 0) + 1
  }

  // Calculate monthly usage (last 12 months)
  const monthlyUsage: Array<{ month: string; count: number }> = []
  const now = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = monthDate.toISOString().slice(0, 7) // YYYY-MM
    const monthName = monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    
    const count = renderList.filter((render: any) => {
      const renderMonth = render.created_at.slice(0, 7)
      return renderMonth === monthKey
    }).length

    monthlyUsage.push({ month: monthName, count })
  }

  return {
    presetId: preset.id,
    presetName: preset.name,
    totalRenders: renderList.length,
    rendersByAngle,
    lastRenderedAt: renderList.length > 0 ? renderList[0].created_at : null,
    monthlyUsage,
  }
}

// ============================================================================
// Realtime Subscription
// ============================================================================

function subscribeToMockupStats(
  artistId: string,
  callback: (update: RealtimeStatsUpdate) => void
) {
  const supabase = supabaseBrowser()

  const subscription = supabase
    .channel(`mockup_stats_${artistId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "mockup_presets",
        filter: `artist_id=eq.${artistId}`,
      },
      (payload: any) => {
        callback({
          artistId,
          type: "preset_created",
          timestamp: new Date().toISOString(),
          data: payload.new as Record<string, unknown>,
        })
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "mockup_presets",
        filter: `artist_id=eq.${artistId}`,
      },
      (payload: any) => {
        callback({
          artistId,
          type: "preset_updated",
          timestamp: new Date().toISOString(),
          data: payload.new as Record<string, unknown>,
        })
      }
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "mockup_presets",
        filter: `artist_id=eq.${artistId}`,
      },
      () => {
        callback({
          artistId,
          type: "preset_deleted",
          timestamp: new Date().toISOString(),
        })
      }
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "mockup_renders",
        filter: `artist_id=eq.${artistId}`,
      },
      (payload: any) => {
        callback({
          artistId,
          type: "render_uploaded",
          timestamp: new Date().toISOString(),
          data: payload.new as Record<string, unknown>,
        })
      }
    )
    .subscribe()

  return subscription
}

// ============================================================================
// Query Hooks
// ============================================================================

export function useArtistMockupStats(artistId?: string) {
  return useQuery({
    queryKey: ["mockup-stats", "artist", artistId || "me"],
    queryFn: () => fetchArtistMockupStats(artistId),
    staleTime: 1000 * 60, // 1 minute
  })
}

export function usePresetUsageStats(presetId: string) {
  return useQuery({
    queryKey: ["mockup-stats", "preset", presetId],
    queryFn: () => fetchPresetUsageStats(presetId),
    enabled: !!presetId,
    staleTime: 1000 * 60,
  })
}

// ============================================================================
// Subscription Hook
// ============================================================================

export function useMockupStatsSubscription(artistId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const subscription = subscribeToMockupStats(artistId, (update) => {
      // Invalidate relevant queries based on update type
      switch (update.type) {
        case "preset_created":
        case "preset_updated":
        case "preset_deleted":
          queryClient.invalidateQueries({
            queryKey: ["mockup-stats", "artist", artistId],
          })
          queryClient.invalidateQueries({
            queryKey: ["mockup-presets"],
          })
          break
        case "render_uploaded":
          queryClient.invalidateQueries({
            queryKey: ["mockup-stats", "artist", artistId],
          })
          queryClient.invalidateQueries({
            queryKey: ["mockup-renders"],
          })
          break
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [artistId, queryClient])
}
