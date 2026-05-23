"use client";

/**
 * Mobile Optimizations for Stigmator 3D Mockup Generator
 * 
 * Mobile-specific optimizations including quality reduction,
 * battery-aware rendering, network-aware loading, and touch optimization.
 */

import { useEffect, useState, useCallback, useRef } from "react";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface MobileOptimizedSettings {
  /** Device pixel ratio for rendering */
  pixelRatio: number;
  /** Shadow quality setting */
  shadowQuality: "low" | "medium" | "high";
  /** Whether to enable post-processing effects */
  enablePostProcessing: boolean;
  /** Maximum texture size */
  maxTextureSize: number;
  /** Whether to enable antialiasing */
  enableAntialias: boolean;
  /** Shadow map size */
  shadowMapSize: number;
  /** Whether to enable ambient occlusion */
  enableAO: boolean;
  /** Maximum number of lights */
  maxLights: number;
}

export interface BatteryState {
  /** Battery level (0-1) */
  level: number;
  /** Whether device is charging */
  charging: boolean;
  /** Time remaining until charged (seconds) */
  chargingTime: number;
  /** Time remaining until discharged (seconds) */
  dischargingTime: number;
}

export interface NetworkState {
  /** Connection type */
  type: "4g" | "3g" | "2g" | "slow-2g" | "unknown";
  /** Effective connection type */
  effectiveType: "4g" | "3g" | "2g" | "slow-2g";
  /** Estimated downlink speed (Mbps) */
  downlink: number;
  /** Round-trip time estimate (ms) */
  rtt: number;
  /** Whether data saver is enabled */
  saveData: boolean;
}

// Extend Navigator interface for Battery API
declare global {
  interface Navigator {
    getBattery(): Promise<BatteryManager>;
  }
  
  interface BatteryManager extends EventTarget {
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  }
  
  interface NetworkInformation {
    type: string;
    effectiveType: "4g" | "3g" | "2g" | "slow-2g";
    downlink: number;
    rtt: number;
    saveData: boolean;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  }
  
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

// OrbitControls-like interface
interface OrbitControlsLike {
  enableDamping: boolean;
  dampingFactor: number;
  rotateSpeed: number;
  zoomSpeed: number;
  panSpeed: number;
  touchRotateSpeed: number;
  touchZoomSpeed: number;
  touchPanSpeed: number;
  enableZoom: boolean;
  enableRotate: boolean;
  enablePan: boolean;
}

// ============================================================================
// Device Detection
// ============================================================================

/**
 * Detect if device is a low-end mobile device
 */
export function isLowEndDevice(): boolean {
  if (typeof window === "undefined") return false;

  // Check for low memory (if available)
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory && memory < 4) return true;

  // Check for low core count
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return true;

  // Check for touch device with small screen
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth < 640;
  
  return isTouch && isSmallScreen;
}

/**
 * Detect if device is a high-end mobile device
 */
export function isHighEndMobile(): boolean {
  if (typeof window === "undefined") return false;

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  
  return (!!memory && memory >= 6) || (!!cores && cores >= 6);
}

// ============================================================================
// Settings Generation
// ============================================================================

/**
 * Get mobile-optimized rendering settings based on device capabilities
 */
export function getMobileOptimizedSettings(): MobileOptimizedSettings {
  const isLowEnd = isLowEndDevice();
  const isHighEnd = isHighEndMobile();

  if (isLowEnd) {
    return {
      pixelRatio: 0.75,
      shadowQuality: "low",
      enablePostProcessing: false,
      maxTextureSize: 1024,
      enableAntialias: false,
      shadowMapSize: 512,
      enableAO: false,
      maxLights: 2,
    };
  }

  if (isHighEnd) {
    return {
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      shadowQuality: "high",
      enablePostProcessing: true,
      maxTextureSize: 2048,
      enableAntialias: true,
      shadowMapSize: 2048,
      enableAO: true,
      maxLights: 4,
    };
  }

  // Default mobile settings
  return {
    pixelRatio: 1.0,
    shadowQuality: "medium",
    enablePostProcessing: false,
    maxTextureSize: 1024,
    enableAntialias: true,
    shadowMapSize: 1024,
    enableAO: false,
    maxLights: 3,
  };
}

