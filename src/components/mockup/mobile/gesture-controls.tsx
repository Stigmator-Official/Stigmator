"use client";

/**
 * Gesture Controls Component for Stigmator 3D Mockup Generator
 * 
 * Touch gesture handling for mobile devices with support for
 * pan, zoom, rotate, tap, double-tap, and long-press gestures.
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Maximize, Move, RotateCw, Hand } from "lucide-react";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface GestureState {
  scale: number;
  rotation: number;
  position: { x: number; y: number };
}

export interface GestureControlsProps {
  /** Callback for pan gesture */
  onPan?: (delta: { x: number; y: number }) => void;
  /** Callback for zoom gesture (pinch) */
  onZoom?: (scale: number) => void;
  /** Callback for rotate gesture (two-finger rotation) */
  onRotate?: (angle: number) => void;
  /** Callback for single tap */
  onTap?: (position: { x: number; y: number }) => void;
  /** Callback for double tap */
  onDoubleTap?: () => void;
  /** Callback for long press */
  onLongPress?: () => void;
  /** Minimum distance for pan to trigger (px) */
  panThreshold?: number;
  /** Maximum time between taps for double tap (ms) */
  doubleTapDelay?: number;
  /** Time threshold for long press (ms) */
  longPressDelay?: number;
}

export interface MockupGestureBindings {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchCancel: (e: React.TouchEvent) => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onDoubleClick: () => void;
}

// ============================================================================
// Hook: useGestureControls
// ============================================================================

/**
 * Hook for detecting and handling touch gestures
 * @param elementRef - Ref to the target element
 * @param handlers - Gesture handler callbacks
 */
export function useGestureControls(
  elementRef: React.RefObject<HTMLElement>,
  handlers: GestureControlsProps
): void {
  const {
    onPan,
    onZoom,
    onRotate,
    onTap,
    onDoubleTap,
    onLongPress,
    panThreshold = 10,
    doubleTapDelay = 300,
    longPressDelay = 500,
  } = handlers;

  const gestureState = useRef({
    isDragging: false,
    startPos: { x: 0, y: 0 },
    lastPos: { x: 0, y: 0 },
    startDistance: 0,
    startAngle: 0,
    lastTapTime: 0,
    longPressTimer: null as NodeJS.Timeout | null,
    touches: [] as Touch[],
    scale: 1,
  });

  // Calculate distance between two touch points
  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate angle between two touch points
  const getAngle = useCallback((touch1: Touch, touch2: Touch): number => {
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * (180 / Math.PI);
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touches = Array.from(e.touches);
    gestureState.current.touches = touches;

    if (touches.length === 1) {
      // Single touch - potential pan or tap
      gestureState.current.startPos = { x: touches[0].clientX, y: touches[0].clientY };
      gestureState.current.lastPos = gestureState.current.startPos;
      gestureState.current.isDragging = false;

      // Start long press timer
      if (onLongPress) {
        gestureState.current.longPressTimer = setTimeout(() => {
          onLongPress();
          gestureState.current.longPressTimer = null;
        }, longPressDelay);
      }
    } else if (touches.length === 2) {
      // Two touches - potential pinch zoom or rotation
      gestureState.current.startDistance = getDistance(touches[0], touches[1]);
      gestureState.current.startAngle = getAngle(touches[0], touches[1]);
      
      // Cancel long press
      if (gestureState.current.longPressTimer) {
        clearTimeout(gestureState.current.longPressTimer);
        gestureState.current.longPressTimer = null;
      }
    }
  }, [getDistance, getAngle, onLongPress, longPressDelay]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touches = Array.from(e.touches);

    // Cancel long press on movement
    if (gestureState.current.longPressTimer) {
      const dx = touches[0].clientX - gestureState.current.startPos.x;
      const dy = touches[0].clientY - gestureState.current.startPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > panThreshold) {
        clearTimeout(gestureState.current.longPressTimer);
        gestureState.current.longPressTimer = null;
      }
    }

    if (touches.length === 1 && gestureState.current.touches.length === 1) {
      // Single touch pan
      const currentPos = { x: touches[0].clientX, y: touches[0].clientY };
      const dx = currentPos.x - gestureState.current.startPos.x;
      const dy = currentPos.y - gestureState.current.startPos.y;

      if (Math.sqrt(dx * dx + dy * dy) > panThreshold) {
        gestureState.current.isDragging = true;
        
        if (onPan) {
          const deltaX = currentPos.x - gestureState.current.lastPos.x;
          const deltaY = currentPos.y - gestureState.current.lastPos.y;
          onPan({ x: deltaX, y: deltaY });
        }

        gestureState.current.lastPos = currentPos;
      }
    } else if (touches.length === 2) {
      // Pinch zoom
      if (onZoom) {
        const currentDistance = getDistance(touches[0], touches[1]);
        const scale = currentDistance / gestureState.current.startDistance;
        onZoom(scale);
      }

      // Rotation
      if (onRotate) {
        const currentAngle = getAngle(touches[0], touches[1]);
        const rotation = currentAngle - gestureState.current.startAngle;
        onRotate(rotation);
      }
    }

    gestureState.current.touches = touches;
  }, [getDistance, getAngle, onPan, onZoom, onRotate, panThreshold]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touches = Array.from(e.touches);
    const now = Date.now();

    // Cancel long press timer
    if (gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer);
      gestureState.current.longPressTimer = null;
    }

    if (touches.length === 0) {
      // All touches ended - check for tap
      if (!gestureState.current.isDragging) {
        const timeSinceLastTap = now - gestureState.current.lastTapTime;

        if (timeSinceLastTap < doubleTapDelay && onDoubleTap) {
          // Double tap
          onDoubleTap();
          gestureState.current.lastTapTime = 0;
        } else if (onTap) {
          // Single tap
          onTap(gestureState.current.startPos);
          gestureState.current.lastTapTime = now;
        }
      }
    }

    gestureState.current.isDragging = false;
    gestureState.current.touches = touches;
  }, [onTap, onDoubleTap, doubleTapDelay]);

  // Handle touch cancel
  const handleTouchCancel = useCallback(() => {
    if (gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer);
      gestureState.current.longPressTimer = null;
    }
    gestureState.current.isDragging = false;
    gestureState.current.touches = [];
  }, []);

  // Attach event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });
    element.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);
}

