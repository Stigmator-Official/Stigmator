# Mobile Components for Stigmator 3D Mockup Generator

Mobile-optimized components for the Stigmator 3D mockup generator with touch gesture support, bottom sheets, and adaptive quality settings.

## Components

### Layout (`layout.tsx`)

```tsx
import { MobileLayout, useDeviceType, useResponsiveMockupLayout } from "./mobile";

// Hook usage
const deviceType = useDeviceType(); // 'mobile' | 'tablet' | 'desktop'
const { isMobile, isTablet, showSidePanels, bottomSheetHeight } = useResponsiveMockupLayout();

// Component usage
<MobileLayout
  viewport={<ThreeScene {...sceneProps} />}
  toolbar={<PrimaryToolbar {...toolbarProps} />}
  controls={<MobileControlTabs />}
  showGestureHints={true}
/>
```

### Bottom Sheet (`bottom-sheet.tsx`)

```tsx
import { BottomSheet, GarmentControlsSheet, DesignControlsSheet, ExportSheet } from "./mobile";

// Generic bottom sheet
<BottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  snapPoints={[25, 50, 85]}
  initialSnap={0}
  title="Controls"
>
  {/* Content */}
</BottomSheet>

// Pre-configured sheets
<GarmentControlsSheet />
<DesignControlsSheet />
<ExportSheet />
```

### Gesture Controls (`gesture-controls.tsx`)

```tsx
import { useGestureControls, useMockupGestures, GestureHints } from "./mobile";

// Hook usage with element ref
const elementRef = useRef<HTMLElement>(null);
useGestureControls(elementRef, {
  onPan: ({ x, y }) => console.log("Pan:", x, y),
  onZoom: (scale) => console.log("Zoom:", scale),
  onTap: ({ x, y }) => console.log("Tap:", x, y),
  onDoubleTap: () => console.log("Double tap!"),
});

// Three.js specific hook
const { bind } = useMockupGestures(camera, controls);
<canvas {...bind} />

// Gesture hints overlay
<GestureHints />
```

### Simplified UI (`simplified-ui.tsx`)

```tsx
import {
  MobileGarmentSelector,
  MobileColorPicker,
  MobileTransformControls,
  QuickActionsFAB,
  MobileExportFlow,
} from "./mobile";

// Garment selection
<MobileGarmentSelector
  selectedType="tshirt"
  onSelect={(type) => console.log(type)}
/>

// Color picker
<MobileColorPicker
  selectedColor="#1a1a1a"
  onSelect={(color) => console.log(color)}
/>

// Transform controls
<MobileTransformControls
  values={{ x: 0, y: 0, scale: 1, rotation: 0 }}
  onChange={(values) => console.log(values)}
/>

// Quick actions FAB
<QuickActionsFAB
  onScreenshot={() => console.log("Screenshot")}
  onReset={() => console.log("Reset")}
  onHelp={() => console.log("Help")}
/>

// Export flow
<MobileExportFlow
  isOpen={isExporting}
  onClose={() => setIsExporting(false)}
  onExport={async (format, quality) => {
    // Export logic
    return imageUrl;
  }}
/>
```

## Mobile Optimizations (`mobile-optimizations.ts`)

```tsx
import {
  getMobileOptimizedSettings,
  useBatteryAwareRendering,
  useNetworkAwareLoading,
  optimizeForTouch,
  useReducedMotion,
  useAdaptiveQuality,
} from "@/lib/mockup/mobile-optimizations";

// Get optimized settings
const settings = getMobileOptimizedSettings();
// Returns: { pixelRatio, shadowQuality, enablePostProcessing, ... }

// Battery-aware rendering
const { shouldReduceQuality, isPowerSaveMode, battery } = useBatteryAwareRendering();

// Network-aware loading
const { shouldUseLowRes, connectionType, networkState } = useNetworkAwareLoading();

// Touch optimization for OrbitControls
optimizeForTouch(orbitControls);

// Reduced motion support
const prefersReducedMotion = useReducedMotion();

// Adaptive quality based on FPS
const { currentFPS, shouldReduceQuality } = useAdaptiveQuality(30);
```

## Complete Example

```tsx
"use client";

import { useState } from "react";
import { ThreeScene } from "@/components/mockup";
import {
  MobileLayout,
  MobileControlTabs,
  QuickActionsFAB,
  MobileExportFlow,
  PrimaryToolbar,
  useDeviceType,
  useResponsiveMockupLayout,
  getMobileOptimizedSettings,
  useBatteryAwareRendering,
} from "@/components/mockup";
import { useMockupState } from "@/lib/mockup";

export default function MobileMockupPage() {
  const deviceType = useDeviceType();
  const { isMobile } = useResponsiveMockupLayout();
  const { shouldReduceQuality } = useBatteryAwareRendering();
  const mockupState = useMockupState();
  
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  // Get optimized settings
  const settings = getMobileOptimizedSettings();
  
  // Adjust settings based on battery
  const finalSettings = {
    ...settings,
    pixelRatio: shouldReduceQuality ? 0.75 : settings.pixelRatio,
    enablePostProcessing: !shouldReduceQuality && settings.enablePostProcessing,
  };

  if (!isMobile) {
    return <DesktopMockupPage />;
  }

  return (
    <>
      <MobileLayout
        viewport={
          <ThreeScene
            {...mockupState.state}
            pixelRatio={finalSettings.pixelRatio}
            enablePostProcessing={finalSettings.enablePostProcessing}
          />
        }
        toolbar={
          <PrimaryToolbar
            zoomLevel={mockupState.state.zoom}
            onZoomIn={() => mockupState.setZoom(mockupState.state.zoom + 10)}
            onZoomOut={() => mockupState.setZoom(mockupState.state.zoom - 10)}
            onResetView={mockupState.resetCamera}
            showGrid={mockupState.state.showGrid}
            onToggleGrid={mockupState.toggleGrid}
            showPrintArea={mockupState.state.showPrintArea}
            onTogglePrintArea={mockupState.togglePrintArea}
            onScreenshot={() => setIsExportOpen(true)}
            isFullscreen={mockupState.state.isFullscreen}
            onToggleFullscreen={mockupState.toggleFullscreen}
          />
        }
        controls={<MobileControlTabs />}
      />
      
      <QuickActionsFAB
        onScreenshot={() => setIsExportOpen(true)}
        onReset={mockupState.resetTransform}
      />
      
      <MobileExportFlow
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={mockupState.exportMockup}
      />
    </>
  );
}
```

## Features

- **Responsive Layout**: Automatic detection of mobile/tablet/desktop
- **Bottom Sheets**: Swipeable sheets with snap points
- **Touch Gestures**: Pinch to zoom, drag to rotate, double-tap to reset
- **Gesture Hints**: Visual guidance for touch interactions
- **Adaptive Quality**: Automatic quality reduction based on device capabilities
- **Battery Awareness**: Reduce quality when battery is low
- **Network Awareness**: Use low-res assets on slow connections
- **Reduced Motion**: Respect user's motion preferences
- **Dark Theme**: All components support dark theme

## Browser Support

- iOS Safari 12+
- Chrome Android 60+
- Chrome Desktop (with mobile emulation)
- Firefox Mobile
- Samsung Internet

## Dependencies

- React 18+
- Three.js / React Three Fiber
- shadcn/ui components (Button, Slider, Progress, Tabs, Dialog)
- Lucide React icons
