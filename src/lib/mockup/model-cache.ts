/**
 * Model Cache System
 * 
 * Multi-tier caching for 3D models with memory (LRU) and IndexedDB (persistent) storage.
 * Optimized for garment mockup models to reduce loading times and network requests.
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// ============================================================================
// Types & Interfaces
// ============================================================================

interface CacheEntry<T> {
  data: T
  timestamp: number
  size: number
  accessCount: number
  lastAccessed: number
  ttl?: number // Time-to-live in milliseconds
}

interface SerializedModel {
  json: object
  metadata: {
    url: string
    timestamp: number
    size: number
    boundingBox: {
      min: { x: number; y: number; z: number }
      max: { x: number; y: number; z: number }
    }
  }
}

interface ModelCacheStats {
  memoryUsed: number
  storageUsed: number
  memoryEntries: number
  storageEntries: number
  hits: number
  misses: number
  hitRate: number
  evictions: number
}

interface CacheLimits {
  memoryMB: number
  storageMB: number
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_LIMITS: CacheLimits = {
  memoryMB: 50,
  storageMB: 200,
}

const DB_NAME = 'StigmatorModelCache'
const DB_VERSION = 1
const STORE_NAME = 'models'
const METADATA_STORE = 'metadata'

const BYTES_PER_MB = 1024 * 1024
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

// ============================================================================
// Cache State
// ============================================================================

class ModelCacheImpl {
  // Memory cache (LRU)
  private memory: Map<string, CacheEntry<THREE.Group>> = new Map()
  
  // IndexedDB connection
  private indexedDB: IDBDatabase | null = null
  private dbReady: Promise<void> | null = null
  
  // Metadata
  private totalMemorySize: number = 0
  private hits: number = 0
  private misses: number = 0
  private evictions: number = 0
  
  // Limits
  private limits: CacheLimits = { ...DEFAULT_LIMITS }
  
  // GLTF loader with DRACO support
  private gltfLoader: GLTFLoader

  constructor() {
    this.gltfLoader = this.createLoader()
    this.initIndexedDB()
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  private createLoader(): GLTFLoader {
    const loader = new GLTFLoader()
    
    // Set up DRACO compression support
    const dracoLoader = new DRACOLoader()
    // Use CDN for DRACO decoder in production, local files in development
    if (typeof window !== 'undefined') {
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
      loader.setDRACOLoader(dracoLoader)
    }
    
    return loader
  }

  private initIndexedDB(): void {
    if (typeof window === 'undefined') return
    
    this.dbReady = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => {
        console.warn('[ModelCache] IndexedDB initialization failed:', request.error)
        this.indexedDB = null
        resolve() // Continue without IndexedDB
      }
      
      request.onsuccess = () => {
        this.indexedDB = request.result
        console.log('[ModelCache] IndexedDB initialized successfully')
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Store for serialized models
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('size', 'size', { unique: false })
        }
        
        // Store for cache metadata
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE, { keyPath: 'key' })
        }
      }
    })
  }

  private async waitForDB(): Promise<void> {
    if (this.dbReady) {
      await this.dbReady
    }
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  /**
   * Get a model from cache. Tries memory first, then IndexedDB, then fetches from URL.
   */
  async get(key: string): Promise<THREE.Group | null> {
    // Check memory cache first
    const memoryEntry = this.memory.get(key)
    if (memoryEntry) {
      if (this.isExpired(memoryEntry)) {
        this.memory.delete(key)
        this.totalMemorySize -= memoryEntry.size
        this.evictions++
      } else {
        // Update LRU stats
        memoryEntry.accessCount++
        memoryEntry.lastAccessed = Date.now()
        this.hits++
        return memoryEntry.data.clone(true)
      }
    }

    // Try IndexedDB
    const dbEntry = await this.getFromIndexedDB(key)
    if (dbEntry) {
      // Restore to memory cache
      const entry: CacheEntry<THREE.Group> = {
        data: dbEntry,
        timestamp: Date.now(),
        size: this.estimateSize(dbEntry),
        accessCount: 1,
        lastAccessed: Date.now(),
      }
      
      this.addToMemory(key, entry)
      this.hits++
      return dbEntry.clone(true)
    }

    this.misses++
    return null
  }

  /**
   * Store a model in cache.
   */
  async set(key: string, model: THREE.Group, ttl?: number): Promise<void> {
    const size = this.estimateSize(model)
    const entry: CacheEntry<THREE.Group> = {
      data: model.clone(true),
      timestamp: Date.now(),
      size,
      accessCount: 0,
      lastAccessed: Date.now(),
      ttl: ttl ?? DEFAULT_TTL,
    }

    // Add to memory cache
    this.addToMemory(key, entry)

    // Persist to IndexedDB
    await this.saveToIndexedDB(key, model)
  }

  /**
   * Load and cache a model from URL.
   */
  async load(url: string, ttl?: number): Promise<THREE.Group> {
    // Try cache first
    const cached = await this.get(url)
    if (cached) {
      return cached
    }

    // Load from network
    try {
      const gltf = await this.gltfLoader.loadAsync(url)
      const model = gltf.scene

      // Compute bounding box for metadata
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)

      // Normalize model scale
      if (maxDim > 0) {
        const scale = 2 / maxDim
        model.scale.setScalar(scale)
      }

      // Center the model
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)

      // Enable shadows
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      // Cache the model
      await this.set(url, model, ttl)

      return model
    } catch (error) {
      console.error(`[ModelCache] Failed to load model from ${url}:`, error)
      throw error
    }
  }

  /**
   * Check if a model exists in cache.
   */
  async has(key: string): Promise<boolean> {
    // Check memory
    if (this.memory.has(key)) {
      const entry = this.memory.get(key)!
      if (!this.isExpired(entry)) {
        return true
      }
    }

    // Check IndexedDB
    await this.waitForDB()
    if (!this.indexedDB) return false

    return new Promise((resolve) => {
      const transaction = this.indexedDB!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result !== undefined)
      }
      request.onerror = () => resolve(false)
    })
  }

  /**
   * Delete a specific entry from cache.
   */
  async delete(key: string): Promise<void> {
    // Remove from memory
    const memoryEntry = this.memory.get(key)
    if (memoryEntry) {
      this.totalMemorySize -= memoryEntry.size
      this.disposeModel(memoryEntry.data)
      this.memory.delete(key)
    }

    // Remove from IndexedDB
    await this.waitForDB()
    if (!this.indexedDB) return

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction([STORE_NAME, METADATA_STORE], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const metaStore = transaction.objectStore(METADATA_STORE)

      store.delete(key)
      metaStore.delete(key)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  /**
   * Clear all cached models.
   */
  async clear(): Promise<void> {
    // Clear memory
    for (const [key, entry] of this.memory) {
      this.disposeModel(entry.data)
    }
    this.memory.clear()
    this.totalMemorySize = 0

    // Clear IndexedDB
    await this.waitForDB()
    if (!this.indexedDB) return

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction([STORE_NAME, METADATA_STORE], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const metaStore = transaction.objectStore(METADATA_STORE)

      store.clear()
      metaStore.clear()

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  /**
   * Get cache statistics.
   */
  getStats(): ModelCacheStats {
    const total = this.hits + this.misses
    const hitRate = total > 0 ? this.hits / total : 0

    return {
      memoryUsed: this.totalMemorySize,
      storageUsed: 0, // Calculated on demand
      memoryEntries: this.memory.size,
      storageEntries: 0, // Calculated on demand
      hits: this.hits,
      misses: this.misses,
      hitRate,
      evictions: this.evictions,
    }
  }

  /**
   * Get detailed cache statistics including storage.
   */
  async getDetailedStats(): Promise<ModelCacheStats> {
    const stats = this.getStats()
    
    await this.waitForDB()
    if (this.indexedDB) {
      const storageStats = await this.calculateStorageStats()
      stats.storageUsed = storageStats.used
      stats.storageEntries = storageStats.entries
    }

    return stats
  }

  /**
   * Set cache size limits.
   */
  setLimits(limits: Partial<CacheLimits>): void {
    this.limits = { ...this.limits, ...limits }
    
    // Trigger eviction if new limits are exceeded
    const memoryLimitBytes = this.limits.memoryMB * BYTES_PER_MB
    if (this.totalMemorySize > memoryLimitBytes) {
      this.evictLRU(memoryLimitBytes * 0.8) // Target 80% of limit
    }
  }

  /**
   * Evict least recently used entries to meet target size.
   */
  async evictLRU(targetSize: number): Promise<void> {
    const entries: Array<[string, CacheEntry<THREE.Group>]> = []
    this.memory.forEach((value, key) => {
      entries.push([key, value])
    })
    
    // Sort by last accessed (oldest first)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)

    for (const [key, entry] of entries) {
      if (this.totalMemorySize <= targetSize) break

      this.totalMemorySize -= entry.size
      this.disposeModel(entry.data)
      this.memory.delete(key)
      this.evictions++
      
      console.log(`[ModelCache] Evicted ${key} from memory`)
    }
  }

  /**
   * Remove expired entries from cache.
   */
  async cleanupExpired(): Promise<void> {
    const now = Date.now()
    
    // Clean memory
    const keysToDelete: string[] = []
    this.memory.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        this.totalMemorySize -= entry.size
        this.disposeModel(entry.data)
        keysToDelete.push(key)
        this.evictions++
      }
    })
    keysToDelete.forEach(key => this.memory.delete(key))

    // Clean IndexedDB
    await this.waitForDB()
    if (!this.indexedDB) return

    const transaction = this.indexedDB.transaction([STORE_NAME, METADATA_STORE], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const metaStore = transaction.objectStore(METADATA_STORE)
    const index = store.index('timestamp')

    const request = index.openCursor()
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        const entry = cursor.value as SerializedModel
        const age = now - entry.metadata.timestamp
        
        if (age > DEFAULT_TTL) {
          store.delete(cursor.primaryKey)
          metaStore.delete(cursor.primaryKey as string)
          console.log(`[ModelCache] Removed expired entry: ${cursor.primaryKey}`)
        }
        
        cursor.continue()
      }
    }
  }

  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  private isExpired(entry: CacheEntry<unknown>): boolean {
    if (!entry.ttl) return false
    return Date.now() - entry.timestamp > entry.ttl
  }

  private addToMemory(key: string, entry: CacheEntry<THREE.Group>): void {
    const memoryLimitBytes = this.limits.memoryMB * BYTES_PER_MB

    // Check if adding this would exceed limit
    while (this.totalMemorySize + entry.size > memoryLimitBytes && this.memory.size > 0) {
      this.evictLRU(this.totalMemorySize - entry.size)
    }

    this.memory.set(key, entry)
    this.totalMemorySize += entry.size
  }

  private async getFromIndexedDB(key: string): Promise<THREE.Group | null> {
    await this.waitForDB()
    if (!this.indexedDB) return null

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(key)

      request.onsuccess = () => {
        if (!request.result) {
          resolve(null)
          return
        }

        try {
          const serialized = request.result as SerializedModel
          const model = this.deserializeModel(serialized)
          resolve(model)
        } catch (error) {
          console.error('[ModelCache] Failed to deserialize model:', error)
          resolve(null)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  private async saveToIndexedDB(key: string, model: THREE.Group): Promise<void> {
    await this.waitForDB()
    if (!this.indexedDB) return

    try {
      const serialized = this.serializeModel(key, model)
      
      return new Promise((resolve, reject) => {
        const transaction = this.indexedDB!.transaction([STORE_NAME, METADATA_STORE], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const metaStore = transaction.objectStore(METADATA_STORE)

        store.put(serialized)
        metaStore.put({
          key,
          timestamp: Date.now(),
          size: serialized.metadata.size,
        })

        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      })
    } catch (error) {
      console.warn('[ModelCache] Failed to persist to IndexedDB:', error)
    }
  }

  private serializeModel(key: string, model: THREE.Group): SerializedModel {
    const box = new THREE.Box3().setFromObject(model)
    
    return {
      json: model.toJSON(),
      metadata: {
        url: key,
        timestamp: Date.now(),
        size: this.estimateSize(model),
        boundingBox: {
          min: { x: box.min.x, y: box.min.y, z: box.min.z },
          max: { x: box.max.x, y: box.max.y, z: box.max.z },
        },
      },
    }
  }

  private deserializeModel(serialized: SerializedModel): THREE.Group {
    const loader = new THREE.ObjectLoader()
    const object = loader.parse(serialized.json)
    
    // Ensure it's a Group
    if (!(object instanceof THREE.Group)) {
      const group = new THREE.Group()
      group.add(object)
      return group
    }
    
    return object
  }

  private estimateSize(model: THREE.Group): number {
    let size = 0
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Estimate geometry size
        if (child.geometry) {
          const pos = child.geometry.attributes.position
          if (pos) {
            size += pos.count * pos.itemSize * 4 // 4 bytes per float
          }
          
          const normal = child.geometry.attributes.normal
          if (normal) {
            size += normal.count * normal.itemSize * 4
          }
          
          const uv = child.geometry.attributes.uv
          if (uv) {
            size += uv.count * uv.itemSize * 4
          }
          
          // Index buffer
          if (child.geometry.index) {
            size += child.geometry.index.count * 4
          }
        }
        
        // Estimate material size
        if (child.material) {
          size += 1024 // Rough estimate for material
        }
      }
    })
    
    return Math.max(size, 1024) // Minimum 1KB
  }

  private disposeModel(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose()
        }
        
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              this.disposeMaterial(mat)
            })
          } else {
            this.disposeMaterial(child.material)
          }
        }
      }
    })
  }

  private disposeMaterial(material: THREE.Material): void {
    // Dispose textures
    const mat = material as THREE.MeshStandardMaterial
    if (mat.map) mat.map.dispose()
    if (mat.normalMap) mat.normalMap.dispose()
    if (mat.roughnessMap) mat.roughnessMap.dispose()
    if (mat.metalnessMap) mat.metalnessMap.dispose()
    if (mat.aoMap) mat.aoMap.dispose()
    if (mat.emissiveMap) mat.emissiveMap.dispose()
    
    material.dispose()
  }

  private async calculateStorageStats(): Promise<{ used: number; entries: number }> {
    if (!this.indexedDB) return { used: 0, entries: 0 }

    return new Promise((resolve) => {
      const transaction = this.indexedDB!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const entries = request.result as SerializedModel[]
        const used = entries.reduce((sum, entry) => sum + (entry.metadata?.size || 0), 0)
        resolve({ used, entries: entries.length })
      }

      request.onerror = () => resolve({ used: 0, entries: 0 })
    })
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