// ============================================================================
// Hook: useMockupGestures
// ============================================================================

interface OrbitControlsLike {
  enableRotate: boolean;
  enableZoom: boolean;
  enablePan: boolean;
  autoRotate: boolean;
  minDistance: number;
  maxDistance: number;
  target: { set: (x: number, y: number, z: number) => void };
  object: { position: { set: (x: number, y: number, z: number) => void } };
  reset: () => void;
}

/**
 * Hook for mockup-specific gesture handling with Three.js camera
 * @param camera - Three.js camera instance
 * @param controls - OrbitControls instance
 * @returns Bindings to spread onto canvas element
 */
export function useMockupGestures(
  camera: { position: { set: (x: number, y: number, z: number) => void } } | null,
  controls: OrbitControlsLike | null
): { bind: MockupGestureBindings } {
  const gestureRef = useRef({
    initialDistance: 0,
    initialScale: 1,
    isPinching: false,
    lastScale: 1,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && controls) {
      gestureRef.current.isPinching = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      gestureRef.current.initialDistance = Math.sqrt(dx * dx + dy * dy);
      gestureRef.current.initialScale = gestureRef.current.lastScale;
      
      // Disable orbit controls during pinch
      controls.enableRotate = false;
      controls.enablePan = false;
    }
  }, [controls]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && controls && gestureRef.current.isPinching) {
      e.preventDefault();
      
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const scale = (distance / gestureRef.current.initialDistance) * gestureRef.current.initialScale;
      gestureRef.current.lastScale = Math.max(0.5, Math.min(3, scale));
      
      // Adjust camera distance based on scale
      const baseDistance = 5;
      const newDistance = baseDistance / gestureRef.current.lastScale;
      controls.minDistance = Math.max(2, newDistance * 0.5);
      controls.maxDistance = Math.min(10, newDistance * 2);
    }
  }, [controls]);

  const handleTouchEnd = useCallback(() => {
    if (controls) {
      gestureRef.current.isPinching = false;
      // Re-enable orbit controls
      controls.enableRotate = true;
      controls.enablePan = true;
    }
  }, [controls]);

  const handleDoubleTap = useCallback(() => {
    // Reset camera position
    if (controls) {
      controls.reset();
      gestureRef.current.lastScale = 1;
    }
  }, [controls]);

  const bindings: MockupGestureBindings = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
    onPointerDown: () => {},
    onPointerMove: () => {},
    onPointerUp: () => {},
    onPointerCancel: () => {},
    onDoubleClick: handleDoubleTap,
  };

  return { bind: bindings };
}

