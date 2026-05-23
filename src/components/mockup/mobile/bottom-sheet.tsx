"use client";

/**
 * Bottom Sheet Component for Stigmator 3D Mockup Generator
 * 
 * Swipeable bottom sheet with snap points, handle bar indicator,
 * and backdrop tap-to-close functionality.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shirt, 
  Palette, 
  Download, 
  ChevronUp,
  X
} from "lucide-react";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface BottomSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Callback when sheet should close */
  onClose: () => void;
  /** Sheet content */
  children: React.ReactNode;
  /** Snap points as percentages (0-100) */
  snapPoints?: number[];
  /** Initial snap point index */
  initialSnap?: number;
  /** Optional title for the sheet */
  title?: string;
  /** Optional className */
  className?: string;
  /** Whether to show backdrop */
  showBackdrop?: boolean;
  /** Whether to allow closing by tapping backdrop */
  closeOnBackdropTap?: boolean;
}

export type SheetSnapPoint = "collapsed" | "half" | "full";

// ============================================================================
// Component: BottomSheet
// ============================================================================

/**
 * Swipeable bottom sheet with snap points
 * Features:
 * - Swipe up to expand, swipe down to collapse
 * - Handle bar indicator
 * - Snap to predefined heights
 * - Content scrolls within sheet
 * - Backdrop tap to close
 */
