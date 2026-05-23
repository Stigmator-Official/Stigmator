/**
 * Stigmator Model Pipeline
 * 
 * Central pipeline for loading, caching, and managing 3D garment models.
 * Features:
 * - IndexedDB caching with 30-day TTL
 * - Support for Draco, KTX2, and Basis compression
 * - Progressive loading (low-res first, swap to high-res)
 * - Error recovery with exponential backoff
 * - Model validation
 */

import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module';

import {
  GarmentType,
  GarmentVariant,
  getVariantByName,
  getDefaultVariant,
  GARMENT_VARIANTS,
} from './model-variants';
import {
  detectCompression,
  CompressionType,
  generateLODChain,
  decimateMesh,
  mergeModelGeometries,
} from './model-optimizer';
import { generateProceduralGarment } from './procedural-garments';

// ============== TYPES ==============

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    meshCount: number;
    vertexCount: number;
    triangleCount: number;
    materialCount: number;
    textureCount: number;
    hasUVs: boolean;
    hasNormals: boolean;
    compressionType: CompressionType;
  };
}

export interface LoadOptions {
  quality?: 'low' | 'medium' | 'high';
  useLOD?: boolean;
  generateLOD?: boolean;
  priority?: 'critical' | 'high' | 'normal' | 'low';
  signal?: AbortSignal;
}

export interface ModelEntry {
  type: GarmentType;
  variant: string;
  url: string;
  fallbackUrl?: string;
  proceduralFallback?: boolean;
}

export interface CacheEntry {
  model: THREE.Group;
  variant: GarmentVariant;
  timestamp: number;
  quality: string;
  size: number;
}

export interface PipelineConfig {
  cacheEnabled: boolean;
  cacheTTL: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
  dracoDecoderPath: string;
  ktx2TranscoderPath: string;
  maxCacheSize: number; // bytes
  progressiveLoading: boolean;
}

// ============== CONFIGURATION ==============

const DEFAULT_CONFIG: PipelineConfig = {
  cacheEnabled: true,
  cacheTTL: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxRetries: 3,
  retryDelay: 1000, // 1 second base delay
  dracoDecoderPath: '/draco/',
  ktx2TranscoderPath: '/ktx2/',
  maxCacheSize: 500 * 1024 * 1024, // 500MB
  progressiveLoading: true,
};

// ============== INDEXEDDB CACHE ==============

const DB_NAME = 'StigmatorModelCache';
const DB_VERSION = 1;
const STORE_NAME = 'models';

class ModelCache {
  private db: IDBDatabase | null = null;
  private config: PipelineConfig;

  constructor(config: PipelineConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    if (!this.config.cacheEnabled) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  async get(key: string): Promise<CacheEntry | null> {
    if (!this.db || !this.config.cacheEnabled) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as { key: string; data: CacheEntry; timestamp: number; size: number } | undefined;
        
        if (!result) {
          resolve(null);
          return;
        }

        // Check TTL
        const age = Date.now() - result.timestamp;
        if (age > this.config.cacheTTL) {
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
    });
  }

  async set(key: string, entry: CacheEntry): Promise<void> {
    if (!this.db || !this.config.cacheEnabled) return;

    // Check cache size and evict if necessary
    await this.enforceSizeLimit();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put({
        key,
        data: entry,
        timestamp: entry.timestamp,
        size: entry.size,
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db || !this.config.cacheEnabled) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db || !this.config.cacheEnabled) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async enforceSizeLimit(): Promise<void> {
    const stats = await this.getStats();
    
    if (stats.totalSize <= this.config.maxCacheSize) return;

    // Evict oldest entries until under limit (target 80% of max)
    const targetSize = this.config.maxCacheSize * 0.8;
    const entries = await this.getAllEntries();
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a.timestamp - b.timestamp);

    for (const entry of entries) {
      if (stats.totalSize <= targetSize) break;
      await this.delete(entry.key);
      stats.totalSize -= entry.size;
    }
  }

