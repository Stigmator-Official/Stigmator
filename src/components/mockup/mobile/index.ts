"use client";

/**
 * Mobile Components Index for Stigmator 3D Mockup Generator
 * 
 * Central exports for all mobile adaptation components.
 */

// ============================================================================
// Layout Components
// ============================================================================

export {
  MobileLayout,
  MobileContainer,
  useDeviceType,
  useResponsiveMockupLayout,
} from "./layout";

export type {
  MobileLayoutProps,
  MobileContainerProps,
  DeviceType,
  ResponsiveLayoutConfig,
} from "./layout";

// ============================================================================
// Bottom Sheet Components
// ============================================================================

export {
  BottomSheet,
  GarmentControlsSheet,
  DesignControlsSheet,
  ExportSheet,
} from "./bottom-sheet";

export type {
  BottomSheetProps,
  SheetSnapPoint,
} from "./bottom-sheet";

// ============================================================================
// Gesture Control Components
// ============================================================================

export {
  useGestureControls,
  useMockupGestures,
  GestureHints,
  GestureIndicator,
  preventDefaultTouch,
} from "./gesture-controls";

export type {
  GestureState,
  GestureControlsProps,
  MockupGestureBindings,
} from "./gesture-controls";

// ============================================================================
// Simplified UI Components
// ============================================================================

export {
  MobileGarmentSelector,
  MobileColorPicker,
  MobileTransformControls,
  QuickActionsFAB,
  MobileExportFlow,
  MobileDesignUploader,
  MobileControlTabs,
} from "./simplified-ui";

export type {
  MobileGarmentSelectorProps,
  MobileColorPickerProps,
  MobileTransformControlsProps,
  QuickActionsFABProps,
  MobileExportFlowProps,
  ExportStep,
} from "./simplified-ui";

// ============================================================================
// Mobile Optimizations (re-exported from lib)
// ============================================================================

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
} from "@/lib/mockup/mobile-optimizations";

export type {
  MobileOptimizedSettings,
  BatteryState,
  NetworkState,
} from "@/lib/mockup/mobile-optimizations";