// ============================================================================
// Component: GestureHints
// ============================================================================

interface HintItem {
  icon: React.ReactNode;
  text: string;
  description: string;
}

/**
 * Gesture hints overlay component
 * Shows instructional hints for touch gestures
 */
export function GestureHints(): React.ReactNode {
  const [visibleHints, setVisibleHints] = useState<number[]>([0, 1, 2]);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Stagger hint appearances
    const timers = [
      setTimeout(() => setVisibleHints([0]), 0),
      setTimeout(() => setVisibleHints([0, 1]), 800),
      setTimeout(() => setVisibleHints([0, 1, 2]), 1600),
      setTimeout(() => setFadeOut(true), 4000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const hints: HintItem[] = [
    {
      icon: <Hand className="w-6 h-6" />,
      text: "Drag to rotate",
      description: "Single finger to rotate view",
    },
    {
      icon: <Maximize className="w-6 h-6" />,
      text: "Pinch to zoom",
      description: "Two fingers to zoom in/out",
    },
    {
      icon: <RotateCw className="w-6 h-6" />,
      text: "Double tap to reset",
      description: "Quick double tap to reset view",
    },
  ];

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        "bg-black/40 backdrop-blur-sm",
        "transition-opacity duration-500",
        fadeOut ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="flex flex-col gap-6 p-6">
        {hints.map((hint, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-4",
              "bg-zinc-900/90 backdrop-blur-md",
              "rounded-xl px-5 py-4",
              "border border-zinc-700/50",
              "shadow-xl shadow-black/30",
              "transition-all duration-500",
              visibleHints.includes(index)
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            )}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              {hint.icon}
            </div>
            <div>
              <p className="text-white font-medium">{hint.text}</p>
              <p className="text-zinc-400 text-sm">{hint.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Component: GestureIndicator
// ============================================================================

interface GestureIndicatorProps {
  /** Current gesture being performed */
  gesture: "none" | "pan" | "pinch" | "rotate";
  /** Current scale value (for pinch) */
  scale?: number;
  /** Current rotation angle (for rotate) */
  angle?: number;
}

/**
 * Real-time gesture indicator overlay
 */
export function GestureIndicator({
  gesture,
  scale = 1,
  angle = 0,
}: GestureIndicatorProps): React.ReactNode {
  if (gesture === "none") return null;

  const gestureConfig = {
    pan: { icon: <Move className="w-5 h-5" />, label: "Panning" },
    pinch: { icon: <Maximize className="w-5 h-5" />, label: `${Math.round(scale * 100)}%` },
    rotate: { icon: <RotateCw className="w-5 h-5" />, label: `${Math.round(angle)}°` },
  };

  const config = gestureConfig[gesture];

  return (
    <div
      className={cn(
        "absolute top-20 left-1/2 -translate-x-1/2",
        "bg-zinc-900/80 backdrop-blur-sm",
        "rounded-full px-4 py-2",
        "border border-zinc-700/50",
        "flex items-center gap-2",
        "text-white text-sm font-medium",
        "animate-in fade-in duration-150"
      )}
    >
      <span className="text-green-400">{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}

// ============================================================================
// Utility: preventDefaultTouch
// ============================================================================

/**
 * Prevents default touch behaviors that interfere with 3D manipulation
 * @param element - Target element
 */
export function preventDefaultTouch(element: HTMLElement): () => void {
  const preventScroll = (e: TouchEvent) => {
    // Allow pinch-zoom but prevent page scroll
    if (e.touches.length < 2) {
      e.preventDefault();
    }
  };

  element.addEventListener("touchmove", preventScroll, { passive: false });

  return () => {
    element.removeEventListener("touchmove", preventScroll);
  };
}

export default GestureHints;
