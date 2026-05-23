/**
 * Stigmator Mockup API Integration
 * 
 * This module provides TanStack Query hooks and utilities for the mockup backend API.
 * All hooks support caching, optimistic updates, and error handling.
 */

// ============================================================================
// Supabase Client (for direct access when needed)
// ============================================================================

import { createBrowserClient } from "@supabase/ssr"
import { Database } from "@/types/supabase"

// Check if Supabase is properly configured
const isSupabaseConfigured = 
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_url" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your_supabase_anon_key"

// Client-side Supabase client - use this in Client Components ("use client")
export const createMockupSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If not configured, return a mock client for demo mode
  if (!supabaseUrl || supabaseUrl === "your_supabase_url" || !supabaseAnonKey || supabaseAnonKey === "your_supabase_anon_key") {
    console.warn("Supabase not configured. Running in demo mode.")
    
    // Return a mock client that won't crash
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: new Error("Demo mode - no Supabase") }),
        signUp: async () => ({ data: null, error: new Error("Demo mode - no Supabase") }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: unknown) => ({
            single: async () => ({ data: null, error: null }),
            order: () => ({ limit: () => ({ data: [], error: null }) }),
            in: () => ({ data: [], error: null }),
          }),
          contains: () => ({ data: [], error: null }),
          order: () => ({ limit: () => ({ data: [], error: null }) }),
        }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: () => ({ eq: async () => ({ error: null }) }),
        upsert: async () => ({ data: null, error: null }),
      }),
      storage: {
        from: (bucket: string) => ({
          upload: async () => ({ data: { path: "" }, error: null }),
          remove: async () => ({ error: null }),
          getPublicUrl: (path: string) => ({ data: { publicUrl: "" } }),
        }),
      },
      rpc: async () => ({ data: null, error: null }),
      channel: () => ({
        on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      }),
    } as unknown as ReturnType<typeof createBrowserClient<Database>>
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Export a singleton instance for convenience (lazy loaded)
let supabaseInstance: ReturnType<typeof createMockupSupabaseClient> | null = null

export const supabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createMockupSupabaseClient()
  }
  return supabaseInstance
}

// ============================================================================
// Re-export all hooks and types
// ============================================================================

// Presets
export {
  // Query hooks
  usePresets,
  usePreset,
  usePresetsByGarment,
  useDefaultPreset,
  // Mutation hooks
  useCreatePreset,
  useUpdatePreset,
  useDeletePreset,
  useDuplicatePreset,
  // Action hooks
  useSetDefaultPreset,
  useTogglePublicPreset,
  useIncrementPresetUsage,
} from "./presets"

export type {
  Preset,
  PresetInput,
  PresetFilters,
  DesignTransform,
  CameraAngle,
} from "./presets"

// Renders
export {
  // Query hooks
  useRenders,
  usePrimaryRender,
  // Mutation hooks
  useUploadRender,
  useDeleteRender,
  useSetPrimaryRender,
  // Storage upload
  uploadRender,
} from "./renders"

export type {
  MockupRender,
  RenderInput,
  RenderUploadOptions,
} from "./renders"

// Designs
export {
  // Query hooks
  useDesignFiles,
  useDesignFile,
  // Mutation hooks
  useUploadDesign,
  useDeleteDesign,
  // Upload and analysis
  uploadDesignFile,
  analyzeDesignColors,
} from "./designs"

export type {
  DesignFile,
  DesignUploadInput,
  DesignColors,
} from "./designs"

// Models
export {
  // Query hooks
  useGarmentModels,
  useGarmentModelsByType,
  useGarmentModel,
  // Preload hook
  usePreloadModel,
} from "./models"

export type {
  GarmentModel,
  UVRegion,
} from "./models"

// Stats
export {
  // Query hooks
  useArtistMockupStats,
  usePresetUsageStats,
  // Subscription hook
  useMockupStatsSubscription,
} from "./stats"

export type {
  ArtistMockupStats,
  PresetUsageStats,
  RealtimeStatsUpdate,
} from "./stats"

// Sync
export {
  // Query hooks
  usePendingChanges,
  useOfflineSync,
  // Utilities
  queueOfflineChange,
  syncPendingChanges,
} from "./sync"

export type {
  PendingChange,
  PendingChangeType,
  PendingChangeEntity,
  SyncResult,
  SyncStatus,
} from "./sync"

// ============================================================================
// Combined Query Keys Helper
// ============================================================================

/**
 * Query keys for invalidating mockup-related queries
 */
export const mockupQueryKeys = {
  all: ["mockup"] as const,
  presets: () => [...mockupQueryKeys.all, "presets"] as const,
  preset: (id: string) => [...mockupQueryKeys.presets(), id] as const,
  presetsByGarment: (type: string) => [...mockupQueryKeys.presets(), "garment", type] as const,
  defaultPreset: () => [...mockupQueryKeys.presets(), "default"] as const,
  renders: (presetId: string) => [...mockupQueryKeys.all, "renders", presetId] as const,
  primaryRender: (presetId: string) => [...mockupQueryKeys.renders(presetId), "primary"] as const,
  designFiles: () => [...mockupQueryKeys.all, "design-files"] as const,
  designFile: (id: string) => [...mockupQueryKeys.designFiles(), id] as const,
  models: () => [...mockupQueryKeys.all, "models"] as const,
  model: (id: string) => [...mockupQueryKeys.models(), id] as const,
  modelsByType: (type: string) => [...mockupQueryKeys.models(), "type", type] as const,
  stats: () => [...mockupQueryKeys.all, "stats"] as const,
  artistStats: (id?: string) => [...mockupQueryKeys.stats(), "artist", id || "me"] as const,
  presetStats: (id: string) => [...mockupQueryKeys.stats(), "preset", id] as const,
  pendingChanges: () => [...mockupQueryKeys.all, "pending-changes"] as const,
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Custom error class for mockup API errors
 */
export class MockupAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = "MockupAPIError"
  }
}

/**
 * Handle Supabase errors consistently
 */
export function handleSupabaseError(error: unknown): never {
  if (error && typeof error === "object" && "code" in error) {
    const supabaseError = error as { code: string; message: string; statusCode?: number }
    throw new MockupAPIError(
      supabaseError.message,
      supabaseError.code,
      supabaseError.statusCode
    )
  }
  
  if (error instanceof Error) {
    throw new MockupAPIError(error.message, "UNKNOWN_ERROR")
  }
  
  throw new MockupAPIError("An unknown error occurred", "UNKNOWN_ERROR")
}

// ============================================================================
// Optimistic Update Helpers
// ============================================================================

/**
 * Helper for optimistic updates on preset lists
 */
export function optimisticUpdatePresetList<T extends { id: string }>(
  current: T[] | undefined,
  updater: (list: T[]) => T[]
): T[] {
  if (!current) return []
  return updater([...current])
}

/**
 * Helper for optimistic updates on single presets
 */
export function optimisticUpdatePreset<T>(
  current: T | undefined,
  updates: Partial<T>
): T | undefined {
  if (!current) return undefined
  return { ...current, ...updates }
}
