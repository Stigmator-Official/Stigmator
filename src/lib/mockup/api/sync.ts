"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useCallback } from "react"
import Dexie, { type Table } from "dexie"

// ============================================================================
// Types
// ============================================================================

export type PendingChangeType = "create" | "update" | "delete"
export type PendingChangeEntity = "preset" | "render"

export interface PendingChange {
  id: string
  type: PendingChangeType
  entity: PendingChangeEntity
  data: Record<string, unknown>
  timestamp: number
  retryCount: number
  error?: string
}

export interface SyncResult {
  success: number
  failed: number
  errors: Array<{
    changeId: string
    error: string
  }>
}

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSyncAt: number | null
  pendingCount: number
}

// ============================================================================
// Database Setup
// ============================================================================

const DB_NAME = "StigmatorOfflineSync"
const DB_VERSION = 1
const MAX_RETRIES = 3

class OfflineSyncDatabase extends Dexie {
  pendingChanges!: Table<PendingChange, string>
  syncMetadata!: Table<{ key: string; value: unknown }, string>

  constructor() {
    super(DB_NAME)
    this.version(DB_VERSION).stores({
      pendingChanges: "id, entity, type, timestamp, retryCount",
      syncMetadata: "key",
    })
  }
}

const db = new OfflineSyncDatabase()

// ============================================================================
// Queue Management
// ============================================================================

export function queueOfflineChange(
  change: Omit<PendingChange, "id" | "timestamp">
): void {
  const pendingChange: PendingChange = {
    ...change,
    id: generateChangeId(),
    timestamp: Date.now(),
  }

  // Save to IndexedDB
  db.pendingChanges.add(pendingChange).catch((error) => {
    console.error("Failed to queue offline change:", error)
  })

  // Trigger sync if online
  if (typeof navigator !== "undefined" && navigator.onLine) {
    syncPendingChanges().catch(console.error)
  }
}