  private async getStats(): Promise<{ totalSize: number; entryCount: number }> {
    const entries = await this.getAllEntries();
    const totalSize = entries.reduce((sum, e) => sum + e.size, 0);
    return { totalSize, entryCount: entries.length };
  }

  private async getAllEntries(): Promise<Array<{ key: string; timestamp: number; size: number }>> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();
      
      const entries: Array<{ key: string; timestamp: number; size: number }> = [];

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null;
        if (cursor) {
          entries.push({
            key: cursor.value.key,
            timestamp: cursor.value.timestamp,
            size: cursor.value.size,
          });
          cursor.continue();
        } else {
          resolve(entries);
        }
      };
    });
  }
}

// ============== MODEL PIPELINE CLASS ==============

export class ModelPipeline {
  private registry = new Map<string, ModelEntry>();
  private cache: ModelCache;
  private config: PipelineConfig;
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader | null = null;
  private ktx2Loader: KTX2Loader | null = null;
  private loadingPromises = new Map<string, Promise<THREE.Group>>();
  private loadedModels = new Map<string, THREE.Group>();

  constructor(config: Partial<PipelineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new ModelCache(this.config);
    this.gltfLoader = new GLTFLoader();
    
    this.setupLoaders();
  }

  private setupLoaders(): void {
    // Setup Draco loader
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath(this.config.dracoDecoderPath);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    // Setup KTX2 loader
    this.ktx2Loader = new KTX2Loader();
    this.ktx2Loader.setTranscoderPath(this.config.ktx2TranscoderPath);
    this.gltfLoader.setKTX2Loader(this.ktx2Loader);

    // Setup Meshopt decoder
    this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  }

  async initialize(): Promise<void> {
    await this.cache.init();
  }

  /**
   * Register a model in the pipeline
   */
  registerModel(
    type: GarmentType,
    variant: string,
    url: string,
    options: { fallbackUrl?: string; proceduralFallback?: boolean } = {}
  ): void {
    const key = this.getRegistryKey(type, variant);
    this.registry.set(key, {
      type,
      variant,
      url,
      fallbackUrl: options.fallbackUrl,
      proceduralFallback: options.proceduralFallback ?? true,
    });
  }

  /**
   * Load a model with caching and error recovery
   */
  async loadModel(
    type: GarmentType,
    variant: string,
    options: LoadOptions = {}
  ): Promise<THREE.Group> {
    const key = this.getRegistryKey(type, variant);
    const variantData = getVariantByName(type, variant) ?? getDefaultVariant(type);

    if (!variantData) {
      throw new Error(`No variant found for ${type}/${variant}`);
    }

    // Check loaded models
    if (this.loadedModels.has(key)) {
      return this.loadedModels.get(key)!.clone();
    }

    // Check in-flight promises
    if (this.loadingPromises.has(key)) {
      const model = await this.loadingPromises.get(key)!;
      return model.clone();
    }

    // Start loading
    const loadPromise = this.loadModelInternal(type, variant, options, variantData);
    this.loadingPromises.set(key, loadPromise);

    try {
      const model = await loadPromise;
      this.loadedModels.set(key, model);
      return model.clone();
    } finally {
      this.loadingPromises.delete(key);
    }
  }

  private async loadModelInternal(
    type: GarmentType,
    variant: string,
    options: LoadOptions,
    variantData: GarmentVariant
  ): Promise<THREE.Group> {
    const key = this.getRegistryKey(type, variant);
    const quality = options.quality ?? 'high';
    const cacheKey = `${key}_${quality}`;

    // Check cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      console.log(`[ModelPipeline] Cache hit for ${key}`);
      return cached.model.clone();
    }

    // Get registry entry
    const entry = this.registry.get(key);
    if (!entry) {
      // Generate procedural fallback
      if (variantData) {
        console.warn(`[ModelPipeline] No registry entry for ${key}, using procedural fallback`);
        return this.generateProceduralFallback(variantData);
      }
      throw new Error(`No model registered for ${key}`);
    }

