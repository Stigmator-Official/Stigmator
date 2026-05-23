/**
 * Cache Manager
 * 
 * Unified interface for managing both model and texture caches.
 * Provides utilities for settings panels, analytics, and cache maintenance.
 */

import { modelCache, type ModelCacheStats } from './model-cache'
import { textureCache, type TextureCacheStats } from './texture-cache'

// ============================================================================
// Types & Interfaces
// ============================================================================

interface CacheSummary {
  memoryUsed: string
  storageUsed: string
  memoryUsedBytes: number
  storageUsedBytes: number
  totalModels: number
  totalTextures: number
  hitRate: number
  isHealthy: boolean
}

interface DetailedCacheStats {
  models: ModelCacheStats
  textures: TextureCacheStats
  summary: CacheSummary
  timestamp: string
}

interface CacheHealthStatus {
  healthy: boolean
  issues: string[]
  recommendations: string[]
}

interface CacheLimits {
  memoryMB: number
  storageMB: number
}

// ============================================================================
// Constants
// ============================================================================

const BYTES_PER_MB = 1024 * 1024
const BYTES_PER_GB = 1024 * 1024 * 1024

// Health thresholds
const HEALTH_THRESHOLDS = {
  maxHitRate: 0.95,
  minHitRate: 0.5,
  maxMemoryPercent: 0.9,
  maxStoragePercent: 0.9,
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format bytes to human-readable string.
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format percentage to string.
 */
function formatPercent(value: number): string {
  return (value * 100).toFixed(1) + '%'
}

/**
 * Format number with commas.
 */
function formatNumber(num: number): string {
  return num.toLocaleString()
}

// ============================================================================
// Cache Manager Functions
// ============================================================================

/**
 * Get a summary of cache status for the settings panel.
 * 
 * @example
 * ```typescript
 * const summary = getCacheSummary()
 * console.log(`Memory: ${summary.memoryUsed}`)
 * console.log(`Models: ${summary.totalModels}`)
 * ```
 */
export function getCacheSummary(): CacheSummary {
  const modelStats = modelCache.getStats()
  const textureStats = textureCache.getStats()
  
  // Get storage usage (async, use last known or estimate)
  const memoryUsedBytes = modelStats.memoryUsed + textureStats.totalSize
  const storageUsedBytes = modelStats.storageUsed
  
  // Calculate overall hit rate
  const totalHits = modelStats.hits
  const totalMisses = modelStats.misses
  const hitRate = totalHits + totalMisses > 0 
    ? totalHits / (totalHits + totalMisses) 
    : 0

  // Health check
  const isHealthy = hitRate >= HEALTH_THRESHOLDS.minHitRate

  return {
    memoryUsed: formatBytes(memoryUsedBytes),
    storageUsed: formatBytes(storageUsedBytes),
    memoryUsedBytes,
    storageUsedBytes,
    totalModels: modelStats.memoryEntries + modelStats.storageEntries,
    totalTextures: textureStats.totalTextures,
    hitRate,
    isHealthy,
  }
}

/**
 * Get detailed cache statistics.
 * 
 * @example
 * ```typescript
 * const stats = await getDetailedStats()
 * console.log(stats.models.hitRate)
 * console.log(stats.textures.totalSize)
 * ```
 */
export async function getDetailedStats(): Promise<DetailedCacheStats> {
  const [modelStats, textureStats] = await Promise.all([
    modelCache.getDetailedStats(),
    Promise.resolve(textureCache.getStats()),
  ])

  return {
    models: modelStats,
    textures: textureStats,
    summary: getCacheSummary(),
    timestamp: new Date().toISOString(),
  }
}

/**
 * Clear all caches (models and textures).
 * Useful for settings panel "Clear Cache" button.
 * 
 * @example
 * ```typescript
 * // In settings panel
 * async function handleClearCache() {
 *   await clearAllCaches()
 *   toast.success('Cache cleared successfully')
 * }
 * ```
 */
export async function clearAllCaches(): Promise<void> {
  await Promise.all([
    modelCache.clear(),
    Promise.resolve(textureCache.clear()),
  ])
  
  console.log('[CacheManager] All caches cleared')
}

/**
 * Clear only model cache.
 */
export async function clearModelCache(): Promise<void> {
  await modelCache.clear()
  console.log('[CacheManager] Model cache cleared')
}

/**
 * Clear only texture cache.
 */
export function clearTextureCache(): void {
  textureCache.clear()
  console.log('[CacheManager] Texture cache cleared')
}

/**
 * Configure cache size limits.
 * 
 * @example
 * ```typescript
 * // In settings panel
 * setCacheLimits({
 *   memoryMB: 100,   // 100MB memory cache
 *   storageMB: 500,  // 500MB persistent storage
 * })
 * ```
 */
export function setCacheLimits(limits: Partial<CacheLimits>): void {
  if (limits.memoryMB !== undefined) {
    modelCache.setLimits({ memoryMB: limits.memoryMB })
  }
  
  // Texture cache limits are currently fixed
  console.log('[CacheManager] Cache limits updated:', limits)
}

/**
 * Get current cache limits.
 */
export function getCacheLimits(): Required<CacheLimits> {
  // Return defaults since individual caches manage their own limits
  return {
    memoryMB: 50,
    storageMB: 200,
  }
}

/**
 * Export cache statistics for analytics.
 * Returns a serializable object suitable for logging or API submission.
 * 
 * @example
 * ```typescript
 * // Send to analytics
 * const stats = exportCacheStats()
 * analytics.track('cache_stats', stats)
 * ```
 */
export function exportCacheStats(): object {
  const modelStats = modelCache.getStats()
  const textureStats = textureCache.getStats()
  const summary = getCacheSummary()

  return {
    timestamp: new Date().toISOString(),
    cache: {
      models: {
        memory: {
          entries: modelStats.memoryEntries,
          sizeBytes: modelStats.memoryUsed,
          sizeFormatted: formatBytes(modelStats.memoryUsed),
        },
        storage: {
          entries: modelStats.storageEntries,
          sizeBytes: modelStats.storageUsed,
          sizeFormatted: formatBytes(modelStats.storageUsed),
        },
        performance: {
          hits: modelStats.hits,
          misses: modelStats.misses,
          hitRate: modelStats.hitRate,
          hitRateFormatted: formatPercent(modelStats.hitRate),
          evictions: modelStats.evictions,
        },
      },
      textures: {
        entries: textureStats.totalTextures,
        sizeBytes: textureStats.totalSize,
        sizeFormatted: formatBytes(textureStats.totalSize),
        activeReferences: textureStats.activeReferences,
        peak: {
          entries: textureStats.peakTextures,
          sizeBytes: textureStats.peakSize,
          sizeFormatted: formatBytes(textureStats.peakSize),
        },
      },
    },
    summary: {
      totalMemoryUsed: summary.memoryUsed,
      totalStorageUsed: summary.storageUsed,
      totalEntries: summary.totalModels + summary.totalTextures,
      overallHealth: summary.isHealthy ? 'healthy' : 'needs_attention',
    },
  }
}

/**
 * Check cache health status and get recommendations.
 * 
 * @example
 * ```typescript
 * const health = checkCacheHealth()
 * if (!health.healthy) {
 *   console.warn('Cache issues:', health.issues)
 *   console.log('Recommendations:', health.recommendations)
 * }
 * ```
 */
export function checkCacheHealth(): CacheHealthStatus {
  const issues: string[] = []
  const recommendations: string[] = []
  
  const modelStats = modelCache.getStats()
  const textureStats = textureCache.getStats()
  const summary = getCacheSummary()

  // Check model cache hit rate
  if (modelStats.hitRate < HEALTH_THRESHOLDS.minHitRate) {
    issues.push(`Low model cache hit rate: ${formatPercent(modelStats.hitRate)}`)
    recommendations.push('Consider increasing memory cache size')
    recommendations.push('Check if models are being properly cached')
  }

  // Check memory usage
  const memoryLimit = 50 * BYTES_PER_MB // Default limit
  const memoryUsagePercent = summary.memoryUsedBytes / memoryLimit
  
  if (memoryUsagePercent > HEALTH_THRESHOLDS.maxMemoryPercent) {
    issues.push(`High memory usage: ${formatPercent(memoryUsagePercent)}`)
    recommendations.push('Consider clearing cache or increasing memory limit')
  }

  // Check texture references
  if (textureStats.activeReferences === 0 && textureStats.totalTextures > 10) {
    recommendations.push('Many textures cached but none in use - consider cleanup')
  }

  // Check for excessive evictions
  if (modelStats.evictions > modelStats.hits * 0.1) {
    issues.push(`High eviction rate: ${modelStats.evictions} evictions`)
    recommendations.push('Increase memory cache limit to reduce evictions')
  }

  return {
    healthy: issues.length === 0,
    issues,
    recommendations,
  }
}

/**
 * Run cache maintenance tasks.
 * Should be called periodically (e.g., on app background/idle).
 * 
 * @example
 * ```typescript
 * // In useEffect or service worker
 * useEffect(() => {
 *   const interval = setInterval(() => {
 *     performCacheMaintenance()
 *   }, 5 * 60 * 1000) // Every 5 minutes
 *   
 *   return () => clearInterval(interval)
 * }, [])
 * ```
 */
export async function performCacheMaintenance(): Promise<void> {
  // Clean up expired models
  await modelCache.cleanupExpired()
  
  // Clean up unused textures (older than 10 minutes)
  textureCache.cleanup(10 * 60 * 1000)
  
  console.log('[CacheManager] Maintenance completed')
}

/**
 * Preload common assets into cache.
 * Call this on app initialization or when navigating to mockup editor.
 * 
 * @example
 * ```typescript
 * // On app start
 * await preloadCommonAssets([
 *   '/models/tshirt.glb',
 *   '/models/hoodie.glb',
 * ])
 * ```
 */
export async function preloadCommonAssets(
  modelUrls: string[] = [],
  textureUrls: string[] = []
): Promise<{ models: number; textures: number }> {
  const results = { models: 0, textures: 0 }

  // Preload models
  for (const url of modelUrls) {
    try {
      await modelCache.load(url)
      results.models++
    } catch (error) {
      console.warn(`[CacheManager] Failed to preload model: ${url}`, error)
    }
  }

  // Preload textures
  if (textureUrls.length > 0) {
    try {
      await textureCache.preload(textureUrls)
      results.textures = textureUrls.length
    } catch (error) {
      console.warn('[CacheManager] Failed to preload textures:', error)
    }
  }

  console.log('[CacheManager] Preloaded:', results)
  return results
}

// ============================================================================
// React Hook for Settings Panel
// ============================================================================

/**
 * React hook for cache management in settings panel.
 * Note: This is a type definition - actual hook implementation would be in a separate file.
 * 
 * @example
 * ```typescript
 * // In settings component
 * import { useCacheManager } from '@/lib/mockup/cache-manager'
 * 
 * function CacheSettings() {
 *   const { summary, clearAll, setLimits } = useCacheManager()
 *   
 *   return (
 *     <div>
 *       <p>Memory: {summary.memoryUsed}</p>
 *       <p>Models: {summary.totalModels}</p>
 *       <button onClick={clearAll}>Clear Cache</button>
 *     </div>
 *   )
 * }
 * ```
 */
export interface UseCacheManagerReturn {
  summary: CacheSummary
  isLoading: boolean
  clearAll: () => Promise<void>
  clearModels: () => Promise<void>
  clearTextures: () => void
  setLimits: (limits: Partial<CacheLimits>) => void
  refresh: () => void
}

// ============================================================================
// Default Export
// ============================================================================

/**
 * Cache manager for Stigmator's mockup generator.
 * 
 * Provides a unified interface for:
 * - Monitoring cache usage and health
 * - Configuring cache limits
 * - Clearing caches
 * - Exporting statistics for analytics
 * 
 * @example
 * ```typescript
 * import { cacheManager } from '@/lib/mockup/cache-manager'
 * 
 * // Get cache summary for settings panel
 * const summary = cacheManager.getSummary()
 * 
 * // Clear all caches
 * await cacheManager.clearAll()
 * 
 * // Set cache limits
 * cacheManager.setLimits({ memoryMB: 100 })
 * ```
 */
export const cacheManager = {
  /**
   * Get cache summary for display in settings panel.
   */
  getSummary: getCacheSummary,

  /**
   * Get detailed cache statistics.
   */
  getDetailedStats,

  /**
   * Clear all caches (models and textures).
   */
  clearAll: clearAllCaches,

  /**
   * Clear only model cache.
   */
  clearModels: clearModelCache,

  /**
   * Clear only texture cache.
   */
  clearTextures: clearTextureCache,

  /**
   * Set cache size limits.
   */
  setLimits: setCacheLimits,

  /**
   * Get current cache limits.
   */
  getLimits: getCacheLimits,

  /**
   * Export cache statistics for analytics.
   */
  exportStats: exportCacheStats,

  /**
   * Check cache health status.
   */
  checkHealth: checkCacheHealth,

  /**
   * Perform maintenance tasks.
   */
  performMaintenance: performCacheMaintenance,

  /**
   * Preload common assets.
   */
  preloadAssets: preloadCommonAssets,

  /**
   * Format bytes for display.
   */
  formatBytes,

  /**
   * Format percentage for display.
   */
  formatPercent,
} as const

// Export types for consumers
export type { 
  CacheSummary, 
  DetailedCacheStats, 
  CacheHealthStatus, 
  CacheLimits,
  ModelCacheStats,
  TextureCacheStats,
}