function generateChangeId(): string {
  return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// Sync Functions
// ============================================================================

export async function syncPendingChanges(): Promise<SyncResult> {
  const supabaseModule = await import("@/lib/supabase/client")
  const supabase = supabaseModule.supabaseBrowser()
  
  // Get all pending changes sorted by timestamp
  const pendingChanges = await db.pendingChanges
    .orderBy("timestamp")
    .toArray()

  if (pendingChanges.length === 0) {
    return { success: 0, failed: 0, errors: [] }
  }

  const result: SyncResult = {
    success: 0,
    failed: 0,
    errors: [],
  }

  for (const change of pendingChanges) {
    try {
      await processChange(change, supabase)
      await db.pendingChanges.delete(change.id)
      result.success++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      
      if (change.retryCount >= MAX_RETRIES) {
        // Max retries reached, mark as failed and remove
        await db.pendingChanges.delete(change.id)
        result.errors.push({ changeId: change.id, error: errorMessage })
        result.failed++
      } else {
        // Increment retry count and save error
        await db.pendingChanges.update(change.id, {
          retryCount: change.retryCount + 1,
          error: errorMessage,
        })
        result.failed++
      }
    }
  }

  // Update last sync timestamp
  await db.syncMetadata.put({
    key: "lastSyncAt",
    value: Date.now(),
  })

  return result
}

async function processChange(
  change: PendingChange,
  supabase: ReturnType<typeof import("@/lib/supabase/client").supabaseBrowser>
): Promise<void> {
  switch (change.entity) {
    case "preset":
      await processPresetChange(change, supabase)
      break
    case "render":
      await processRenderChange(change, supabase)
      break
    default:
      throw new Error(`Unknown entity type: ${change.entity}`)
  }
}

async function processPresetChange(
  change: PendingChange,
  supabase: ReturnType<typeof import("@/lib/supabase/client").supabaseBrowser>
): Promise<void> {
  const { data } = change

  switch (change.type) {
    case "create":
      await supabase.from("mockup_presets").insert(data)
      break
    case "update":
      await supabase.from("mockup_presets").update(data).eq("id", data.id)
      break
    case "delete":
      await supabase.from("mockup_presets").delete().eq("id", data.id)
      break
  }
}

async function processRenderChange(
  change: PendingChange,
  supabase: ReturnType<typeof import("@/lib/supabase/client").supabaseBrowser>
): Promise<void> {
  const { data } = change

  switch (change.type) {
    case "create":
      // For renders, we might need to upload the image first
      if (data.imageBlob && data.presetId) {
        const fileExt = data.format || "png"
        const fileName = `${Date.now()}_${data.angle}.${fileExt}`
        const filePath = `${data.artistId}/${data.presetId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("mockup-renders")
          .upload(filePath, data.imageBlob as Blob)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from("mockup-renders")
          .getPublicUrl(filePath)

        await supabase.from("mockup_renders").insert({
          ...data,
          storage_path: filePath,
          public_url: urlData.publicUrl,
          imageBlob: undefined, // Don't store blob in DB
        })
      }
      break
    case "delete":
      await supabase.from("mockup_renders").delete().eq("id", data.id)
      break
    default:
      throw new Error(`Unsupported render change type: ${change.type}`)
  }
}

// ============================================================================
// Query Functions
// ============================================================================

async function fetchPendingChanges(): Promise<PendingChange[]> {
  return db.pendingChanges.orderBy("timestamp").reverse().toArray()
}

async function fetchSyncStatus(): Promise<SyncStatus> {
  const [pendingChanges, lastSync] = await Promise.all([
    db.pendingChanges.count(),
    db.syncMetadata.get("lastSyncAt"),
  ])

  return {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: false, // Will be managed by the hook
    lastSyncAt: lastSync?.value as number | null,
    pendingCount: pendingChanges,
  }
}

async function clearFailedChanges(): Promise<void> {
  await db.pendingChanges.where("retryCount").aboveOrEqual(MAX_RETRIES).delete()
}

async function retryChange(changeId: string): Promise<void> {
  const change = await db.pendingChanges.get(changeId)
  if (change) {
    await db.pendingChanges.update(changeId, {
      retryCount: 0,
      error: undefined,
    })
  }
}

// ============================================================================
// Query Hooks
// ============================================================================

export function usePendingChanges() {
  return useQuery({
    queryKey: ["mockup-pending-changes"],
    queryFn: fetchPendingChanges,
    refetchInterval: 5000, // Refetch every 5 seconds
  })
}

export function useOfflineSync() {
  const queryClient = useQueryClient()
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Trigger sync when coming back online
      triggerSync()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Auto-sync on mount if online
  useEffect(() => {
    if (isOnline) {
      triggerSync()
    }
  }, [isOnline])

  const triggerSync = useCallback(async () => {
    if (isSyncing) return

    setIsSyncing(true)
    try {
      const result = await syncPendingChanges()
      
      // Invalidate related queries
      if (result.success > 0) {
        queryClient.invalidateQueries({ queryKey: ["mockup-presets"] })
        queryClient.invalidateQueries({ queryKey: ["mockup-renders"] })
        queryClient.invalidateQueries({ queryKey: ["mockup-stats"] })
      }

      return result
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, queryClient])

  const syncMutation = useMutation({
    mutationFn: syncPendingChanges,
    onSuccess: (result) => {
      if (result.success > 0) {
        queryClient.invalidateQueries({ queryKey: ["mockup-presets"] })
        queryClient.invalidateQueries({ queryKey: ["mockup-renders"] })
        queryClient.invalidateQueries({ queryKey: ["mockup-stats"] })
      }
      queryClient.invalidateQueries({ queryKey: ["mockup-pending-changes"] })
    },
  })

  const clearFailedMutation = useMutation({
    mutationFn: clearFailedChanges,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mockup-pending-changes"] })
    },
  })

  const retryMutation = useMutation({
    mutationFn: retryChange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mockup-pending-changes"] })
      triggerSync()
    },
  })

  return {
    isOnline,
    isSyncing: isSyncing || syncMutation.isPending,
    pendingCount: 0, // Will be populated by usePendingChanges
    sync: triggerSync,
    syncMutation,
    clearFailed: clearFailedMutation.mutate,
    retryChange: retryMutation.mutate,
  }
}

// ============================================================================
// Helper Hook for useState (needed for sync hook)
// ============================================================================

import { useState } from "react"
