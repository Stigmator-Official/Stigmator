// Main 3D Components
export { ThreeScene } from "./three-scene";
export { GarmentLoader } from "./garment-loader";
export { TransformControls } from "./transform-controls";
export { ViewPresets, ViewControls, KeyboardShortcuts } from "./view-presets";

// Error Handling
export { MockupErrorBoundary, DefaultErrorFallback } from "./error-boundary";

// Mobile Components
export {
  // Layout
  MobileLayout,
  MobileContainer,
  useDeviceType,
  useResponsiveMockupLayout,
  // Bottom Sheet
  BottomSheet,
  GarmentControlsSheet,
  DesignControlsSheet,
  ExportSheet,
  // Gesture Controls
  useGestureControls,
  useMockupGestures,
  GestureHints,
  GestureIndicator,
  // Simplified UI
  MobileGarmentSelector,
  MobileColorPicker,
  MobileTransformControls,
  QuickActionsFAB,
  MobileExportFlow,
  MobileDesignUploader,
  MobileControlTabs,
} from "./mobile";

// Re-export types
export type { TransformState, DesignState } from "@/lib/mockup/use-mockup-state";
export type {
  MobileLayoutProps,
  DeviceType,
  ResponsiveLayoutConfig,
  BottomSheetProps,
  SheetSnapPoint,
  GestureState,
  GestureControlsProps,
  MockupGestureBindings,
  MobileGarmentSelectorProps,
  MobileColorPickerProps,
  MobileTransformControlsProps,
  QuickActionsFABProps,
  MobileExportFlowProps,
  ExportStep,
} from "./mobile";
