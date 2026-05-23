// Performance Monitoring System for Stigmator's 3D Mockup Generator

// Monitor
export {
  PerformanceMonitor,
  usePerformanceMonitor,
  FPSCounter,
  type PerformanceMetrics,
  type PerformanceBudget,
} from './monitor';

// Optimizer
export {
  OPTIMIZATION_LEVELS,
  detectDeviceCapabilities,
  applyOptimization,
  getRecommendedOptimizationLevel,
  useAdaptiveQuality,
  adjustLOD,
  applyAutoOptimization,
  setQualityLevel,
  type OptimizationLevel,
  type DeviceCapabilities,
} from './optimizer';

// Memory Management
export {
  disposeGeometry,
  disposeMaterial,
  disposeTexture,
  disposeObject,
  cleanupScene,
  trackObject,
  untrackObject,
  getTrackedObjects,
  requestGC,
  estimateTextureMemory,
  getRendererMemory,
  checkMemoryLimit,
  disposeAllMaterials,
  disposeAllGeometries,
  clearRendererTextures,
} from './memory';
