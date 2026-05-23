/**
 * Camera Animation Utilities for Stigmator 3D Mockup Generator
 * 
 * Provides smooth camera transitions, keyframe animations, and
 * showcase preset animations for the mockup viewer.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CameraKeyframe {
  position: THREE.Vector3;
  target: THREE.Vector3;
  duration: number;  // milliseconds
  easing: EasingType;
}

export type EasingType = 
  | 'linear' 
  | 'ease-in' 
  | 'ease-out' 
  | 'ease-in-out' 
  | 'bounce' 
  | 'elastic'
  | 'back-in'
  | 'back-out';

export interface AnimationOptions {
  onUpdate?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
}

interface AnimationState {
  isPlaying: boolean;
  currentFrame: number;
  startTime: number;
  rafId: number | null;
  keyframes: CameraKeyframe[];
}

// ============================================================================
// Easing Functions
// ============================================================================

const easingFunctions: Record<EasingType, (t: number) => number> = {
  'linear': (t) => t,
  'ease-in': (t) => t * t,
  'ease-out': (t) => 1 - Math.pow(1 - t, 2),
  'ease-in-out': (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  'bounce': (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  'elastic': (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  'back-in': (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  'back-out': (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

// ============================================================================
// Animation State Management
// ============================================================================

const animationState: AnimationState = {
  isPlaying: false,
  currentFrame: 0,
  startTime: 0,
  rafId: null,
  keyframes: [],
};

// ============================================================================
// Core Animation Functions
// ============================================================================

/**
 * Interpolate between two camera keyframes
 */
function interpolateKeyframes(
  from: CameraKeyframe,
  to: CameraKeyframe,
  progress: number
): { position: THREE.Vector3; target: THREE.Vector3 } {
  const easedProgress = easingFunctions[to.easing](progress);
  
  const position = new THREE.Vector3().lerpVectors(
    from.position,
    to.position,
    easedProgress
  );
  
  const target = new THREE.Vector3().lerpVectors(
    from.target,
    to.target,
    easedProgress
  );
  
  return { position, target };
}

/**
 * Apply camera state to camera and controls
 */
function applyCameraState(
  camera: THREE.Camera,
  controls: OrbitControls,
  position: THREE.Vector3,
  target: THREE.Vector3
): void {
  camera.position.copy(position);
  controls.target.copy(target);
  controls.update();
}

/**
 * Cancel any ongoing animation
 */
export function cancelCameraAnimation(): void {
  if (animationState.rafId !== null) {
    cancelAnimationFrame(animationState.rafId);
    animationState.rafId = null;
  }
  animationState.isPlaying = false;
  animationState.keyframes = [];
}

/**
 * Animate camera through a series of keyframes
 */