    // Load with retries
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          console.log(`[ModelPipeline] Retry ${attempt + 1}/${this.config.maxRetries} for ${key} after ${delay}ms`);
          await this.sleep(delay);
        }

        const model = await this.fetchAndProcessModel(
          entry,
          options,
          variantData
        );

        // Cache the result
        const cacheEntry: CacheEntry = {
          model: model.clone(),
          variant: variantData,
          timestamp: Date.now(),
          quality,
          size: this.estimateModelSize(model),
        };
        await this.cache.set(cacheKey, cacheEntry);

        return model;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Try fallback URL
        if (attempt === this.config.maxRetries - 1 && entry.fallbackUrl) {
          try {
            console.log(`[ModelPipeline] Trying fallback URL for ${key}`);
            const fallbackEntry = { ...entry, url: entry.fallbackUrl };
            const model = await this.fetchAndProcessModel(
              fallbackEntry,
              options,
              variantData
            );
            return model;
          } catch (fallbackError) {
            console.error(`[ModelPipeline] Fallback failed for ${key}:`, fallbackError);
          }
        }
      }
    }

    // All retries exhausted, use procedural fallback if enabled
    if (entry.proceduralFallback) {
      console.warn(`[ModelPipeline] All retries failed for ${key}, using procedural fallback`);
      return this.generateProceduralFallback(variantData);
    }

    throw lastError ?? new Error(`Failed to load model ${key}`);
  }

  private async fetchAndProcessModel(
    entry: ModelEntry,
    options: LoadOptions,
    variantData: GarmentVariant
  ): Promise<THREE.Group> {
    // Progressive loading: load low-res first if enabled
    if (this.config.progressiveLoading && options.quality !== 'low') {
      // Return low-res version immediately, then upgrade
      const lowResModel = await this.loadLowResFirst(entry, options, variantData);
      return lowResModel;
    }

    // Direct load
    const gltf = await this.loadGLTF(entry.url, options.signal);
    return this.processGLTF(gltf, options, variantData);
  }

  private async loadLowResFirst(
    entry: ModelEntry,
    options: LoadOptions,
    variantData: GarmentVariant
  ): Promise<THREE.Group> {
    // Start high-res load in background
    const highResPromise = this.loadGLTF(entry.url, options.signal)
      .then(gltf => this.processGLTF(gltf, { ...options, quality: 'high' }, variantData));

    // Try to get cached low-res or load it
    const lowResKey = `${this.getRegistryKey(entry.type, entry.variant)}_low`;
    const cachedLowRes = await this.cache.get(lowResKey);

    if (cachedLowRes) {
      // Upgrade in background
      highResPromise.then(highResModel => {
        // Emit upgrade event (can be subscribed to)
        this.emitModelUpgrade(entry.type, entry.variant, highResModel);
      }).catch(console.error);

      return cachedLowRes.model.clone();
    }

    // Load and cache low-res version
    try {
      const lowResGLTF = await this.loadGLTF(entry.url, options.signal);
      const lowResModel = this.processGLTF(lowResGLTF, { ...options, quality: 'low' }, variantData);
      
      // Cache low-res
      const cacheEntry: CacheEntry = {
        model: lowResModel.clone(),
        variant: variantData,
        timestamp: Date.now(),
        quality: 'low',
        size: this.estimateModelSize(lowResModel),
      };
      await this.cache.set(lowResKey, cacheEntry);

      // Upgrade in background
      highResPromise.then(highResModel => {
        this.emitModelUpgrade(entry.type, entry.variant, highResModel);
      }).catch(console.error);

      return lowResModel;
    } catch {
      // If low-res fails, wait for high-res
      return highResPromise;
    }
  }

  private emitModelUpgrade(type: GarmentType, variant: string, model: THREE.Group): void {
    // Dispatch custom event for model upgrade
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('stigmator:model-upgrade', {
        detail: { type, variant, model: model.clone() },
      }));
    }
  }

  private loadGLTF(url: string, signal?: AbortSignal): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      const onLoad = (gltf: GLTF) => resolve(gltf);
      const onError = (error: ErrorEvent) => reject(new Error(`Failed to load ${url}: ${error.message}`));
      
      this.gltfLoader.load(url, onLoad, undefined, onError);

      if (signal) {
        signal.addEventListener('abort', () => {
          reject(new Error('Load aborted'));
        });
      }
    });
  }

  private processGLTF(
    gltf: GLTF,
    options: LoadOptions,
    variantData: GarmentVariant
  ): THREE.Group {
    const model = gltf.scene.clone();
    
    // Ensure proper naming
    model.name = `${variantData.type}_${variantData.name}`;

    // Apply quality settings
    if (options.quality === 'low') {
      this.applyLowQualitySettings(model);
    } else if (options.quality === 'medium') {
      this.applyMediumQualitySettings(model);
    }

    // Generate LOD if requested
    if (options.generateLOD ?? options.useLOD) {
      const lod = generateLODChain(model, 3);
      lod.name = model.name;
      return lod as unknown as THREE.Group;
    }

    // Setup materials
    this.setupMaterials(model, variantData);

    return model;
  }

  private applyLowQualitySettings(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Decimate geometry
        const decimated = decimateMesh(child, 0.25, {
          preserveUVs: true,
          preserveNormals: false,
          preserveBoundaries: true,
        });
        child.geometry = decimated.geometry;

        // Reduce material quality
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.roughness = Math.min(mat.roughness * 1.2, 1);
              mat.metalness = Math.min(mat.metalness * 0.8, 1);
            }
          });
        }
      }
    });
  }

  private applyMediumQualitySettings(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const decimated = decimateMesh(child, 0.5, {
          preserveUVs: true,
          preserveNormals: true,
          preserveBoundaries: true,
        });
        child.geometry = decimated.geometry;
      }
    });
  }

  private setupMaterials(model: THREE.Group, variantData: GarmentVariant): void {
    const { fabricProperties } = variantData;

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        
        const newMaterials = materials.map(mat => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            const newMat = mat.clone();
            newMat.roughness = fabricProperties.roughness;
            newMat.metalness = fabricProperties.metalness;
            newMat.needsUpdate = true;
            return newMat;
          }
          return mat;
        });

        child.material = materials.length === 1 ? newMaterials[0] : newMaterials;
      }
    });
  }

  private generateProceduralFallback(variantData: GarmentVariant): THREE.Group {
    return generateProceduralGarment(variantData);
  }

  /**
   * Preload models for critical paths
   */
  async preloadModels(
    types: GarmentType[],
    options: { quality?: 'low' | 'medium' | 'high' } = {}
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const type of types) {
      const variants = GARMENT_VARIANTS[type];
      if (!variants) continue;

      for (const variant of variants.slice(0, 2)) { // Preload first 2 variants of each type
        const promise = this.loadModel(type, variant.name, {
          ...options,
          priority: 'high',
        }).then(() => {
          console.log(`[ModelPipeline] Preloaded ${type}/${variant.name}`);
        }).catch(error => {
          console.warn(`[ModelPipeline] Failed to preload ${type}/${variant.name}:`, error);
        });

        promises.push(promise);
      }
    }

    await Promise.all(promises);
  }

  /**
   * Validate a loaded model
   */
  validateModel(model: THREE.Group): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    let meshCount = 0;
    let vertexCount = 0;
    let triangleCount = 0;
    let materialCount = 0;
    let textureCount = 0;
    let hasUVs = false;
    let hasNormals = false;

    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshCount++;
        
        const geo = child.geometry;
        if (geo) {
          vertexCount += geo.attributes.position?.count ?? 0;
          
          if (geo.index) {
            triangleCount += geo.index.count / 3;
          } else {
            triangleCount += (geo.attributes.position?.count ?? 0) / 3;
          }

          if (geo.attributes.uv) hasUVs = true;
          if (geo.attributes.normal) hasNormals = true;

          // Validate UVs are in 0-1 range
          if (geo.attributes.uv) {
            const uvs = geo.attributes.uv.array as Float32Array;
            for (let i = 0; i < uvs.length; i += 2) {
              if (uvs[i] < -0.01 || uvs[i] > 1.01 || uvs[i + 1] < -0.01 || uvs[i + 1] > 1.01) {
                warnings.push(`Mesh "${child.name}" has UVs outside 0-1 range`);
                break;
              }
            }
          }
        }

        // Collect materials
        const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of childMaterials) {
          if (!materials.has(mat)) {
            materials.add(mat);
            materialCount++;

            // Collect textures
            for (const key of Object.keys(mat)) {
              const value = (mat as Record<string, unknown>)[key];
              if (value instanceof THREE.Texture && !textures.has(value)) {
                textures.add(value);
                textureCount++;
              }
            }
          }
        }

        // Check for non-manifold geometry (basic check)
        if (geo && geo.index) {
          const indices = geo.index.array;
          const vertexIndices = new Set<number>();
          for (let i = 0; i < indices.length; i++) {
            vertexIndices.add(indices[i]);
          }
          
          if (vertexIndices.size < (geo.attributes.position?.count ?? 0) * 0.5) {
            warnings.push(`Mesh "${child.name}" may have disconnected vertices`);
          }
        }
      }
    });

    // Validation checks
    if (meshCount === 0) {
      errors.push('Model contains no meshes');
    }

    if (!hasUVs) {
      errors.push('Model is missing UV coordinates required for texture mapping');
    }

    if (!hasNormals) {
      warnings.push('Model is missing normal vectors');
    }

    if (vertexCount > 100000) {
      warnings.push(`High vertex count (${vertexCount.toLocaleString()}) may impact performance`);
    }

    if (materialCount > 10) {
      warnings.push(`High material count (${materialCount}) may increase draw calls`);
    }

    // Check for duplicate names
    const names = new Set<string>();
    const duplicates = new Set<string>();
    model.traverse((child) => {
      if (names.has(child.name)) {
        duplicates.add(child.name);
      }
      names.add(child.name);
    });

    if (duplicates.size > 0) {
      warnings.push(`Duplicate object names found: ${[...duplicates].join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        meshCount,
        vertexCount: Math.floor(vertexCount),
        triangleCount: Math.floor(triangleCount),
        materialCount,
        textureCount,
        hasUVs,
        hasNormals,
        compressionType: 'none', // Would need original GLTF for this
      },
    };
  }

  /**
   * Clear the cache
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
    this.loadedModels.clear();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ entryCount: number; totalSize: number }> {
    // This is a simplified version - the cache would need to expose this
    return { entryCount: 0, totalSize: 0 };
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.dracoLoader?.dispose();
    this.ktx2Loader?.dispose();
    this.loadedModels.forEach(model => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(m => m.dispose());
        }
      });
    });
    this.loadedModels.clear();
  }

  // ============== PRIVATE HELPERS ==============

  private getRegistryKey(type: GarmentType, variant: string): string {
    return `${type}:${variant}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private estimateModelSize(model: THREE.Group): number {
    let size = 0;
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Estimate geometry size
        const geo = child.geometry;
        if (geo.attributes.position) {
          size += geo.attributes.position.array.byteLength;
        }
        if (geo.attributes.normal) {
          size += geo.attributes.normal.array.byteLength;
        }
        if (geo.attributes.uv) {
          size += geo.attributes.uv.array.byteLength;
        }
        if (geo.index) {
          size += geo.index.array.byteLength;
        }
      }
    });

    return size;
  }
}

// ============== SINGLETON INSTANCE ==============

let globalPipeline: ModelPipeline | null = null;

export function getModelPipeline(config?: Partial<PipelineConfig>): ModelPipeline {
  if (!globalPipeline) {
    globalPipeline = new ModelPipeline(config);
  }
  return globalPipeline;
}

export function createModelPipeline(config?: Partial<PipelineConfig>): ModelPipeline {
  return new ModelPipeline(config);
}

export function resetModelPipeline(): void {
  globalPipeline?.dispose();
  globalPipeline = null;
}

// ============== DEFAULT EXPORTS ==============

export default {
  ModelPipeline,
  getModelPipeline,
  createModelPipeline,
  resetModelPipeline,
};
