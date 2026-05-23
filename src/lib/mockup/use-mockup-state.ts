"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// Types
export type GarmentType = "tshirt" | "hoodie" | "tank" | "longsleeve";
export type GarmentVariant = "slim" | "regular" | "oversized";
export type PrintArea = "front" | "back" | "left-sleeve" | "right-sleeve";
export type LightingPreset = "studio" | "dramatic" | "minimal";
export type ViewPreset = "front" | "three-quarter" | "side" | "back" | "top" | "bottom";

export interface TransformState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface DesignState {
  url: string | null;
  fileName: string | null;
}

export interface MockupState {
  // Garment
  garmentType: GarmentType;
  garmentVariant: GarmentVariant;
  garmentColor: string;
  fabric: string;
  printArea: PrintArea;

  // Design
  design: DesignState;
  transform: TransformState;

  // Viewport
  viewPreset: ViewPreset;
  autoRotate: boolean;
  zoom: number;

  // Visual settings
  showGrid: boolean;
  showPrintArea: boolean;
  showSafeZones: boolean;
  lighting: LightingPreset;

  // UI State
  isLoading: boolean;
  isFullscreen: boolean;
  screenshotFlash: boolean;
}

const initialState: MockupState = {
  garmentType: "tshirt",
  garmentVariant: "regular",
  garmentColor: "#1a1a1a",
  fabric: "cotton",
  printArea: "front",
  design: { url: null, fileName: null },
  transform: { x: 0, y: 0, scale: 1, rotation: 0 },
  viewPreset: "front",
  autoRotate: false,
  zoom: 100,
  showGrid: false,
  showPrintArea: true,
  showSafeZones: true,
  lighting: "studio",
  isLoading: false,
  isFullscreen: false,
  screenshotFlash: false,
};

// Default colors
export const DEFAULT_COLORS = [
  "#1a1a1a", // Black
  "#f5f5f5", // White
  "#8b4513", // Saddle Brown
  "#2f4f4f", // Dark Slate Gray
  "#800000", // Maroon
  "#191970", // Midnight Blue
  "#556b2f", // Dark Olive Green
  "#4a4a4a", // Charcoal
  "#d2691e", // Chocolate
  "#708090", // Slate Gray
  "#483d8b", // Dark Slate Blue
  "#2e8b57", // Sea Green
];

// Fabric options
export const FABRICS = [
  { id: "cotton", name: "Cotton", weight: 180, stretch: 5 },
  { id: "organic-cotton", name: "Organic Cotton", weight: 160, stretch: 5 },
  { id: "polyester", name: "Polyester", weight: 150, stretch: 10 },
  { id: "triblend", name: "Tri-Blend", weight: 130, stretch: 15 },
  { id: "heavyweight", name: "Heavyweight", weight: 240, stretch: 3 },
  { id: "jersey", name: "Jersey Knit", weight: 160, stretch: 25 },
];

// Position presets
export const POSITION_PRESETS: Record<string, Partial<TransformState>> = {
  "chest-center": { x: 0, y: -20, scale: 0.8, rotation: 0 },
  "full-front": { x: 0, y: 0, scale: 1.2, rotation: 0 },
  "left-chest": { x: -30, y: -25, scale: 0.4, rotation: 0 },
  "right-chest": { x: 30, y: -25, scale: 0.4, rotation: 0 },
  "center-large": { x: 0, y: 10, scale: 1.5, rotation: 0 },
};

// View presets with camera positions
export const VIEW_PRESETS: Record<ViewPreset, { position: [number, number, number]; target: [number, number, number] }> = {
  front: { position: [0, 0, 5], target: [0, 0, 0] },
  "three-quarter": { position: [3, 1, 4], target: [0, 0, 0] },
  side: { position: [5, 0, 0], target: [0, 0, 0] },
  back: { position: [0, 0, -5], target: [0, 0, 0] },
  top: { position: [0, 5, 0], target: [0, 0, 0] },
  bottom: { position: [0, -5, 0], target: [0, 0, 0] },
};