export function animateCamera(
  camera: THREE.Camera,
  controls: OrbitControls,
  keyframes: CameraKeyframe[],
  options: AnimationOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Cancel any existing animation
    cancelCameraAnimation();
    
    if (keyframes.length < 2) {
      reject(new Error('At least 2 keyframes required for animation'));
      return;
    }
    
    // Validate keyframes
    for (let i = 0; i < keyframes.length; i++) {
      const kf = keyframes[i];
      if (!kf.position || !kf.target || !kf.duration || !kf.easing) {
        reject(new Error(`Invalid keyframe at index ${i}`));
        return;
      }
    }
    
    animationState.isPlaying = true;
    animationState.currentFrame = 0;
    animationState.startTime = performance.now();
    animationState.keyframes = keyframes;
    
    // Get initial camera state for first keyframe if not provided
    const firstKeyframe = keyframes[0];
    let currentFrom = {
      position: camera.position.clone(),
      target: controls.target.clone(),
      duration: 0,
      easing: 'linear' as EasingType,
    };
    
    // Animation loop
    const animate = () => {
      if (!animationState.isPlaying) {
        options.onCancel?.();
        reject(new Error('Animation cancelled'));
        return;
      }
      
      const now = performance.now();
      const elapsed = now - animationState.startTime;
      
      // Find current keyframe pair
      let accumulatedTime = 0;
      let currentIndex = 0;
      
      for (let i = 1; i < keyframes.length; i++) {
        const segmentDuration = keyframes[i].duration;
        if (elapsed < accumulatedTime + segmentDuration) {
          currentIndex = i;
          break;
        }
        accumulatedTime += segmentDuration;
        currentFrom = keyframes[i - 1];
      }
      
      // Check if animation is complete
      if (currentIndex === 0 || elapsed >= accumulatedTime + keyframes[currentIndex].duration) {
        // Animation complete - ensure we're at the final state
        const lastKeyframe = keyframes[keyframes.length - 1];
        applyCameraState(camera, controls, lastKeyframe.position, lastKeyframe.target);
        
        animationState.isPlaying = false;
        animationState.rafId = null;
        animationState.keyframes = [];
        
        options.onComplete?.();
        resolve();
        return;
      }
      
      // Calculate progress within current segment
      const segmentElapsed = elapsed - accumulatedTime;
      const segmentDuration = keyframes[currentIndex].duration;
      const progress = Math.min(segmentElapsed / segmentDuration, 1);
      
      // Interpolate and apply
      const toKeyframe = keyframes[currentIndex];
      const { position, target } = interpolateKeyframes(
        currentFrom,
        toKeyframe,
        progress
      );
      
      applyCameraState(camera, controls, position, target);
      
      options.onUpdate?.();
      
      animationState.rafId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationState.rafId = requestAnimationFrame(animate);
  });
}

/**
 * Simple tween between two camera states
 */
export function tweenCamera(
  camera: THREE.Camera,
  controls: OrbitControls,
  targetPosition: THREE.Vector3,
  targetLookAt: THREE.Vector3,
  duration: number,
  options: AnimationOptions & { easing?: EasingType } = {}
): Promise<void> {
  const easing = options.easing || 'ease-in-out';
  
  const keyframes: CameraKeyframe[] = [
    {
      position: camera.position.clone(),
      target: controls.target.clone(),
      duration: 0,
      easing: 'linear',
    },
    {
      position: targetPosition,
      target: targetLookAt,
      duration,
      easing,
    },
  ];
  
  return animateCamera(camera, controls, keyframes, options);
}

// ============================================================================
// Showcase Animation Presets
// ============================================================================

/**
 * Create a full rotation showcase animation
 */
export function createShowcaseAnimation(
  camera: THREE.Camera,
  controls: OrbitControls,
  options: {
    radius?: number;
    height?: number;
    rotations?: number;
    duration?: number;
    includeZooms?: boolean;
  } = {}
): CameraKeyframe[] {
  const {
    radius = 5,
    height = 2,
    rotations = 1,
    duration = 8000,
    includeZooms = true,
  } = options;
  
  const keyframes: CameraKeyframe[] = [];
  const steps = includeZooms ? 8 : 4;
  const stepDuration = duration / steps;
  
  // Starting position (front view)
  const startPosition = new THREE.Vector3(0, height, radius);
  const target = new THREE.Vector3(0, 0, 0);
  
  keyframes.push({
    position: startPosition,
    target,
    duration: 0,
    easing: 'linear',
  });
  
  // Full rotation
  for (let i = 1; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2 * rotations;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    
    // Add some height variation for visual interest
    const y = height + Math.sin(angle * 2) * 0.5;
    
    // Add zoom variations if enabled
    const zoomFactor = includeZooms && i % 2 === 0 ? 0.7 : 1;
    const adjustedRadius = radius * zoomFactor;
    
    const position = new THREE.Vector3(
      Math.sin(angle) * adjustedRadius,
      y,
      Math.cos(angle) * adjustedRadius
    );
    
    keyframes.push({
      position,
      target: target.clone(),
      duration: stepDuration,
      easing: i === steps ? 'ease-out' : 'ease-in-out',
    });
  }
  
  return keyframes;
}