/**
 * Get tablet-optimized rendering settings
 */
export function getTabletOptimizedSettings(): MobileOptimizedSettings {
  return {
    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
    shadowQuality: "medium",
    enablePostProcessing: true,
    maxTextureSize: 1536,
    enableAntialias: true,
    shadowMapSize: 1024,
    enableAO: true,
    maxLights: 3,
  };
}

// ============================================================================
// Battery-Aware Rendering
// ============================================================================

/**
 * Hook for battery-aware rendering decisions
 */
export function useBatteryAwareRendering(): {
  shouldReduceQuality: boolean;
  isPowerSaveMode: boolean;
  battery: BatteryState | null;
} {
  const [battery, setBattery] = useState<BatteryState | null>(null);
  const [shouldReduceQuality, setShouldReduceQuality] = useState(false);

  useEffect(() => {
    let batteryManager: BatteryManager | null = null;

    const updateBatteryInfo = (bat: BatteryManager) => {
      setBattery({
        level: bat.level,
        charging: bat.charging,
        chargingTime: bat.chargingTime,
        dischargingTime: bat.dischargingTime,
      });

      // Reduce quality if battery is low and not charging
      const isLowBattery = bat.level < 0.2 && !bat.charging;
      setShouldReduceQuality(isLowBattery);
    };

    if ("getBattery" in navigator) {
      navigator.getBattery().then((bat) => {
        batteryManager = bat;
        updateBatteryInfo(bat);

        const handleChange = () => updateBatteryInfo(bat);
        bat.addEventListener("levelchange", handleChange);
        bat.addEventListener("chargingchange", handleChange);

        return () => {
          bat.removeEventListener("levelchange", handleChange);
          bat.removeEventListener("chargingchange", handleChange);
        };
      });
    }

    return () => {
      // Cleanup handled in nested promise
    };
  }, []);

  const isPowerSaveMode = battery !== null && battery.level < 0.2 && !battery.charging;

  return {
    shouldReduceQuality,
    isPowerSaveMode,
    battery,
  };
}

// ============================================================================
// Network-Aware Loading
// ============================================================================

/**
 * Hook for network-aware loading decisions
 */
export function useNetworkAwareLoading(): {
  shouldUseLowRes: boolean;
  connectionType: "4g" | "3g" | "2g" | "slow-2g" | "unknown";
  networkState: NetworkState | null;
} {
  const [networkState, setNetworkState] = useState<NetworkState | null>(null);

  const getConnection = useCallback((): NetworkInformation | undefined => {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  }, []);

  const updateNetworkState = useCallback(() => {
    const connection = getConnection();
    
    if (connection) {
      setNetworkState({
        type: (connection.type as NetworkState["type"]) || "unknown",
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      });
    }
  }, [getConnection]);

  useEffect(() => {
    updateNetworkState();

    const connection = getConnection();
    if (connection) {
      connection.addEventListener("change", updateNetworkState);
      return () => connection.removeEventListener("change", updateNetworkState);
    }
  }, [getConnection, updateNetworkState]);

  const shouldUseLowRes = networkState
    ? networkState.effectiveType === "2g" || 
      networkState.effectiveType === "slow-2g" ||
      networkState.saveData
    : false;

  return {
    shouldUseLowRes,
    connectionType: networkState?.effectiveType || "unknown",
    networkState,
  };
}

// ============================================================================
// Touch Optimization
// ============================================================================

/**
 * Optimize OrbitControls for touch interaction
 * Increases damping and adjusts sensitivity for better mobile feel
 */
export function optimizeForTouch(controls: OrbitControlsLike): void {
  // Increase damping for smoother touch interaction
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;

  // Adjust rotation speed for touch
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.8;
  controls.panSpeed = 0.8;

  // Touch-specific settings (if available)
  controls.touchRotateSpeed = 0.6;
  controls.touchZoomSpeed = 0.7;
  controls.touchPanSpeed = 0.7;

  // Ensure all interactions are enabled
  controls.enableZoom = true;
  controls.enableRotate = true;
  controls.enablePan = true;
}

/**
 * Create touch-optimized camera settings
 */