export function useMockupState() {
  const [state, setState] = useState<MockupState>(initialState);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generic setter
  const setValue = useCallback(<K extends keyof MockupState>(key: K, value: MockupState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  // Garment setters
  const setGarmentType = useCallback((type: GarmentType) => {
    setState((prev) => ({ ...prev, garmentType: type }));
    setIsDirty(true);
  }, []);

  const setGarmentVariant = useCallback((variant: GarmentVariant) => {
    setState((prev) => ({ ...prev, garmentVariant: variant }));
    setIsDirty(true);
  }, []);

  const setGarmentColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, garmentColor: color }));
    setIsDirty(true);
  }, []);

  const setFabric = useCallback((fabric: string) => {
    setState((prev) => ({ ...prev, fabric }));
    setIsDirty(true);
  }, []);

  const setPrintArea = useCallback((area: PrintArea) => {
    setState((prev) => ({ ...prev, printArea: area }));
    setIsDirty(true);
  }, []);

  // Design setters
  const setDesign = useCallback((design: DesignState) => {
    setState((prev) => ({ ...prev, design }));
    setIsDirty(true);
  }, []);

  const clearDesign = useCallback(() => {
    setState((prev) => ({ 
      ...prev, 
      design: { url: null, fileName: null },
      transform: { x: 0, y: 0, scale: 1, rotation: 0 }
    }));
    setIsDirty(true);
  }, []);

  // Transform setters
  const setTransform = useCallback((transform: Partial<TransformState>) => {
    setState((prev) => ({ 
      ...prev, 
      transform: { ...prev.transform, ...transform }
    }));
    setIsDirty(true);
  }, []);

  const resetTransform = useCallback(() => {
    setState((prev) => ({ 
      ...prev, 
      transform: { x: 0, y: 0, scale: 1, rotation: 0 }
    }));
    setIsDirty(true);
  }, []);

  const applyPositionPreset = useCallback((presetKey: string) => {
    const preset = POSITION_PRESETS[presetKey];
    if (preset) {
      setState((prev) => ({ 
        ...prev, 
        transform: { ...prev.transform, ...preset }
      }));
      setIsDirty(true);
    }
  }, []);

  // Viewport setters
  const setViewPreset = useCallback((preset: ViewPreset) => {
    setState((prev) => ({ ...prev, viewPreset: preset }));
  }, []);

  const setAutoRotate = useCallback((autoRotate: boolean) => {
    setState((prev) => ({ ...prev, autoRotate }));
  }, []);

  const toggleAutoRotate = useCallback(() => {
    setState((prev) => ({ ...prev, autoRotate: !prev.autoRotate }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({ ...prev, zoom: Math.max(10, Math.min(200, zoom)) }));
  }, []);

  // Visual toggles
  const toggleGrid = useCallback(() => {
    setState((prev) => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const togglePrintArea = useCallback(() => {
    setState((prev) => ({ ...prev, showPrintArea: !prev.showPrintArea }));
  }, []);

  const toggleSafeZones = useCallback(() => {
    setState((prev) => ({ ...prev, showSafeZones: !prev.showSafeZones }));
  }, []);

  const setLighting = useCallback((lighting: LightingPreset) => {
    setState((prev) => ({ ...prev, lighting }));
    setIsDirty(true);
  }, []);

  // Loading state
  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    setState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  // Screenshot flash
  const triggerScreenshotFlash = useCallback(() => {
    setState((prev) => ({ ...prev, screenshotFlash: true }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, screenshotFlash: false }));
    }, 150);
  }, []);

  // Reset camera
  const resetCamera = useCallback(() => {
    setState((prev) => ({ 
      ...prev, 
      viewPreset: "front",
      zoom: 100,
      autoRotate: false
    }));
  }, []);

  // Save functionality
  const save = useCallback(async () => {
    setSaveStatus("saving");
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLastSaved(new Date());
      setIsDirty(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, []);

  // Auto-save (debounced, every 30 seconds)
  useEffect(() => {
    if (isDirty && !state.isLoading) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        save();
      }, 30000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [isDirty, state.isLoading, save]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S - Save
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        save();
      }
      // Space - Toggle auto-rotate
      if (e.key === " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleAutoRotate();
      }
      // 1-9 - View presets
      if (e.key >= "1" && e.key <= "9") {
        const presetIndex = parseInt(e.key) - 1;
        const presets: ViewPreset[] = ["front", "three-quarter", "side", "back", "top", "bottom"];
        if (presetIndex < presets.length) {
          setViewPreset(presets[presetIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [save, toggleAutoRotate, setViewPreset]);

  // Export function
  const exportMockup = useCallback(async (format: "png" | "jpg" | "webp" = "png") => {
    triggerScreenshotFlash();
    // In a real implementation, this would capture the canvas
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      fileName: `mockup-${Date.now()}.${format}`,
    };
  }, [triggerScreenshotFlash]);

  return {
    state,
    isDirty,
    lastSaved,
    saveStatus,
    setValue,
    setGarmentType,
    setGarmentVariant,
    setGarmentColor,
    setFabric,
    setPrintArea,
    setDesign,
    clearDesign,
    setTransform,
    resetTransform,
    applyPositionPreset,
    setViewPreset,
    setAutoRotate,
    toggleAutoRotate,
    setZoom,
    toggleGrid,
    togglePrintArea,
    toggleSafeZones,
    setLighting,
    setLoading,
    toggleFullscreen,
    resetCamera,
    triggerScreenshotFlash,
    save,
    exportMockup,
  };
}