const cacheInstance = new ModelCacheImpl()

/**
 * Model cache interface for storing and retrieving 3D garment models.
 * 
 * Features:
 * - Two-tier caching: Memory (LRU) + IndexedDB (persistent)
 * - Automatic size estimation and limits
 * - TTL-based expiration
 * - Cache hit/miss tracking
 * 
 * @example
 * ```typescript
 * // Load and cache a model
 * const model = await modelCache.load('/models/tshirt.glb')
 * 
 * // Check if cached
 * if (await modelCache.has('/models/tshirt.glb')) {
 *   const cached = await modelCache.get('/models/tshirt.glb')
 * }
 * 
 * // Get statistics
 * const stats = modelCache.getStats()
 * console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`)
 * ```
 */
export const modelCache = {
  /**
   * Get a model from cache (memory or IndexedDB).
   * Returns a cloned instance - safe to modify without affecting cache.
   */
  get: (key: string) => cacheInstance.get(key),

  /**
   * Store a model in cache.
   * @param key - Unique identifier (usually URL)
   * @param model - THREE.Group to cache
   * @param ttl - Optional time-to-live in milliseconds
   */
  set: (key: string, model: THREE.Group, ttl?: number) => cacheInstance.set(key, model, ttl),

  /**
   * Load a model from URL with automatic caching.
   * This is the recommended way to load models.
   */
  load: (url: string, ttl?: number) => cacheInstance.load(url, ttl),

  /**
   * Check if a model exists in cache.
   */
  has: (key: string) => cacheInstance.has(key),

  /**
   * Remove a specific model from cache.
   */
  delete: (key: string) => cacheInstance.delete(key),

  /**
   * Clear all cached models.
   */
  clear: () => cacheInstance.clear(),

  /**
   * Get cache statistics.
   */
  getStats: () => cacheInstance.getStats(),

  /**
   * Get detailed statistics including storage usage.
   */
  getDetailedStats: () => cacheInstance.getDetailedStats(),

  /**
   * Evict least recently used entries to meet target size.
   * @param targetSize - Target size in bytes
   */
  evictLRU: (targetSize: number) => cacheInstance.evictLRU(targetSize),

  /**
   * Remove expired entries from cache.
   */
  cleanupExpired: () => cacheInstance.cleanupExpired(),

  /**
   * Set cache size limits.
   */
  setLimits: (limits: Partial<CacheLimits>) => cacheInstance.setLimits(limits),
} as const

// Export types for consumers
export type { ModelCacheStats, CacheLimits }
