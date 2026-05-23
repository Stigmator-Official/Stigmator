import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export interface OptimizationLevel {
  pixelRatio: number;
  shadowMapSize: number;
  antialias: boolean;
  maxAnisotropy: number;
  enablePostProcessing: boolean;
  lodBias: number;
}

export const OPTIMIZATION_LEVELS: Record<'low' | 'medium' | 'high' | 'ultra', OptimizationLevel> = {
  low: {
    pixelRatio: 0.75,
    shadowMapSize: 512,
    antialias: false,
    maxAnisotropy: 1,
    enablePostProcessing: false,
    lodBias: 2,
  },
  medium: {
    pixelRatio: 1.0,
    shadowMapSize: 1024,
    antialias: false,
    maxAnisotropy: 4,
    enablePostProcessing: false,
    lodBias: 1,
  },
  high: {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    shadowMapSize: 2048,
    antialias: true,
    maxAnisotropy: 8,
    enablePostProcessing: true,
    lodBias: 0,
  },
  ultra: {
    pixelRatio: window.devicePixelRatio,
    shadowMapSize: 4096,
    antialias: true,
    maxAnisotropy: 16,
    enablePostProcessing: true,
    lodBias: -1,
  },
};

export interface DeviceCapabilities {
  gpuTier: 'low' | 'medium' | 'high';
  isMobile: boolean;
  maxTextureSize: number;
  supportsWebGL2: boolean;
}

// Detect device capabilities
export function detectDeviceCapabilities(): DeviceCapabilities {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  if (!gl) {
    return {
      gpuTier: 'low',
      isMobile: false,
      maxTextureSize: 2048,
      supportsWebGL2: false,
    };
  }

  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const maxRenderBufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
  const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
  
  // Check for WebGL2
  const supportsWebGL2 = gl instanceof WebGL2RenderingContext;
  
  // Detect mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);

  // Determine GPU tier based on capabilities
  let gpuTier: 'low' | 'medium' | 'high' = 'medium';
  
  if (isMobile || maxTextureSize < 4096 || !supportsWebGL2) {
    gpuTier = 'low';
  } else if (maxTextureSize >= 16384 && supportsWebGL2) {
    gpuTier = 'high';
  }

  return {
    gpuTier,
    isMobile,
    maxTextureSize,
    supportsWebGL2,
  };
}

// Apply optimization level
export function applyOptimization(
  renderer: THREE.WebGLRenderer,
  level: keyof typeof OPTIMIZATION_LEVELS
): void {
  const settings = OPTIMIZATION_LEVELS[level];

  // Set pixel ratio
  renderer.setPixelRatio(settings.pixelRatio);

  // Set shadow map size
  if (renderer.shadowMap.enabled) {
    const size = settings.shadowMapSize;
    // We need to traverse materials and lights to update shadow map sizes
    // This is a simplified approach - in practice you might want to update each light
  }

  // Configure capabilities
  const capabilities = renderer.capabilities;
  
  // Note: antialias is set at context creation, can't be changed at runtime
  // We can only set the pixel ratio and other configurable properties

  // Update max anisotropy for textures
  renderer.capabilities.getMaxAnisotropy();
}

// Get recommended optimization level based on device capabilities
export function getRecommendedOptimizationLevel(
  capabilities: DeviceCapabilities
): keyof typeof OPTIMIZATION_LEVELS {
  if (capabilities.isMobile || capabilities.gpuTier === 'low') {
    return 'low';
  } else if (capabilities.gpuTier === 'medium') {
    return 'medium';
  } else if (!capabilities.supportsWebGL2) {
    return 'high';
  }
  return 'ultra';
}