/**
 * Create a product detail showcase animation
 */
export function createDetailShowcaseAnimation(
  camera: THREE.Camera,
  controls: OrbitControls,
  options: {
    duration?: number;
    detailPoints?: Array<{ position: THREE.Vector3; target: THREE.Vector3; label: string }>;
  } = {}
): CameraKeyframe[] {
  const {
    duration = 6000,
    detailPoints = [],
  } = options;
  
  const keyframes: CameraKeyframe[] = [];
  
  // Default detail points if none provided
  const defaultPoints = [
    { position: new THREE.Vector3(0, 2, 4), target: new THREE.Vector3(0, 0, 0), label: 'front' },
    { position: new THREE.Vector3(3, 1, 2), target: new THREE.Vector3(0.5, 0, 0), label: 'detail-right' },
    { position: new THREE.Vector3(-3, 1, 2), target: new THREE.Vector3(-0.5, 0, 0), label: 'detail-left' },
    { position: new THREE.Vector3(0, 0, 2.5), target: new THREE.Vector3(0, 0, 0), label: 'chest-detail' },
    { position: new THREE.Vector3(0, 2, 4), target: new THREE.Vector3(0, 0, 0), label: 'return' },
  ];
  
  const points = detailPoints.length > 0 ? detailPoints : defaultPoints;
  const stepDuration = duration / (points.length - 1);
  
  points.forEach((point, index) => {
    keyframes.push({
      position: point.position,
      target: point.target,
      duration: index === 0 ? 0 : stepDuration,
      easing: index === points.length - 1 ? 'ease-out' : 'ease-in-out',
    });
  });
  
  return keyframes;
}

/**
 * Create a turntable animation (360 degree rotation around Y axis)
 */
export function createTurntableAnimation(
  camera: THREE.Camera,
  controls: OrbitControls,
  options: {
    radius?: number;
    height?: number;
    duration?: number;
    direction?: 'clockwise' | 'counterclockwise';
  } = {}
): CameraKeyframe[] {
  const {
    radius = 5,
    height = 2,
    duration = 4000,
    direction = 'clockwise',
  } = options;
  
  const keyframes: CameraKeyframe[] = [];
  const steps = 36; // 10-degree increments for smooth rotation
  const stepDuration = duration / steps;
  const multiplier = direction === 'clockwise' ? 1 : -1;
  
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2 * multiplier;
    const position = new THREE.Vector3(
      Math.sin(angle) * radius,
      height,
      Math.cos(angle) * radius
    );
    
    keyframes.push({
      position,
      target: new THREE.Vector3(0, 0, 0),
      duration: i === 0 ? 0 : stepDuration,
      easing: 'linear',
    });
  }
  
  return keyframes;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert spherical coordinates to Cartesian position
 */
export function sphericalToPosition(
  theta: number,  // azimuthal angle (horizontal)
  phi: number,    // polar angle (vertical)
  radius: number
): THREE.Vector3 {
  const x = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);
  
  return new THREE.Vector3(x, y, z);
}

/**
 * Create a position from spherical coordinates for camera
 */
export function createCameraPosition(
  theta: number,
  phi: number,
  radius: number,
  target: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
): { position: THREE.Vector3; target: THREE.Vector3 } {
  const position = sphericalToPosition(theta, phi, radius);
  return { position, target };
}

/**
 * Check if camera animation is currently playing
 */
export function isCameraAnimating(): boolean {
  return animationState.isPlaying;
}

/**
 * Get current animation progress (0-1)
 */
export function getAnimationProgress(): number {
  if (!animationState.isPlaying || animationState.keyframes.length < 2) {
    return 0;
  }
  
  const totalDuration = animationState.keyframes.reduce(
    (sum, kf, i) => sum + (i === 0 ? 0 : kf.duration),
    0
  );
  const elapsed = performance.now() - animationState.startTime;
  
  return Math.min(elapsed / totalDuration, 1);
}