export function getTouchOptimizedCameraSettings(): {
  fov: number;
  near: number;
  far: number;
  position: [number, number, number];
} {
  return {
    fov: 50, // Slightly wider FOV for mobile
    near: 0.1,
    far: 1000,
    position: [0, 0, 5],
  };
}

// ============================================================================
// Reduced Motion Support
// ============================================================================

/**
 * Hook to detect prefers-reduced-motion setting
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to detect if device prefers high contrast
 */
export function usePrefersHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-contrast: high)");
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersHighContrast;
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Hook to monitor frame rate and adjust quality dynamically
 */
export function useAdaptiveQuality(
  targetFPS: number = 30
): {
  currentFPS: number;
  shouldReduceQuality: boolean;
} {
  const [currentFPS, setCurrentFPS] = useState(60);
  const [shouldReduceQuality, setShouldReduceQuality] = useState(false);
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);

  useEffect(() => {
    let animationFrameId: number;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTime.current;

      if (delta >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / delta);
        
        // Keep last 10 FPS measurements
        fpsHistory.current.push(fps);
        if (fpsHistory.current.length > 10) {
          fpsHistory.current.shift();
        }

        // Calculate average FPS
        const avgFPS = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;
        setCurrentFPS(Math.round(avgFPS));

        // Reduce quality if FPS is consistently low
        const isLowFPS = fpsHistory.current.every(f => f < targetFPS);
        setShouldReduceQuality(isLowFPS);

        frameCount.current = 0;
        lastTime.current = now;
      }

      frameCount.current++;
      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetFPS]);

  return { currentFPS, shouldReduceQuality };
}

// ============================================================================
// Canvas Optimization
// ============================================================================

/**
 * Optimize canvas element for mobile rendering
 */
export function optimizeCanvasForMobile(
  canvas: HTMLCanvasElement,
  settings?: Partial<MobileOptimizedSettings>
): void {
  const defaultSettings = getMobileOptimizedSettings();
  const finalSettings = { ...defaultSettings, ...settings };

  // Set pixel ratio
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const dpr = window.devicePixelRatio * finalSettings.pixelRatio;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
  }

  // CSS optimization
  canvas.style.imageRendering = finalSettings.pixelRatio < 1 ? "auto" : "crisp-edges";
  canvas.style.touchAction = "none";
}

/**
 * Resize observer for responsive canvas
 */
export function useResponsiveCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>
): { width: number; height: number } {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [canvasRef]);

  return dimensions;
}

// ============================================================================
// Memory Management
// ============================================================================

/**
 * Hook to monitor memory usage on supported browsers
 */
export function useMemoryStatus(): {
  usedJSHeapSize: number | null;
  totalJSHeapSize: number | null;
  jsHeapSizeLimit: number | null;
  isMemoryConstrained: boolean;
} {
  const [memory, setMemory] = useState({
    usedJSHeapSize: null as number | null,
    totalJSHeapSize: null as number | null,
    jsHeapSizeLimit: null as number | null,
  });

  useEffect(() => {
    const performanceMemory = (performance as Performance & { memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    } }).memory;

    if (!performanceMemory) return;

    const updateMemory = () => {
      setMemory({
        usedJSHeapSize: performanceMemory.usedJSHeapSize,
        totalJSHeapSize: performanceMemory.totalJSHeapSize,
        jsHeapSizeLimit: performanceMemory.jsHeapSizeLimit,
      });
    };

    updateMemory();
    const interval = setInterval(updateMemory, 5000);

    return () => clearInterval(interval);
  }, []);

  const isMemoryConstrained = memory.jsHeapSizeLimit !== null && 
    memory.usedJSHeapSize !== null &&
    memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8;

  return {
    ...memory,
    isMemoryConstrained,
  };
}

// ============================================================================
// Export utilities
// ============================================================================

/**
 * Combine all mobile optimizations into a single configuration
 */
export function getMobileConfig(): {
  settings: MobileOptimizedSettings;
  shouldReduceQuality: boolean;
  isLowEnd: boolean;
} {
  const settings = getMobileOptimizedSettings();
  const isLowEnd = isLowEndDevice();
  
  return {
    settings,
    shouldReduceQuality: isLowEnd,
    isLowEnd,
  };
}

export default getMobileOptimizedSettings;
