/**
 * Stigmator Mockup Module
 * 
 * GLTF Model Pipeline for garment asset management and 3D mockup generation.
 */

// Export all types and interfaces
export type {
  GarmentType,
  GarmentVariant,
  UVRegion,
  UVRegions,
  FabricProperties,
  PrintArea,
} from './model-variants';

// Export variant utilities
export {
  GARMENT_VARIANTS,
  getVariantsByType,
  getVariantById,
  getVariantByName,
  getDefaultVariant,
  supportsPrintArea,
  getAllGarmentTypes,
  getTotalVariantCount,
} from './model-variants';

// Export optimizer types and utilities
export type {
  CompressionType,
  LODLevel,
  OptimizationStats,
  DecimationOptions,
  AtlasOptions,
} from './model-optimizer';

export {
  detectCompression,
  getCompressionStats,
  decimateMesh,
  generateAtlas,
  generateLODChain,
  generateCustomLODChain,
  mergeModelGeometries,
  optimizeMaterials,
  calculateOptimizationStats,
} from './model-optimizer';

// Export pipeline types and utilities
export type {
  ValidationResult,
  LoadOptions,
  ModelEntry,
  CacheEntry,
  PipelineConfig,
} from './model-pipeline';

export {
  ModelPipeline,
  getModelPipeline,
  createModelPipeline,
  resetModelPipeline,
} from './model-pipeline';

// Export procedural garments
export {
  generateProceduralGarment,
  generateGarmentUVs,
} from './procedural-garments';

// Export format configuration and utilities
export type {
  ExportFormat,
  FormatConfig,
  ExportOptions,
  ExportResult,
  ExportValidationResult,
  PlatformExport,
  CameraAngleId,
  CameraAngleConfig,
  CanvasCaptureOptions,
  MultiAngleExportOptions,
  MultiAngleResult,
  WatermarkOptions,
} from './export-formats';

export {
  FORMATS,
  PLATFORM_EXPORTS,
  CAMERA_ANGLES,
  getMimeType,
  getExtension,
  supportsTransparency,
  clampQuality,
  formatFileSize,
  estimateFileSize,
  generateFilename,
  captureRendererToBlob,
  exportForPlatform,
  exportFromMultipleAngles,
  applyWatermark,
  validateExportOptions,
} from './export-formats';

// Re-export THREE.js types commonly needed
// Note: GLTF type should be imported directly from three/examples/jsm/loaders/GLTFLoader
// export type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// Export camera animation utilities
export {
  animateCamera,
  tweenCamera,
  cancelCameraAnimation,
  createShowcaseAnimation,
  createDetailShowcaseAnimation,
  createTurntableAnimation,
  sphericalToPosition,
  createCameraPosition,
  isCameraAnimating,
  getAnimationProgress,
} from './camera-animation';

export type {
  CameraKeyframe,
  EasingType,
  AnimationOptions,
} from './camera-animation';

// Export mobile optimizations
export type {
  MobileOptimizedSettings,
  BatteryState,
  NetworkState,
} from './mobile-optimizations';

export {
  // Device detection
  isLowEndDevice,
  isHighEndMobile,
  // Settings
  getMobileOptimizedSettings,
  getTabletOptimizedSettings,
  getMobileConfig,
  // Battery awareness
  useBatteryAwareRendering,
  // Network awareness
  useNetworkAwareLoading,
  // Touch optimization
  optimizeForTouch,
  getTouchOptimizedCameraSettings,
  // Accessibility
  useReducedMotion,
  usePrefersHighContrast,
  // Performance
  useAdaptiveQuality,
  optimizeCanvasForMobile,
  useResponsiveCanvas,
  useMemoryStatus,
} from './mobile-optimizations';
