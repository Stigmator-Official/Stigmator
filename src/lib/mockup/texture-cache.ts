/**
 * Texture Cache System
 * 
 * Specialized caching for textures with automatic resizing, reference counting,
 * and optimized memory management. Designed for design textures in mockup generation.
 */

import * as THREE from 'three'

// ============================================================================
// Types & Interfaces
// ============================================================================

interface TextureCacheEntry {
  texture: THREE.Texture
  width: number
  height: number
  format: THREE.PixelFormat
  referenceCount: number
  lastUsed: number
  url: string
  estimatedSize: number
}

interface TextureCacheStats {
  totalTextures: number
  totalSize: number
  activeReferences: number
  peakTextures: number
  peakSize: number
}

interface TextureLoadOptions {
  maxSize?: number
  anisotropy?: number
  colorSpace?: THREE.ColorSpace
  generateMipmaps?: boolean
  flipY?: boolean
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_OPTIONS: Required<TextureLoadOptions> = {
  maxSize: 2048,
  anisotropy: 16,
  colorSpace: THREE.SRGBColorSpace,
  generateMipmaps: true,
  flipY: false,
}

const MAX_CACHE_SIZE = 100 * 1024 * 1024 // 100MB max
const MAX_TEXTURE_SIZE = 4096

// ============================================================================
// Texture Cache Implementation
// ============================================================================

class TextureCacheImpl {
  private cache: Map<string, TextureCacheEntry> = new Map()
  private loader: THREE.TextureLoader
  private totalSize: number = 0
  private peakTextures: number = 0
  private peakSize: number = 0

  constructor() {
    this.loader = new THREE.TextureLoader()
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  /**
   * Load a texture with automatic caching and resizing.
   * Returns a texture instance - reference count is incremented.
   * Call `release()` when done to decrement reference count.
   */
  async load(url: string, options: TextureLoadOptions = {}): Promise<THREE.Texture> {
    const opts = { ...DEFAULT_OPTIONS, ...options }

    // Check cache first
    const cached = this.cache.get(url)
    if (cached) {
      cached.referenceCount++
      cached.lastUsed = Date.now()
      return cached.texture.clone()
    }

    // Load from URL
    try {
      const texture = await this.loadTexture(url, opts)
      const entry = this.createEntry(url, texture, opts)
      this.addToCache(url, entry)
      
      return texture.clone()
    } catch (error) {
      console.error(`[TextureCache] Failed to load texture from ${url}:`, error)
      throw error
    }
  }

  /**
   * Create a texture from a Blob or File.
   * Useful for user-uploaded designs.
   */
  async fromBlob(blob: Blob, options: TextureLoadOptions = {}): Promise<THREE.Texture> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob)
      
