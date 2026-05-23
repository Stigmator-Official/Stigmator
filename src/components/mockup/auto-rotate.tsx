"use client";

/**
 * Auto-Rotate Component for Stigmator 3D Mockup Generator
 * 
 * Provides automatic turntable rotation with speed control,
 * axis selection, bounce mode, and pause on interaction.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  RotateCw, 
  Pause, 
  Play, 
  RefreshCw,
  ArrowUp,
  ArrowLeftRight,
  MoveHorizontal
} from 'lucide-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AutoRotateProps {
  enabled: boolean;
  speed?: number;              // degrees per second (default: 15)
  axis?: 'y' | 'x';            // rotation axis (default: 'y')
  bounce?: boolean;            // bounce back and forth (default: false)
  pauseOnInteract?: boolean;   // pause when user drags (default: true)
  
  // Callbacks
  onAngleChange?: (angle: number) => void;
  onComplete?: () => void;     // if bounce, called at end of cycle
}

export interface AutoRotateControlsProps extends AutoRotateProps {
  onEnabledChange: (enabled: boolean) => void;
  onSpeedChange: (speed: number) => void;
  onAxisChange: (axis: 'y' | 'x') => void;
  onBounceChange: (bounce: boolean) => void;
  className?: string;
}

// ============================================================================
// Hook for use in ThreeScene
// ============================================================================

interface UseAutoRotateOptions extends AutoRotateProps {
  controls: OrbitControls | null;
}

/**
 * Hook to enable auto-rotation in a Three.js scene with OrbitControls
 */