// Adaptive quality based on FPS
export function useAdaptiveQuality(
  renderer: THREE.WebGLRenderer | null,
  targetFps: number = 60
): { quality: string; isAdapting: boolean } {
  const [quality, setQuality] = useState<string>('auto');
  const [isAdapting, setIsAdapting] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const currentLevelRef = useRef<keyof typeof OPTIMIZATION_LEVELS>('medium');

  useEffect(() => {
    if (!renderer) return;

    const adaptQuality = () => {
      frameCountRef.current++;
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      if (delta >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        fpsHistoryRef.current.push(fps);
        
        // Keep last 5 seconds of FPS data
        if (fpsHistoryRef.current.length > 5) {
          fpsHistoryRef.current.shift();
        }

        // Calculate average FPS
        const avgFps = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;

        // Adjust quality based on performance
        if (fpsHistoryRef.current.length >= 3) {
          setIsAdapting(true);

          if (avgFps < targetFps * 0.7 && currentLevelRef.current !== 'low') {
            // Performance is poor, reduce quality
            const levels: (keyof typeof OPTIMIZATION_LEVELS)[] = ['ultra', 'high', 'medium', 'low'];
            const currentIndex = levels.indexOf(currentLevelRef.current);
            if (currentIndex < levels.length - 1) {
              currentLevelRef.current = levels[currentIndex + 1];
              applyOptimization(renderer, currentLevelRef.current);
              setQuality(currentLevelRef.current);
            }
          } else if (avgFps > targetFps * 0.95 && currentLevelRef.current !== 'ultra') {
            // Performance is good, try increasing quality
            const levels: (keyof typeof OPTIMIZATION_LEVELS)[] = ['low', 'medium', 'high', 'ultra'];
            const currentIndex = levels.indexOf(currentLevelRef.current);
            if (currentIndex < levels.length - 1) {
              currentLevelRef.current = levels[currentIndex + 1];
              applyOptimization(renderer, currentLevelRef.current);
              setQuality(currentLevelRef.current);
            }
          }

          setTimeout(() => setIsAdapting(false), 500);
        }

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      requestAnimationFrame(adaptQuality);
    };

    // Initialize with detected capabilities
    const capabilities = detectDeviceCapabilities();
    const recommendedLevel = getRecommendedOptimizationLevel(capabilities);
    currentLevelRef.current = recommendedLevel;
    applyOptimization(renderer, recommendedLevel);
    setQuality(recommendedLevel);

    const rafId = requestAnimationFrame(adaptQuality);

    return () => cancelAnimationFrame(rafId);
  }, [renderer, targetFps]);

  return { quality, isAdapting };
}

// LOD (Level of Detail) object interface
interface LODObject extends THREE.Object3D {
  lodLevels?: THREE.Object3D[];
  currentLODLevel?: number;
}

// Dynamic LOD adjustment
export function adjustLOD(
  camera: THREE.Camera,
  objects: THREE.Object3D[],
  lodDistances: number[] = [10, 25, 50, 100]
): void {
  const cameraPosition = new THREE.Vector3();
  camera.getWorldPosition(cameraPosition);

  objects.forEach((obj) => {
    const lodObj = obj as LODObject;
    if (!lodObj.lodLevels || lodObj.lodLevels.length === 0) return;

    const objectPosition = new THREE.Vector3();
    lodObj.getWorldPosition(objectPosition);
    
    const distance = cameraPosition.distanceTo(objectPosition);

    // Determine which LOD level to use
    let targetLevel = lodObj.lodLevels.length - 1;
    for (let i = 0; i < lodDistances.length; i++) {
      if (distance < lodDistances[i]) {
        targetLevel = i;
        break;
      }
    }

    // Clamp to available levels
    targetLevel = Math.min(targetLevel, lodObj.lodLevels.length - 1);

    // Switch LOD level if needed
    if (lodObj.currentLODLevel !== targetLevel) {
      // Hide current level
      if (lodObj.currentLODLevel !== undefined && lodObj.lodLevels[lodObj.currentLODLevel]) {
        lodObj.lodLevels[lodObj.currentLODLevel].visible = false;
      }

      // Show new level
      if (lodObj.lodLevels[targetLevel]) {
        lodObj.lodLevels[targetLevel].visible = true;
      }

      lodObj.currentLODLevel = targetLevel;
    }
  });
}

// Auto-detect and apply optimal settings
export function applyAutoOptimization(renderer: THREE.WebGLRenderer): DeviceCapabilities {
  const capabilities = detectDeviceCapabilities();
  const recommendedLevel = getRecommendedOptimizationLevel(capabilities);
  
  applyOptimization(renderer, recommendedLevel);
  
  // Additional renderer settings based on device
  if (capabilities.isMobile) {
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
  }
  
  return capabilities;
}

// Manual quality setter
export function setQualityLevel(
  renderer: THREE.WebGLRenderer,
  level: keyof typeof OPTIMIZATION_LEVELS
): void {
  applyOptimization(renderer, level);
}