      this.loader.load(
        url,
        (texture) => {
          // Revoke object URL to free memory
          URL.revokeObjectURL(url)
          
          // Process texture
          this.processTexture(texture, opts)
          
          // Create temporary entry (not cached since blob URL is temporary)
          const entry = this.createEntry('blob:' + blob.size, texture, opts)
          entry.referenceCount = 1
          
          resolve(texture.clone())
        },
        undefined,
        (error) => {
          URL.revokeObjectURL(url)
          reject(error)
        }
      )
    })
  }

  /**
   * Create a texture from a data URL.
   * Useful for canvas-generated designs.
   */
  async fromDataURL(dataUrl: string, options: TextureLoadOptions = {}): Promise<THREE.Texture> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    
    return new Promise((resolve, reject) => {
      this.loader.load(
        dataUrl,
        (texture) => {
          this.processTexture(texture, opts)
          resolve(texture.clone())
        },
        undefined,
        reject
      )
    })
  }

  /**
   * Create a texture from an ImageBitmap.
   * Most efficient for large images.
   */
  async fromImageBitmap(bitmap: ImageBitmap, options: TextureLoadOptions = {}): Promise<THREE.Texture> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    
    const texture = new THREE.CanvasTexture(bitmap)
    this.processTexture(texture, opts)
    
    return texture
  }

  /**
   * Release a reference to a texture.
   * When reference count reaches 0, the texture is disposed.
   */
  release(url: string): void {
    const entry = this.cache.get(url)
    if (!entry) return

    entry.referenceCount--
    
    if (entry.referenceCount <= 0) {
      this.disposeEntry(url, entry)
    }
  }

  /**
   * Preload multiple textures.
   * Useful for preloading garment textures or design presets.
   */
  async preload(urls: string[], options: TextureLoadOptions = {}): Promise<void> {
    const promises = urls.map((url) => 
      this.load(url, options).then((texture) => {
        // Immediately release - just want it in cache
        this.release(url)
        return texture
      }).catch((error) => {
        console.warn(`[TextureCache] Failed to preload ${url}:`, error)
        return null
      })
    )

    await Promise.all(promises)
  }

  /**
   * Get texture metadata without loading.
   */
  getInfo(url: string): Pick<TextureCacheEntry, 'width' | 'height' | 'referenceCount'> | null {
    const entry = this.cache.get(url)
    if (!entry) return null
    
    return {
      width: entry.width,
      height: entry.height,
      referenceCount: entry.referenceCount,
    }
  }

  /**
   * Check if a texture is cached.
   */
  has(url: string): boolean {
    return this.cache.has(url)
  }

  /**
   * Get cache statistics.
   */
  getStats(): TextureCacheStats {
    let activeReferences = 0
    this.cache.forEach((entry) => {
      activeReferences += entry.referenceCount
    })

    return {
      totalTextures: this.cache.size,
      totalSize: this.totalSize,
      activeReferences,
      peakTextures: this.peakTextures,
      peakSize: this.peakSize,
    }
  }

  /**
   * Clear all cached textures.
   * Warning: Only call when all references have been released.
   */
  clear(): void {
    this.cache.forEach((entry, url) => {
      if (entry.referenceCount > 0) {
        console.warn(`[TextureCache] Clearing texture with ${entry.referenceCount} active references: ${url}`)
      }
      entry.texture.dispose()
    })
    
    this.cache.clear()
    this.totalSize = 0
  }

  /**
   * Clean up textures that haven't been used recently.
   * @param maxAge - Maximum age in milliseconds (default: 5 minutes)
   */
  cleanup(maxAge: number = 5 * 60 * 1000): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    this.cache.forEach((entry, url) => {
      if (entry.referenceCount === 0 && now - entry.lastUsed > maxAge) {
        keysToDelete.push(url)
      }
    })
    
    keysToDelete.forEach(url => {
      const entry = this.cache.get(url)
      if (entry) {
        this.disposeEntry(url, entry)
      }
    })
  }

  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  private loadTexture(url: string, options: Required<TextureLoadOptions>): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          this.processTexture(texture, options)
          resolve(texture)
        },
        undefined,
        reject
      )
    })
  }

  private processTexture(texture: THREE.Texture, options: Required<TextureLoadOptions>): void {
    // Resize if needed
    if (options.maxSize > 0) {
      this.resizeTexture(texture, options.maxSize)
    }

    // Configure texture properties
    texture.colorSpace = options.colorSpace
    texture.flipY = options.flipY
    texture.anisotropy = options.anisotropy
    texture.generateMipmaps = options.generateMipmaps
    
    if (options.generateMipmaps) {
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
    } else {
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
    }
    
    texture.needsUpdate = true
  }

  private resizeTexture(texture: THREE.Texture, maxSize: number): void {
    const image = texture.image as HTMLImageElement | undefined
    if (!image || !image.width || !image.height) return

    let width = image.width
    let height = image.height
    
    // Check if resize is needed
    if (width <= maxSize && height <= maxSize) return

    // Calculate new dimensions maintaining aspect ratio
    const aspect = width / height
    
    if (width > height) {
      width = maxSize
      height = Math.round(maxSize / aspect)
    } else {
      height = maxSize
      width = Math.round(maxSize * aspect)
    }

    // Create canvas for resizing
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Use high-quality resizing
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image as CanvasImageSource, 0, 0, width, height)

    // Update texture with resized image
    texture.image = canvas as unknown as HTMLImageElement
    texture.needsUpdate = true
  }

  private createEntry(url: string, texture: THREE.Texture, options: Required<TextureLoadOptions>): TextureCacheEntry {
    const image = texture.image as HTMLImageElement | HTMLCanvasElement | undefined
    const width = image?.width || 0
    const height = image?.height || 0
    
    // Estimate size: width * height * 4 channels (RGBA)
    const estimatedSize = width * height * 4
    
    return {
      texture,
      width,
      height,
      format: options.colorSpace === THREE.SRGBColorSpace ? THREE.RGBAFormat : THREE.RGBAFormat,
      referenceCount: 1,
      lastUsed: Date.now(),
      url,
      estimatedSize,
    }
  }

  private addToCache(url: string, entry: TextureCacheEntry): void {
    // Check if we need to evict
    while (this.totalSize + entry.estimatedSize > MAX_CACHE_SIZE && this.cache.size > 0) {
      this.evictLRU()
    }

    this.cache.set(url, entry)
    this.totalSize += entry.estimatedSize
    
    // Update peaks
    this.peakTextures = Math.max(this.peakTextures, this.cache.size)
    this.peakSize = Math.max(this.peakSize, this.totalSize)
  }

  private disposeEntry(url: string, entry: TextureCacheEntry): void {
    entry.texture.dispose()
    this.cache.delete(url)
    this.totalSize -= entry.estimatedSize
  }

  private evictLRU(): void {
    let oldest: { url: string; entry: TextureCacheEntry } | null = null
    
    this.cache.forEach((entry, url) => {
      // Only evict entries with no active references
      if (entry.referenceCount > 0) return
      
      if (!oldest || entry.lastUsed < oldest.entry.lastUsed) {
        oldest = { url, entry }
      }
    })

    if (oldest !== null) {
      this.disposeEntry((oldest as { url: string; entry: TextureCacheEntry }).url, (oldest as { url: string; entry: TextureCacheEntry }).entry)
    } else {
      // All entries have references, can't evict
      console.warn('[TextureCache] Cannot evict: all textures have active references')
    }
  }

  // ==========================================================================
  // Compression Support (Basis Universal)
  // ==========================================================================

  /**
   * Check if Basis Universal compression is available.
   * Requires @threejs-kit/texture-basis-universal or similar.
   */
  isBasisCompressionAvailable(): boolean {
    // This would check for BasisTextureLoader availability
    // For now, return false as it's an optional dependency
    return false
  }

  /**
   * Load a Basis Universal compressed texture.
   * Requires the BasisTextureLoader to be set up.
   */
  async loadBasis(url: string): Promise<THREE.CompressedTexture | null> {
    // This would use BasisTextureLoader if available
    // For now, return null
    console.warn('[TextureCache] Basis Universal support not implemented')
    return null
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

const textureCacheInstance = new TextureCacheImpl()

/**
 * Texture cache interface for managing design textures.
 * 
 * Features:
 * - Automatic texture resizing to specified max dimensions
 * - Reference counting for proper memory management
 * - LRU eviction when cache size limits are hit
 * - Support for URLs, Blobs, and DataURLs
 * 
 * @example
 * ```typescript
 * // Load a texture
 * const texture = await textureCache.load('/designs/artwork.png', {
 *   maxSize: 1024,
 *   anisotropy: 16
 * })
 * 
 * // Apply to material
 * material.map = texture
 * 
 * // Release when done
 * textureCache.release('/designs/artwork.png')
 * 
 * // Preload multiple textures
 * await textureCache.preload([
 *   '/designs/artwork1.png',
 *   '/designs/artwork2.png'
 * ])
 * 
 * // Load from user upload
 * const file = event.target.files[0]
 * const texture = await textureCache.fromBlob(file)
 * ```
 */
export const textureCache = {
  /**
   * Load a texture from URL with automatic caching.
   * @param url - Texture URL
   * @param options - Loading options (maxSize, anisotropy, etc.)
   * @returns Cloned texture instance
   */
  load: (url: string, options?: TextureLoadOptions) => textureCacheInstance.load(url, options),

  /**
   * Create texture from Blob/File (e.g., user upload).
   * Not cached since blob URLs are temporary.
   * @param blob - File or Blob object
   * @param options - Loading options
   */
  fromBlob: (blob: Blob, options?: TextureLoadOptions) => textureCacheInstance.fromBlob(blob, options),

  /**
   * Create texture from data URL (e.g., canvas export).
   * @param dataUrl - Data URL string
   * @param options - Loading options
   */
  fromDataURL: (dataUrl: string, options?: TextureLoadOptions) => textureCacheInstance.fromDataURL(dataUrl, options),

  /**
   * Create texture from ImageBitmap.
   * Most efficient for large images.
   * @param bitmap - ImageBitmap instance
   * @param options - Loading options
   */
  fromImageBitmap: (bitmap: ImageBitmap, options?: TextureLoadOptions) => 
    textureCacheInstance.fromImageBitmap(bitmap, options),

  /**
   * Release a reference to a texture.
   * Texture is disposed when reference count reaches 0.
   * @param url - Original texture URL
   */
  release: (url: string) => textureCacheInstance.release(url),

  /**
   * Preload multiple textures into cache.
   * Useful for preloading garment designs.
   * @param urls - Array of texture URLs
   * @param options - Loading options
   */
  preload: (urls: string[], options?: TextureLoadOptions) => textureCacheInstance.preload(urls, options),

  /**
   * Get texture info without loading.
   * @param url - Texture URL
   */
  getInfo: (url: string) => textureCacheInstance.getInfo(url),

  /**
   * Check if a texture is cached.
   * @param url - Texture URL
   */
  has: (url: string) => textureCacheInstance.has(url),

  /**
   * Get cache statistics.
   */
  getStats: () => textureCacheInstance.getStats(),

  /**
   * Clear all cached textures.
   * Warning: May cause issues if textures are still in use.
   */
  clear: () => textureCacheInstance.clear(),

  /**
   * Clean up unused textures.
   * @param maxAge - Maximum age in milliseconds (default: 5 min)
   */
  cleanup: (maxAge?: number) => textureCacheInstance.cleanup(maxAge),

  /**
   * Check if Basis Universal compression is available.
   */
  isBasisCompressionAvailable: () => textureCacheInstance.isBasisCompressionAvailable(),
} as const

// Export types for consumers
export type { TextureCacheStats, TextureLoadOptions }