export function useAutoRotate(
  controls: OrbitControls | null,
  options: AutoRotateProps
): { isPaused: boolean; currentAngle: number; reset: () => void } {
  const {
    enabled,
    speed = 15,
    axis = 'y',
    bounce = false,
    pauseOnInteract = true,
    onAngleChange,
    onComplete,
  } = options;
  
  const [isPaused, setIsPaused] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  
  const stateRef = useRef({
    isDragging: false,
    lastInteractionTime: 0,
    rotationDirection: 1,
    accumulatedAngle: 0,
    baseAzimuthAngle: 0,
    basePolarAngle: 0,
  });
  
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  // Reset rotation state
  const reset = useCallback(() => {
    stateRef.current.accumulatedAngle = 0;
    stateRef.current.rotationDirection = 1;
    setCurrentAngle(0);
  }, []);
  
  // Handle interaction start
  const handleInteractionStart = useCallback(() => {
    if (!pauseOnInteract || !enabled) return;
    
    stateRef.current.isDragging = true;
    stateRef.current.lastInteractionTime = performance.now();
    setIsPaused(true);
  }, [pauseOnInteract, enabled]);
  
  // Handle interaction end
  const handleInteractionEnd = useCallback(() => {
    if (!pauseOnInteract || !enabled) return;
    
    stateRef.current.isDragging = false;
    stateRef.current.lastInteractionTime = performance.now();
    
    // Resume after a short delay
    setTimeout(() => {
      if (!stateRef.current.isDragging) {
        setIsPaused(false);
      }
    }, 500);
  }, [pauseOnInteract, enabled]);
  
  // Set up event listeners for interaction
  useEffect(() => {
    if (!controls || !enabled || !pauseOnInteract) return;
    
    const domElement = controls.domElement;
    if (!domElement) return;
    
    domElement.addEventListener('mousedown', handleInteractionStart);
    domElement.addEventListener('touchstart', handleInteractionStart, { passive: true });
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchend', handleInteractionEnd);
    
    return () => {
      domElement.removeEventListener('mousedown', handleInteractionStart);
      domElement.removeEventListener('touchstart', handleInteractionStart);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [controls, enabled, pauseOnInteract, handleInteractionStart, handleInteractionEnd]);
  
  // Auto-rotate animation loop
  useEffect(() => {
    if (!controls || !enabled) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }
    
    // Store initial angles
    if (axis === 'y') {
      stateRef.current.baseAzimuthAngle = controls.getAzimuthalAngle();
    } else {
      stateRef.current.basePolarAngle = controls.getPolarAngle();
    }
    
    lastTimeRef.current = performance.now();
    
    const animate = () => {
      const now = performance.now();
      const deltaTime = (now - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = now;
      
      if (!isPaused && !stateRef.current.isDragging) {
        const rotationSpeed = (speed * deltaTime * Math.PI) / 180; // Convert to radians
        
        if (bounce) {
          // Bounce mode: oscillate between -90 and +90 degrees
          const maxAngle = Math.PI / 2;
          let newAngle = stateRef.current.accumulatedAngle + 
            (rotationSpeed * stateRef.current.rotationDirection);
          
          // Check bounds and bounce
          if (newAngle >= maxAngle) {
            newAngle = maxAngle;
            stateRef.current.rotationDirection = -1;
            onComplete?.();
          } else if (newAngle <= -maxAngle) {
            newAngle = -maxAngle;
            stateRef.current.rotationDirection = 1;
            onComplete?.();
          }
          
          stateRef.current.accumulatedAngle = newAngle;
          
          // Apply rotation
          if (axis === 'y') {
            controls.autoRotate = false;
            // Manually set azimuthal angle by updating camera position
            const targetAngle = stateRef.current.baseAzimuthAngle + newAngle;
            const spherical = new (THREE as any).Spherical();
            spherical.setFromVector3(controls.object.position);
            spherical.theta = targetAngle;
            controls.object.position.setFromSpherical(spherical);
            controls.update();
          } else {
            const clampedPolar = Math.max(0.1, Math.min(Math.PI - 0.1, 
              stateRef.current.basePolarAngle + newAngle));
            controls.minPolarAngle = clampedPolar;
            controls.maxPolarAngle = clampedPolar;
          }
          
          const degrees = (newAngle * 180) / Math.PI;
          setCurrentAngle(degrees);
          onAngleChange?.(degrees);
        } else {
          // Continuous rotation
          controls.autoRotate = true;
          controls.autoRotateSpeed = speed / 10; // OrbitControls uses a different scale
          
          stateRef.current.accumulatedAngle += rotationSpeed * stateRef.current.rotationDirection;
          const degrees = ((stateRef.current.accumulatedAngle * 180) / Math.PI) % 360;
          const normalizedDegrees = degrees < 0 ? degrees + 360 : degrees;
          
          setCurrentAngle(normalizedDegrees);
          onAngleChange?.(normalizedDegrees);
        }
      } else {
        // Update base angles when paused
        if (axis === 'y') {
          stateRef.current.baseAzimuthAngle = controls.getAzimuthalAngle();
        } else {
          stateRef.current.basePolarAngle = controls.getPolarAngle();
        }
      }
      
      controls.update();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (controls) {
        controls.autoRotate = false;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI;
      }
    };
  }, [controls, enabled, speed, axis, bounce, isPaused, onAngleChange, onComplete]);
  
  return { isPaused, currentAngle, reset };
}

// ============================================================================
// UI Component
// ============================================================================

export function AutoRotateControls({
  enabled,
  speed = 15,
  axis = 'y',
  bounce = false,
  pauseOnInteract = true,
  onEnabledChange,
  onSpeedChange,
  onAxisChange,
  onBounceChange,
  className = '',
}: AutoRotateControlsProps) {
  const [isPlaying, setIsPlaying] = useState(enabled);
  const [showSpeedSlider, setShowSpeedSlider] = useState(false);
  
  const handleToggle = useCallback((checked: boolean) => {
    setIsPlaying(checked);
    onEnabledChange(checked);
  }, [onEnabledChange]);
  
  const handleSpeedChange = useCallback((value: number[]) => {
    onSpeedChange(value[0]);
  }, [onSpeedChange]);
  
  const handleAxisToggle = useCallback(() => {
    onAxisChange(axis === 'y' ? 'x' : 'y');
  }, [axis, onAxisChange]);
  
  const getSpeedLabel = (s: number): string => {
    if (s <= 5) return 'Slow';
    if (s <= 15) return 'Normal';
    if (s <= 30) return 'Fast';
    return 'Turbo';
  };
  
  return (
    <TooltipProvider>
      <div className={`flex flex-col gap-3 p-3 bg-zinc-900/90 rounded-lg border border-zinc-800 ${className}`}>
        {/* Header with main toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-zinc-200">Auto-Rotate</span>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
        
        {enabled && (
          <>
            {/* Speed Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-zinc-400">Speed</Label>
                <span className="text-xs text-zinc-500">{getSpeedLabel(speed)} ({speed}°/s)</span>
              </div>
              <Slider
                value={[speed]}
                onValueChange={handleSpeedChange}
                min={1}
                max={60}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>1°/s</span>
                <span>60°/s</span>
              </div>
            </div>
            
            {/* Axis Selection */}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400">Axis</Label>
              <div className="flex gap-1">
                <Button
                  variant={axis === 'y' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onAxisChange('y')}
                  className={`h-7 px-2 text-xs ${
                    axis === 'y' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  <ArrowLeftRight className="w-3 h-3 mr-1" />
                  Y
                </Button>
                <Button
                  variant={axis === 'x' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onAxisChange('x')}
                  className={`h-7 px-2 text-xs ${
                    axis === 'x' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  <ArrowUp className="w-3 h-3 mr-1" />
                  X
                </Button>
              </div>
            </div>
            
            {/* Bounce Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MoveHorizontal className="w-3 h-3 text-zinc-500" />
                <Label className="text-xs text-zinc-400 cursor-pointer" htmlFor="bounce-mode">
                  Bounce Mode
                </Label>
              </div>
              <Switch
                checked={bounce}
                onCheckedChange={onBounceChange}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
            
            {/* Pause on Interact */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pause className="w-3 h-3 text-zinc-500" />
                <Label className="text-xs text-zinc-400 cursor-pointer" htmlFor="pause-interact">
                  Pause on Drag
                </Label>
              </div>
              <Switch
                checked={pauseOnInteract}
                onCheckedChange={() => {}}
                disabled
                className="data-[state=checked]:bg-green-600"
              />
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
              <span className="text-xs text-zinc-500">
                {isPlaying ? 'Rotating...' : 'Paused'}
              </span>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

// ============================================================================
// Compact Toggle Button Component
// ============================================================================

export interface AutoRotateToggleProps {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
}

export function AutoRotateToggle({ enabled, onToggle, className = '' }: AutoRotateToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={enabled ? 'default' : 'outline'}
            size="icon"
            onClick={onToggle}
            className={`h-9 w-9 ${
              enabled 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
            } ${className}`}
          >
            {enabled ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCw className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{enabled ? 'Stop auto-rotation' : 'Start auto-rotation'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default AutoRotateControls;
