"use client";

/**
 * Mobile Layout Component for Stigmator 3D Mockup Generator
 * 
 * Mobile-optimized layout with full-screen viewport,
 * floating toolbar, and bottom sheet controls.
 */

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { GestureHints } from "./gesture-controls";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface MobileLayoutProps {
  /** 3D scene viewport */
  viewport: React.ReactNode;
  /** Bottom sheet controls */
  controls: React.ReactNode;
  /** Floating toolbar */
  toolbar: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Whether to show gesture hints */
  showGestureHints?: boolean;
}

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface ResponsiveLayoutConfig {
  isMobile: boolean;
  isTablet: boolean;
  showSidePanels: boolean;
  bottomSheetHeight: number;
}

// ============================================================================
// Hook: useDeviceType
// ============================================================================

/**
 * Hook to detect device type based on screen width and user agent
 * @returns Device type: 'mobile' | 'tablet' | 'desktop'
 */
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Check for touch devices
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      
      // Check user agent for mobile/tablet indicators
      const isMobileUA = /mobile|iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(userAgent);
      const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);

      if (width < 640 || (isMobileUA && !isTabletUA)) {
        setDeviceType("mobile");
      } else if (width < 1024 || isTabletUA || (isTouchDevice && width < 1024)) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return deviceType;
}

// ============================================================================
// Hook: useResponsiveMockupLayout
// ============================================================================

/**
 * Hook for responsive layout configuration
 * @returns Layout configuration based on device type
 */
export function useResponsiveMockupLayout(): ResponsiveLayoutConfig {
  const deviceType = useDeviceType();
  const [bottomSheetHeight, setBottomSheetHeight] = useState(25);

  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const showSidePanels = deviceType === "desktop";

  // Update bottom sheet height based on device
  useEffect(() => {
    if (isMobile) {
      setBottomSheetHeight(25);
    } else if (isTablet) {
      setBottomSheetHeight(35);
    } else {
      setBottomSheetHeight(0);
    }
  }, [isMobile, isTablet]);

  return {
    isMobile,
    isTablet,
    showSidePanels,
    bottomSheetHeight,
  };
}

// ============================================================================
// Hook: useViewportHeight
// ============================================================================

/**
 * Hook to handle mobile viewport height (accounting for browser UI)
 * @returns Safe viewport height in pixels
 */
function useViewportHeight(): number {
  const [vh, setVh] = useState(0);

  useEffect(() => {
    const updateVh = () => {
      // Use visual viewport if available (handles mobile browser UI)
      const visualVh = window.visualViewport?.height || window.innerHeight;
      setVh(visualVh);
    };

    updateVh();
    
    window.addEventListener("resize", updateVh);
    window.visualViewport?.addEventListener("resize", updateVh);
    
    return () => {
      window.removeEventListener("resize", updateVh);
      window.visualViewport?.removeEventListener("resize", updateVh);
    };
  }, []);

  return vh;
}

// ============================================================================
// Hook: useOrientation
// ============================================================================

/**
 * Hook to detect device orientation
 * @returns Current orientation and whether it's landscape
 */
function useOrientation(): { orientation: "portrait" | "landscape"; isLandscape: boolean } {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  useEffect(() => {
    const updateOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      setOrientation(isLandscape ? "landscape" : "portrait");
    };

    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);
    
    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, []);

  return {
    orientation,
    isLandscape: orientation === "landscape",
  };
}

// ============================================================================
// Component: MobileLayout
// ============================================================================

/**
 * Mobile-optimized layout for 3D mockup generator
 * Features:
 * - Full-screen viewport
 * - Floating toolbar at top
 * - Bottom sheet for controls
 * - Gesture hints overlay
 * - Orientation-aware layout
 */
export function MobileLayout({
  viewport,
  controls,
  toolbar,
  className,
  showGestureHints = true,
}: MobileLayoutProps): React.ReactNode {
  const [showHints, setShowHints] = useState(showGestureHints);
  const [hasInteracted, setHasInteracted] = useState(false);
  const vh = useViewportHeight();
  const { isLandscape } = useOrientation();
  const deviceType = useDeviceType();

  // Hide hints after first interaction
  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Delay hiding hints for better UX
      setTimeout(() => setShowHints(false), 2000);
    }
  }, [hasInteracted]);

  // Handle viewport meta tag for mobile
  useEffect(() => {
    if (deviceType === "mobile" || deviceType === "tablet") {
      // Ensure proper viewport scaling
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        );
      }
    }
  }, [deviceType]);

  // Prevent pull-to-refresh on mobile
  useEffect(() => {
    const preventPullToRefresh = (e: TouchEvent) => {
      if (e.touches[0].clientY > 0) {
        e.preventDefault();
      }
    };

    if (deviceType === "mobile") {
      document.body.addEventListener("touchmove", preventPullToRefresh, { passive: false });
    }

    return () => {
      document.body.removeEventListener("touchmove", preventPullToRefresh);
    };
  }, [deviceType]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[#0a0f0a]",
        isLandscape ? "h-screen flex-row" : "flex flex-col",
        className
      )}
      style={{ height: vh || "100vh" }}
      onTouchStart={handleInteraction}
      onPointerDown={handleInteraction}
    >
      {/* Full-screen viewport */}
      <div
        className={cn(
          "relative",
          isLandscape ? "flex-1 h-full" : "flex-1 w-full"
        )}
      >
        {viewport}
      </div>

      {/* Floating toolbar at top */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-20",
          "flex justify-center pt-4 px-4",
          "pointer-events-none"
        )}
      >
        <div className="pointer-events-auto">{toolbar}</div>
      </div>

      {/* Bottom sheet for controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-30",
          isLandscape && "hidden"
        )}
      >
        {controls}
      </div>

      {/* Side panel for landscape mode */}
      {isLandscape && (
        <div
          className={cn(
            "h-full w-80 z-30",
            "bg-zinc-900/95 backdrop-blur-md",
            "border-l border-zinc-800",
            "overflow-y-auto"
          )}
        >
          {controls}
        </div>
      )}

      {/* Gesture hints overlay */}
      {showHints && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          <GestureHints />
        </div>
      )}

      {/* Safe area insets for notched devices */}
      <style jsx global>{`
        :root {
          --sat: env(safe-area-inset-top);
          --sar: env(safe-area-inset-right);
          --sab: env(safe-area-inset-bottom);
          --sal: env(safe-area-inset-left);
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Component: MobileContainer
// ============================================================================

/**
 * Container that automatically switches between mobile and desktop layouts
 */
export interface MobileContainerProps {
  /** Desktop layout component */
  desktopLayout: React.ReactNode;
  /** Mobile layout component */
  mobileLayout: React.ReactNode;
  /** Breakpoint for switching (default: 1024px) */
  breakpoint?: number;
}

export function MobileContainer({
  desktopLayout,
  mobileLayout,
  breakpoint = 1024,
}: MobileContainerProps): React.ReactNode {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return <>{isMobile ? mobileLayout : desktopLayout}</>;
}

export default MobileLayout;
