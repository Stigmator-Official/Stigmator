# Model Caching System

Multi-tier caching system for Stigmator's 3D mockup generator.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Model Cache                            │
├─────────────────────────────────────────────────────────────┤
│  Memory Cache (LRU)        │  IndexedDB (Persistent)        │
│  - Max: 50MB               │  - Max: 200MB                  │
│  - Fast access             │  - Survives reloads            │
│  - THREE.Group objects     │  - Serialized JSON             │
│  - Cloned on retrieval     │  - Restored to memory on use   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Texture Cache                           │
├─────────────────────────────────────────────────────────────┤
│  - Reference counting                                      │
│  - Automatic resizing (configurable max)                   │
│  - LRU eviction at 100MB limit                             │
│  - THREE.Texture objects                                   │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Model Cache

```typescript
import { modelCache } from '@/lib/mockup/model-cache'

// Load and cache a model
const model = await modelCache.load('/models/tshirt.glb')

// Check cache status
if (await modelCache.has('/models/tshirt.glb')) {
  const cached = await modelCache.get('/models/tshirt.glb')
}

// Get statistics
const stats = modelCache.getStats()
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`)

// Set custom TTL (time-to-live)
await modelCache.load('/models/hoodie.glb', 24 * 60 * 60 * 1000) // 24 hours
```

### Texture Cache

```typescript
import { textureCache } from '@/lib/mockup/texture-cache'

// Load with options
const texture = await textureCache.load('/designs/artwork.png', {
  maxSize: 1024,        // Auto-resize if larger
  anisotropy: 16,       // Texture quality
  colorSpace: THREE.SRGBColorSpace,
})

// Apply to material
material.map = texture

// Release when done (reference counting)
textureCache.release('/designs/artwork.png')

// Load from user upload
const file = event.target.files[0]
const texture = await textureCache.fromBlob(file)

// Preload multiple textures
await textureCache.preload([
  '/designs/artwork1.png',
  '/designs/artwork2.png',
])
```

### Cache Manager (Settings Panel)

```typescript
import { cacheManager } from '@/lib/mockup/cache-manager'

// Get summary for settings UI
const summary = cacheManager.getSummary()
console.log(`Memory: ${summary.memoryUsed}`)
console.log(`Models: ${summary.totalModels}`)
console.log(`Textures: ${summary.totalTextures}`)
console.log(`Hit Rate: ${(summary.hitRate * 100).toFixed(1)}%`)

// Clear all caches
await cacheManager.clearAll()

// Set cache limits
cacheManager.setLimits({
  memoryMB: 100,
  storageMB: 500,
})

// Check health
const health = cacheManager.checkHealth()
if (!health.healthy) {
  console.warn('Issues:', health.issues)
  console.log('Recommendations:', health.recommendations)
}

// Export for analytics
const stats = cacheManager.exportStats()
analytics.track('cache_stats', stats)
```

## Features

### Model Cache

- **Two-tier storage**: Fast memory access + persistent IndexedDB
- **LRU eviction**: Least recently used items removed first
- **TTL support**: Automatic expiration of old entries
- **Size estimation**: Automatic tracking of memory usage
- **Hit rate tracking**: Monitor cache effectiveness
- **Clone-on-retrieve**: Safe to modify returned models
- **DRACO compression support**: For compressed GLB files

### Texture Cache

- **Reference counting**: Automatic disposal when no longer used
- **Automatic resizing**: Configurable maximum dimensions
- **Multiple sources**: URLs, Blobs, Files, DataURLs, ImageBitmaps
- **Preloading**: Batch load for better UX
- **LRU eviction**: Automatic cleanup at size limit
- **Format optimization**: Automatic mipmap generation

### Cache Manager

- **Unified interface**: Single API for all cache operations
- **Health monitoring**: Detect issues and get recommendations
- **Statistics export**: Analytics-ready data format
- **Maintenance tasks**: Automated cleanup scheduling
- **Settings integration**: Ready for settings panel UI

## Cache Limits

| Cache Type | Default Limit | Configurable |
|------------|---------------|--------------|
| Model Memory | 50 MB | ✅ Yes |
| Model Storage | 200 MB | ✅ Yes |
| Texture Memory | 100 MB | ❌ No |
| Texture TTL | None | ❌ No |
| Model TTL | 7 days | ✅ Per-entry |

## Performance Tips

1. **Preload common assets** on app initialization
2. **Use appropriate maxSize** for textures to save memory
3. **Release textures** when components unmount
4. **Monitor hit rates** and adjust limits if needed
5. **Run maintenance** periodically during idle time

## Integration with Mockup Generator

The caching system is integrated with the existing `useMockupState` hook:

```typescript
// The store can be updated to use caching:
loadGarment: async (url: string) => {
  set({ isLoading: true, error: null })
  try {
    const model = await modelCache.load(url)
    set({ 
      garmentModel: model, 
      garmentModelId: url,
      isLoading: false 
    })
  } catch (err) {
    set({ error: err.message, isLoading: false })
  }
}
```

## Files

| File | Purpose | Size |
|------|---------|------|
| `model-cache.ts` | 3D model caching | ~22KB |
| `texture-cache.ts` | Texture caching | ~17KB |
| `cache-manager.ts` | Management utilities | ~14KB |
| `index.ts` | Exports | ~1KB |
