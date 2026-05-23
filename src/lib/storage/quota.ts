import { createClientBrowser } from '@/lib/supabase/client'
import { STORAGE_LIMITS } from './index'

export interface QuotaInfo {
  usedBytes: number
  totalBytes: number
  availableBytes: number
  percentUsed: number
}

interface BucketStats {
  name: string
  size: number
}

const supabase = createClientBrowser()

/**
 * Get artist's storage quota information
 */
export async function getArtistQuota(artistId?: string): Promise<QuotaInfo> {
  // Get current user if artistId not provided
  let targetArtistId = artistId
  
  if (!targetArtistId) {
    const { data: { user } } = await supabase.auth.getUser()
    targetArtistId = user?.id
  }

  if (!targetArtistId) {
    throw new Error('Artist ID required')
  }

  // Get storage usage from database function
  const { data, error } = await supabase
    .rpc('get_artist_storage_usage', {
      artist_id: targetArtistId,
    })

  if (error) {
    throw new Error(`Failed to get quota: ${error.message}`)
  }

  const usedBytes = data || 0
  const totalBytes = STORAGE_LIMITS.TOTAL_ARTIST_QUOTA

  return {
    usedBytes,
    totalBytes,
    availableBytes: Math.max(0, totalBytes - usedBytes),
    percentUsed: Math.min(100, (usedBytes / totalBytes) * 100),
  }
}

/**
 * Check if upload would exceed quota
 */
export async function checkQuota(
  fileSize: number,
  artistId?: string
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const quota = await getArtistQuota(artistId)
    
    return {
      allowed: fileSize <= quota.availableBytes,
      remaining: quota.availableBytes,
    }
  } catch {
    // If we can't check quota, assume it's allowed
    return {
      allowed: true,
      remaining: STORAGE_LIMITS.TOTAL_ARTIST_QUOTA,
    }
  }
}

/**
 * Get storage breakdown by bucket
 */
export async function getStorageBreakdown(
  artistId?: string
): Promise<Record<string, number>> {
  let targetArtistId = artistId
  
  if (!targetArtistId) {
    const { data: { user } } = await supabase.auth.getUser()
    targetArtistId = user?.id
  }

  if (!targetArtistId) {
    throw new Error('Artist ID required')
  }

  const { data, error } = await supabase
    .rpc('get_artist_storage_breakdown', {
      artist_id: targetArtistId,
    })

  if (error) {
    throw new Error(`Failed to get breakdown: ${error.message}`)
  }

  // Convert array to record
  const breakdown: Record<string, number> = {}
  
  if (data) {
    for (const item of data as BucketStats[]) {
      breakdown[item.name] = item.size
    }
  }

  return breakdown
}

/**
 * Clean up old temp files
 */
export async function cleanupTempFiles(olderThanDays: number = 7): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
  const cutoffTimestamp = cutoffDate.getTime()

  // List all files in temp bucket
  const { data: files, error: listError } = await supabase
    .storage
    .from('temp')
    .list()

  if (listError) {
    throw new Error(`Failed to list temp files: ${listError.message}`)
  }

  if (!files || files.length === 0) {
    return 0
  }

  // Filter files older than cutoff
  const oldFiles = files.filter((file: { name: string; created_at?: string }) => {
    const createdAt = new Date(file.created_at || 0).getTime()
    return createdAt < cutoffTimestamp
  })

  if (oldFiles.length === 0) {
    return 0
  }

  // Delete old files
  const pathsToDelete = oldFiles.map((file: { name: string }) => file.name)
  
  const { error: deleteError } = await supabase
    .storage
    .from('temp')
    .remove(pathsToDelete)

  if (deleteError) {
    throw new Error(`Failed to delete temp files: ${deleteError.message}`)
  }

  return oldFiles.length
}

/**
 * Get file size limit for bucket
 */
export function getBucketSizeLimit(bucket: string): number {
  switch (bucket) {
    case 'designs':
      return STORAGE_LIMITS.MAX_DESIGN_SIZE
    case 'mockups':
      return STORAGE_LIMITS.MAX_MOCKUP_SIZE
    case 'garment-models':
    case 'models':
      return STORAGE_LIMITS.MAX_MODEL_SIZE
    default:
      return STORAGE_LIMITS.MAX_DESIGN_SIZE
  }
}

/**
 * Validate file size against bucket limit
 */
export function validateFileSize(
  fileSize: number,
  bucket: string
): { valid: boolean; maxSize: number; error?: string } {
  const maxSize = getBucketSizeLimit(bucket)
  
  if (fileSize > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(1)
    
    return {
      valid: false,
      maxSize,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed (${maxSizeMB}MB)`,
    }
  }

  return { valid: true, maxSize }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Subscribe to quota updates (realtime)
 */
export function subscribeToQuotaUpdates(
  artistId: string,
  callback: (quota: QuotaInfo) => void
) {
  const channel = supabase
    .channel(`storage_quota:${artistId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'storage_usage',
        filter: `artist_id=eq.${artistId}`,
      },
      async () => {
        // Fetch updated quota
        const quota = await getArtistQuota(artistId)
        callback(quota)
      }
    )
    .subscribe()

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel)
    },
  }
}
