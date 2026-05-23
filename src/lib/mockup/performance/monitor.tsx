import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;        // ms
  memory: number;           // MB
  drawCalls: number;
  triangles: number;
  textures: number;
  shaders: number;
}

export interface PerformanceBudget {
  targetFps: number;        // default: 60
  maxFrameTime: number;     // default: 16.67ms
  maxMemory: number;        // default: 256MB
  maxDrawCalls: number;     // default: 500
}

const DEFAULT_BUDGET: PerformanceBudget = {
  targetFps: 60,
  maxFrameTime: 16.67,
  maxMemory: 256,
  maxDrawCalls: 500,
};

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    memory: 0,
    drawCalls: 0,
    triangles: 0,
    textures: 0,
    shaders: 0,
  };
  
  private budget: PerformanceBudget;
  private onBreach: (metric: keyof PerformanceMetrics, value: number) => void;
  private isRunning = false;
  private rafId: number | null = null;
  private lastTime = 0;
  private frameCount = 0;
  private lastFpsUpdate = 0;
  private renderer: THREE.WebGLRenderer | null = null;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;

  constructor(
    budget: Partial<PerformanceBudget> = {},
    onBreach?: (metric: keyof PerformanceMetrics, value: number) => void
  ) {
    this.budget = { ...DEFAULT_BUDGET, ...budget };
    this.onBreach = onBreach || (() => {});
  }

  // Start monitoring
  start(renderer: THREE.WebGLRenderer): void {
    if (this.isRunning) return;
    
    this.renderer = renderer;
    this.gl = renderer.getContext();
    this.isRunning = true;
    this.lastTime = performance.now();
    this.lastFpsUpdate = performance.now();
    this.frameCount = 0;
    
    this.tick();
  }

  // Stop monitoring
  stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.renderer = null;
    this.gl = null;
  }

  private tick = (): void => {
    if (!this.isRunning || !this.renderer) return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    // Update frame count for FPS calculation
    this.frameCount++;

    // Calculate FPS every 500ms
    if (now - this.lastFpsUpdate >= 500) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;

      // Update other metrics
      this.updateMetrics();

      // Check budget breaches
      this.checkBudgetBreaches();
    }

    // Frame time in ms
    this.metrics.frameTime = delta;

    this.rafId = requestAnimationFrame(this.tick);
  };

  private updateMetrics(): void {
    if (!this.renderer || !this.gl) return;

    // Get memory info if available
    const memoryInfo = (performance as any).memory;
    if (memoryInfo) {
      this.metrics.memory = Math.round(memoryInfo.usedJSHeapSize / 1048576); // Convert to MB
    }

    // Get Three.js info
    const info = this.renderer.info;
    this.metrics.drawCalls = info.render.calls;
    this.metrics.triangles = info.render.triangles;
    this.metrics.textures = info.memory.textures;
    this.metrics.shaders = info.programs?.length || 0;
  }

  private checkBudgetBreaches(): void {
    if (this.metrics.fps < this.budget.targetFps * 0.9) {
      this.onBreach('fps', this.metrics.fps);
    }
    if (this.metrics.frameTime > this.budget.maxFrameTime) {
      this.onBreach('frameTime', this.metrics.frameTime);
    }
    if (this.metrics.memory > this.budget.maxMemory) {
      this.onBreach('memory', this.metrics.memory);
    }
    if (this.metrics.drawCalls > this.budget.maxDrawCalls) {
      this.onBreach('drawCalls', this.metrics.drawCalls);
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Check if within budget
  isWithinBudget(): boolean {
    return (
      this.metrics.fps >= this.budget.targetFps * 0.9 &&
      this.metrics.frameTime <= this.budget.maxFrameTime &&
      this.metrics.memory <= this.budget.maxMemory &&
      this.metrics.drawCalls <= this.budget.maxDrawCalls
    );
  }

  // Get recommendations
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.fps < 30) {
      recommendations.push('FPS is critically low. Consider reducing quality settings or scene complexity.');
    } else if (this.metrics.fps < this.budget.targetFps * 0.9) {
      recommendations.push('FPS is below target. Try reducing shadow quality or disabling post-processing effects.');
    }

    if (this.metrics.frameTime > this.budget.maxFrameTime * 1.5) {
      recommendations.push('Frame time is very high. Consider using simpler geometries or reducing draw calls.');
    }

    if (this.metrics.memory > this.budget.maxMemory * 0.9) {
      recommendations.push('Memory usage is approaching limit. Dispose unused textures and geometries.');
    }

    if (this.metrics.drawCalls > this.budget.maxDrawCalls) {
      recommendations.push('Too many draw calls. Consider merging geometries or using instanced meshes.');
    }

    if (this.metrics.triangles > 1000000) {
      recommendations.push('High triangle count. Use LOD (Level of Detail) for distant objects.');
    }

    if (this.metrics.textures > 100) {
      recommendations.push('Many textures loaded. Consider texture atlasing or lazy loading.');
    }

    if (this.metrics.shaders > 50) {
      recommendations.push('Many shader programs. Try reusing materials to reduce shader compilation.');
    }

    return recommendations;
  }
}

// React hook
export function usePerformanceMonitor(
  renderer: THREE.WebGLRenderer | null,
  budget?: Partial<PerformanceBudget>
): { metrics: PerformanceMetrics; isHealthy: boolean } {
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memory: 0,
    drawCalls: 0,
    triangles: 0,
    textures: 0,
    shaders: 0,
  });
  const [isHealthy, setIsHealthy] = useState(true);

  useEffect(() => {
    if (!renderer) return;

    monitorRef.current = new PerformanceMonitor(budget, (metric, value) => {
      console.warn(`Performance budget breached: ${metric} = ${value}`);
    });

    monitorRef.current.start(renderer);

    // Update metrics periodically
    const interval = setInterval(() => {
      if (monitorRef.current) {
        const currentMetrics = monitorRef.current.getMetrics();
        setMetrics(currentMetrics);
        setIsHealthy(monitorRef.current.isWithinBudget());
      }
    }, 500);

    return () => {
      clearInterval(interval);
      monitorRef.current?.stop();
      monitorRef.current = null;
    };
  }, [renderer, budget]);

  return { metrics, isHealthy };
}

// FPS counter component
export function FPSCounter() {
  const [fps, setFps] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      frameCountRef.current++;
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      if (delta >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / delta));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    // Toggle visibility with key press (F key)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isVisible) return null;

  const getColor = () => {
    if (fps >= 55) return '#22c55e'; // green-500
    if (fps >= 30) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: getColor(),
        padding: '8px 16px',
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: 'bold',
        zIndex: 10000,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {fps} FPS
    </div>
  );
}
