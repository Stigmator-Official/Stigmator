/**
 * Type declarations for Stigmator Mockup Module
 */

import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// ============== MODEL VARIANTS ==============

export type GarmentType = 'tshirt' | 'hoodie' | 'tank' | 'longsleeve' | 'sweatpants' | 'shorts';

export interface UVRegion {
  u: [number, number];
  v: [number, number];
}

export interface UVRegions {
  chest: UVRegion;
  back: UVRegion;
  leftSleeve?: UVRegion;
  rightSleeve?: UVRegion;
  front?: UVRegion;
  label?: UVRegion;
  leftLeg?: UVRegion;
  rightLeg?: UVRegion;
}

export interface FabricProperties {
  roughness: number;
  metalness: number;
  sheen: number;
  sheenRoughness?: number;
  sheenColor?: string;
  clearcoat?: number;
  clearcoatRoughness?: number;
  normalScale?: number;
}

export interface PrintArea {
  maxWidth: number;
  maxHeight: number;
  recommendedPosition: { x: number; y: number; z?: number };
  safeZone: { x: number; y: number; width: number; height: number };
}

export interface GarmentVariant {
  id: string;
  type: GarmentType;
  name: string;
  displayName: string;
  description?: string;
  defaultColor: string;
  availableColors: string[];
  fabricProperties: FabricProperties;
  uvRegions: UVRegions;
  printArea: PrintArea;
  dimensions: {
    chestWidth: number;
    length: number;
    sleeveLength?: number;
    shoulderWidth?: number;
  };
  fitType: 'slim' | 'regular' | 'oversized' | 'relaxed';
  layerPriority: number;
  features: {
    supportsPockets: boolean;
    supportsHood: boolean;
    supportsZipper: boolean;
    supportsDrawstrings: boolean;
  };
  cameraDefaults: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
    fov: number;
  };
  lodDistances: {
    high: number;
    medium: number;
    low: number;
  };
}

export declare const GARMENT_VARIANTS: Record<GarmentType, GarmentVariant[]>;

export declare function getVariantsByType(type: GarmentType): GarmentVariant[];
export declare function getVariantById(id: string): GarmentVariant | undefined;
export declare function getVariantByName(type: GarmentType, name: string): GarmentVariant | undefined;
export declare function getDefaultVariant(type: GarmentType): GarmentVariant | undefined;
export declare function supportsPrintArea(type: GarmentType, area: keyof UVRegions): boolean;
export declare function getAllGarmentTypes(): GarmentType[];
export declare function getTotalVariantCount(): number;

// ============== MODEL OPTIMIZER ==============

export type CompressionType = 'none' | 'draco' | 'ktx2' | 'basis' | 'meshopt' | 'unknown';

export interface LODLevel {
  distance: number;
  geometry: THREE.BufferGeometry;
  materials: THREE.Material[];
  vertexCount: number;
  triangleCount: number;
}

export interface OptimizationStats {
  originalVertices: number;
  originalTriangles: number;
  optimizedVertices: number;
  optimizedTriangles: number;
  compressionRatio: number;
  processingTime: number;
}

export interface DecimationOptions {
  targetRatio: number;
  preserveUVs?: boolean;
  preserveNormals?: boolean;
  preserveBoundaries?: boolean;
  errorThreshold?: number;
}

export interface AtlasOptions {
  maxSize?: number;
  padding?: number;
  powerOfTwo?: boolean;
  potpack?: boolean;
}

export declare function detectCompression(gltf: GLTF): CompressionType;
export declare function getCompressionStats(gltf: GLTF): {
  type: CompressionType;
  extensions: string[];
  hasCompressedTextures: boolean;
  hasCompressedMeshes: boolean;
};

export declare function decimateMesh(
  mesh: THREE.Mesh,
  targetRatio: number,
  options?: DecimationOptions
): THREE.Mesh;

export declare function generateAtlas(
  textures: THREE.Texture[],
  options?: AtlasOptions
): THREE.DataTexture;

export declare function generateLODChain(
  model: THREE.Group,
  levels?: number
): THREE.LOD;

export declare function generateCustomLODChain(
  model: THREE.Group,
  levelConfigs: Array<{ ratio: number; distance: number }>
): THREE.LOD;

export declare function mergeModelGeometries(model: THREE.Group): THREE.Group;
export declare function optimizeMaterials(model: THREE.Group): void;
export declare function calculateOptimizationStats(
  original: THREE.Group,
  optimized: THREE.Group
): OptimizationStats;

// ============== MODEL PIPELINE ==============

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
  cacheTTL: number;
  maxRetries: number;
  retryDelay: number;
  dracoDecoderPath: string;
  ktx2TranscoderPath: string;
  maxCacheSize: number;
  progressiveLoading: boolean;
}

export declare class ModelPipeline {
  constructor(config?: Partial<PipelineConfig>);
  initialize(): Promise<void>;
  registerModel(
    type: GarmentType,
    variant: string,
    url: string,
    options?: { fallbackUrl?: string; proceduralFallback?: boolean }
  ): void;
  loadModel(
    type: GarmentType,
    variant: string,
    options?: LoadOptions
  ): Promise<THREE.Group>;
  preloadModels(
    types: GarmentType[],
    options?: { quality?: 'low' | 'medium' | 'high' }
  ): Promise<void>;
  validateModel(model: THREE.Group): ValidationResult;
  clearCache(): Promise<void>;
  getCacheStats(): Promise<{ entryCount: number; totalSize: number }>;
  dispose(): void;
}

export declare function getModelPipeline(config?: Partial<PipelineConfig>): ModelPipeline;
export declare function createModelPipeline(config?: Partial<PipelineConfig>): ModelPipeline;
export declare function resetModelPipeline(): void;

// ============== PROCEDURAL GARMENTS ==============

export declare function generateProceduralGarment(variant: GarmentVariant): THREE.Group;
export declare function generateGarmentUVs(geometry: THREE.BufferGeometry, variant: GarmentVariant): void;