export function BottomSheet({
  isOpen,
  onClose,
  children,
  snapPoints = [25, 50, 85],
  initialSnap = 0,
  title,
  className,
  showBackdrop = true,
  closeOnBackdropTap = true,
}: BottomSheetProps): React.ReactNode {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartTranslateY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate translate percentage based on snap point
  const getTranslatePercentage = useCallback((snapIndex: number): number => {
    const snapHeight = snapPoints[snapIndex] ?? snapPoints[0];
    return 100 - snapHeight;
  }, [snapPoints]);

  // Update translate when snap changes
  useEffect(() => {
    if (!isDragging) {
      setTranslateY(getTranslatePercentage(currentSnap));
    }
  }, [currentSnap, isDragging, getTranslatePercentage]);

  // Handle touch/mouse start
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    dragStartTranslateY.current = translateY;
  }, [translateY]);

  // Handle touch/mouse move
  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging) return;

    const deltaY = clientY - dragStartY.current;
    const windowHeight = window.innerHeight;
    const deltaPercent = (deltaY / windowHeight) * 100;
    
    let newTranslateY = dragStartTranslateY.current + deltaPercent;
    
    // Clamp values
    newTranslateY = Math.max(0, Math.min(85, newTranslateY));
    
    setTranslateY(newTranslateY);
  }, [isDragging]);

  // Handle touch/mouse end
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // Find nearest snap point
    const currentHeight = 100 - translateY;
    let nearestSnap = 0;
    let minDistance = Infinity;

    snapPoints.forEach((point, index) => {
      const distance = Math.abs(currentHeight - point);
      if (distance < minDistance) {
        minDistance = distance;
        nearestSnap = index;
      }
    });

    setCurrentSnap(nearestSnap);
  }, [isDragging, snapPoints, translateY]);

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    // Only start drag from handle or when at top of scroll
    const target = e.target as HTMLElement;
    const isHandle = target.closest('[data-sheet-handle="true"]');
    const isAtTop = contentRef.current?.scrollTop === 0;
    
    if (isHandle || isAtTop) {
      handleDragStart(e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse event handlers
  const onMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isHandle = target.closest('[data-sheet-handle="true"]');
    const isAtTop = contentRef.current?.scrollTop === 0;
    
    if (isHandle || isAtTop) {
      handleDragStart(e.clientY);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  // Close sheet
  const handleClose = useCallback(() => {
    setCurrentSnap(0);
    setTimeout(onClose, 300);
  }, [onClose]);

  // Backdrop click
  const handleBackdropClick = () => {
    if (closeOnBackdropTap) {
      handleClose();
    }
  };

  // Global mouse/touch events for dragging outside element
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
      const handleGlobalMouseUp = () => handleDragEnd();
      const handleGlobalTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientY);
      const handleGlobalTouchEnd = () => handleDragEnd();

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("touchmove", handleGlobalTouchMove);
      document.addEventListener("touchend", handleGlobalTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
        document.removeEventListener("touchmove", handleGlobalTouchMove);
        document.removeEventListener("touchend", handleGlobalTouchEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className={cn(
            "fixed inset-0 bg-black/50 z-40",
            "transition-opacity duration-300",
            isDragging ? "opacity-100" : "opacity-60"
          )}
          onClick={handleBackdropClick}
        />
      )}

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "fixed left-0 right-0 z-50",
          "bg-zinc-900/98 backdrop-blur-xl",
          "border-t border-zinc-800",
          "rounded-t-2xl",
          "shadow-2xl shadow-black/50",
          "flex flex-col",
          className
        )}
        style={{
          top: 0,
          height: "100%",
          transform: `translateY(${translateY}%)`,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          touchAction: "none",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Handle bar */}
        <div
          data-sheet-handle="true"
          className={cn(
            "flex flex-col items-center pt-3 pb-2",
            "cursor-grab active:cursor-grabbing",
            "select-none"
          )}
        >
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
          
          {/* Header with title and close button */}
          {(title || closeOnBackdropTap) && (
            <div className="w-full flex items-center justify-between px-4 mt-2">
              {title && (
                <h3 className="text-sm font-medium text-zinc-100">{title}</h3>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 ml-auto"
                onClick={handleClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div
          ref={contentRef}
          className={cn(
            "flex-1 overflow-y-auto overscroll-contain",
            "px-4 pb-safe"
          )}
          style={{
            // Calculate content height based on current snap
            maxHeight: `${100 - translateY}vh`,
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Component: GarmentControlsSheet
// ============================================================================

/**
 * Pre-configured bottom sheet for garment selection and configuration
 */
export function GarmentControlsSheet(): React.ReactNode {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("type");

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Garment"
      snapPoints={[25, 60, 85]}
      initialSnap={0}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-zinc-800/50 mb-4">
          <TabsTrigger value="type" className="flex-1 data-[state=active]:bg-zinc-700">
            <Shirt className="w-4 h-4 mr-2" />
            Type
          </TabsTrigger>
          <TabsTrigger value="color" className="flex-1 data-[state=active]:bg-zinc-700">
            <Palette className="w-4 h-4 mr-2" />
            Color
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="type" className="mt-0">
          <div className="space-y-4 pb-20">
            <MobileGarmentSelector />
          </div>
        </TabsContent>
        
        <TabsContent value="color" className="mt-0">
          <div className="space-y-4 pb-20">
            <MobileColorPicker />
          </div>
        </TabsContent>
      </Tabs>
    </BottomSheet>
  );
}

// ============================================================================
// Component: DesignControlsSheet
// ============================================================================

/**
 * Pre-configured bottom sheet for design placement and transform controls
 */
export function DesignControlsSheet(): React.ReactNode {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Design"
      snapPoints={[30, 70, 85]}
      initialSnap={0}
    >
      <div className="space-y-6 pb-20">
        {/* Upload Section */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Upload Design
          </label>
          <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center">
            <p className="text-sm text-zinc-400">Tap to upload or drag and drop</p>
            <p className="text-xs text-zinc-500 mt-1">PNG, JPG up to 10MB</p>
          </div>
        </div>

        {/* Transform Controls */}
        <MobileTransformControls />

        {/* Position Presets */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Position Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["Center", "Left Chest", "Right Chest", "Full Front"].map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

// ============================================================================
// Component: ExportSheet
// ============================================================================

/**
 * Pre-configured bottom sheet for export options
 */
export function ExportSheet(): React.ReactNode {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Export"
      snapPoints={[40, 70]}
      initialSnap={0}
    >
      <div className="space-y-4 pb-20">
        {/* Quick Export */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Quick Export
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              PNG
            </Button>
            <Button variant="outline" className="border-zinc-700 text-zinc-300">
              <Download className="w-4 h-4 mr-2" />
              JPG
            </Button>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Resolution
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["1x", "2x", "4x"].map((res) => (
              <Button
                key={res}
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                {res}
              </Button>
            ))}
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Share
          </label>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-zinc-700 text-zinc-300">
              Copy Link
            </Button>
            <Button variant="outline" className="flex-1 border-zinc-700 text-zinc-300">
              Share
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

// ============================================================================
// Internal Components (for pre-configured sheets)
// ============================================================================

function MobileGarmentSelector(): React.ReactNode {
  const garments = [
    { id: "tshirt", name: "T-Shirt", icon: "👕" },
    { id: "hoodie", name: "Hoodie", icon: "🧥" },
    { id: "tank", name: "Tank", icon: "🎽" },
    { id: "longsleeve", name: "Long Sleeve", icon: "👔" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {garments.map((garment) => (
        <Button
          key={garment.id}
          variant="outline"
          className="h-auto py-4 border-zinc-700 hover:bg-zinc-800 flex flex-col items-center gap-2"
        >
          <span className="text-2xl">{garment.icon}</span>
          <span className="text-sm text-zinc-300">{garment.name}</span>
        </Button>
      ))}
    </div>
  );
}

function MobileColorPicker(): React.ReactNode {
  const colors = [
    "#1a1a1a", "#f5f5f5", "#8b4513", "#2f4f4f",
    "#800000", "#191970", "#556b2f", "#4a4a4a",
    "#d2691e", "#708090", "#483d8b", "#2e8b57",
  ];

  return (
    <div className="grid grid-cols-6 gap-2">
      {colors.map((color) => (
        <button
          key={color}
          className="w-10 h-10 rounded-full border-2 border-zinc-700 focus:border-green-500 focus:outline-none transition-transform active:scale-95"
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
}

function MobileTransformControls(): React.ReactNode {
  return (
    <div className="space-y-4">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        Adjust Design
      </label>
      
      {/* Position */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Position</span>
        <div className="flex gap-1">
          {["←", "↑", "↓", "→"].map((arrow) => (
            <Button
              key={arrow}
              variant="outline"
              size="icon"
              className="h-8 w-8 border-zinc-700 text-zinc-300"
            >
              {arrow}
            </Button>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Scale</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">-</Button>
          <span className="text-sm text-zinc-300 w-12 text-center">100%</span>
          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">+</Button>
        </div>
      </div>

      {/* Rotation */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Rotate</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">↺</Button>
          <span className="text-sm text-zinc-300 w-12 text-center">0°</span>
          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">↻</Button>
        </div>
      </div>
    </div>
  );
}

export default BottomSheet;
