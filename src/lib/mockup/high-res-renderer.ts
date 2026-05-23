/**
 * High-Resolution Rendering System for Stigmator
 * 
 * Provides offline rendering at high resolutions with queue management,
 * progress tracking, and Web Worker support for non-blocking renders.
 */

import * as THREE from 'three';

export type RenderQuality = 'preview' | 'standard' | 'high' | 'ultra';
export type RenderFormat = 'png' | 'jpg' | 'webp';
export type ToneMappingType = 'none' | 'linear' | 'reinhard' | 'filmic';
export type JobStatus = 'pending' | 'rendering' | 'complete' | 'error' | 'cancelled';

export interface RenderOptions {
  /** Output width (default: 2048) */
  width: number;
  /** Output height (default: 2048) */
  height: number;
  /** Render quality level */
  quality: RenderQuality;
  /** Output format */
  format: RenderFormat;
  /** Transparent background */
  transparent: boolean;
  /** Enable anti-aliasing */
  antialias: boolean;
  /** MSAA samples (1, 4, 8, 16) */
  samples: number;
  /** Post-processing options */
  postProcess: {
    bloom: boolean;
    toneMapping: ToneMappingType;
    contrast: number;
    saturation: number;
  };
}

export interface RenderJob {
  id: string;
  scene: THREE.Scene;
  camera: THREE.Camera;
  options: RenderOptions;
  status: JobStatus;
  progress: number;
  result?: string;
  error?: string;
  abortController: AbortController;
}

export interface RenderJobResult {
  jobId: string;
  dataURL: string;
  blob?: Blob;
  width: number;
  height: number;
  renderTime: number;
}

// Default render options
export const DEFAULT_RENDER_OPTIONS: RenderOptions = {
  width: 2048,
  height: 2048,
  quality: 'standard',
  format: 'png',
  transparent: false,
  antialias: true,
  samples: 4,
  postProcess: {
    bloom: false,
    toneMapping: 'filmic',
    contrast: 1.0,
    saturation: 1.0,
  },
};

// Quality presets map to multipliers
const QUALITY_MULTIPLIERS: Record<RenderQuality, number> = {
  preview: 1,
  standard: 2,
  high: 4,
  ultra: 8,
};

// Progress callback type
type ProgressCallback = (jobId: string, progress: number) => void;

/**
 * High-Resolution Renderer
 * 
 * Manages a queue of render jobs with progress tracking and cancellation support.
 */
export class HighResRenderer {
  private queue: RenderJob[] = [];
  private isProcessing = false;
  private progressCallbacks: ProgressCallback[] = [];
  private renderer: THREE.WebGLRenderer | null = null;
  private offscreenCanvas: OffscreenCanvas | HTMLCanvasElement | null = null;
  private readonly maxTextureSize: number;
  private readonly isWebWorker: boolean;

  constructor(options?: { useWebWorker?: boolean }) {
    this.isWebWorker = options?.useWebWorker ?? false;
    
    // Determine maximum texture size
    const tempRenderer = new THREE.WebGLRenderer({ antialias: false });
    this.maxTextureSize = tempRenderer.capabilities.maxTextureSize;
    tempRenderer.dispose();
  }

  /**
   * Add a render job to the queue
   */
  public enqueue(
    scene: THREE.Scene,
    camera: THREE.Camera,
    options: Partial<RenderOptions> = {}
  ): Promise<RenderJobResult> {
    const mergedOptions = { ...DEFAULT_RENDER_OPTIONS, ...options };
    const jobId = this.generateJobId();
    const abortController = new AbortController();

    const job: RenderJob = {
      id: jobId,
      scene,
      camera,
      options: mergedOptions,
      status: 'pending',
      progress: 0,
      abortController,
    };

    this.queue.push(job);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return new Promise((resolve, reject) => {
      const checkStatus = () => {
        if (job.status === 'complete' && job.result) {
          resolve({
            jobId: job.id,
            dataURL: job.result,
            width: mergedOptions.width,
            height: mergedOptions.height,
            renderTime: 0, // Would be tracked in actual implementation
          });
        } else if (job.status === 'error') {
          reject(new Error(job.error || 'Render failed'));
        } else if (job.status === 'cancelled') {
          reject(new Error('Render cancelled'));
        } else {
          setTimeout(checkStatus, 50);
        }
      };
      checkStatus();
    });
  }

  /**
   * Cancel a pending or in-progress render job
   */
  public cancel(jobId: string): boolean {
    const jobIndex = this.queue.findIndex(job => job.id === jobId);
    
    if (jobIndex === -1) return false;

    const job = this.queue[jobIndex];
    
    if (job.status === 'pending') {
      // Remove from queue
      this.queue.splice(jobIndex, 1);
      job.status = 'cancelled';
      return true;
    } else if (job.status === 'rendering') {
      // Abort the in-progress render
      job.abortController.abort();
      job.status = 'cancelled';
      return true;
    }

    return false;
  }

  /**
   * Cancel all pending jobs
   */
  public cancelAll(): number {
    let cancelled = 0;
    
    // Cancel pending jobs
    for (let i = this.queue.length - 1; i >= 0; i--) {
      const job = this.queue[i];
      if (job.status === 'pending') {
        job.status = 'cancelled';
        this.queue.splice(i, 1);
        cancelled++;
      }
    }

    return cancelled;
  }

  /**
   * Register a progress callback
   */
  public onProgress(callback: ProgressCallback): () => void {
    this.progressCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.progressCallbacks.indexOf(callback);
      if (index > -1) {
        this.progressCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current queue status
   */
  public getQueueStatus(): {
    pending: number;
    rendering: number;
    total: number;
  } {
    const pending = this.queue.filter(j => j.status === 'pending').length;
    const rendering = this.queue.filter(j => j.status === 'rendering').length;
    
    return { pending, rendering, total: this.queue.length };
  }

  /**
   * Clear completed jobs from queue
   */
  public clearCompleted(): void {
    this.queue = this.queue.filter(
      job => job.status === 'pending' || job.status === 'rendering'
    );
  }

  /**
   * Dispose of renderer resources
   */
  public dispose(): void {
    this.cancelAll();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.offscreenCanvas = null;
  }

  /**
   * Process the render queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue[0];
      
      if (job.status === 'cancelled') {
        this.queue.shift();
        continue;
      }

      try {
        job.status = 'rendering';
        this.notifyProgress(job.id, 0);

        const result = await this.render(job);
        job.result = result;
        job.status = 'complete';
        this.notifyProgress(job.id, 100);
      } catch (error) {
        if (job.abortController.signal.aborted) {
          job.status = 'cancelled';
        } else {
          job.status = 'error';
          job.error = error instanceof Error ? error.message : 'Unknown error';
          
          // Try fallback quality if not already at lowest
          await this.attemptFallback(job);
        }
      }

      this.queue.shift();
    }

    this.isProcessing = false;
  }

  /**
   * Perform the actual render
   */
  private async render(job: RenderJob): Promise<string> {
    const { scene, camera, options, abortController } = job;
    const signal = abortController.signal;

    // Calculate actual dimensions based on quality
    const multiplier = QUALITY_MULTIPLIERS[options.quality];
    let width = options.width * multiplier;
    let height = options.height * multiplier;

    // Clamp to max texture size
    width = Math.min(width, this.maxTextureSize);
    height = Math.min(height, this.maxTextureSize);

    // Check for abort
    if (signal.aborted) throw new Error('Render aborted');

    // Initialize renderer if needed
    if (!this.renderer) {
      this.renderer = this.createRenderer(width, height, options);
    } else {
      this.updateRendererSize(width, height);
    }

    // Update camera aspect ratio
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    } else if (camera instanceof THREE.OrthographicCamera) {
      // Adjust orthographic camera
      const currentWidth = camera.right - camera.left;
      const currentHeight = camera.top - camera.bottom;
      const aspect = width / height;
      const newWidth = currentHeight * aspect;
      const offset = (newWidth - currentWidth) / 2;
      camera.left -= offset;
      camera.right += offset;
      camera.updateProjectionMatrix();
    }

    // Simulate progress updates (in real implementation, these would be incremental)
    this.notifyProgress(job.id, 10);
    
    if (signal.aborted) throw new Error('Render aborted');

    // Configure renderer
    this.renderer.setPixelRatio(1); // Use exact dimensions
    this.renderer.setSize(width, height, false);
    this.renderer.setClearAlpha(options.transparent ? 0 : 1);

    // Apply tone mapping based on options
    this.applyToneMapping(options.postProcess.toneMapping);

    this.notifyProgress(job.id, 30);
    
    if (signal.aborted) throw new Error('Render aborted');

    // Render scene
    this.renderer.render(scene, camera);

    this.notifyProgress(job.id, 70);
    
    if (signal.aborted) throw new Error('Render aborted');

    // Extract image data
    const dataURL = this.renderer.domElement.toDataURL(
      `image/${options.format}`,
      options.format === 'jpg' ? 0.95 : undefined
    );

    this.notifyProgress(job.id, 90);

    return dataURL;
  }

  /**
   * Create a new WebGL renderer
   */
  private createRenderer(
    width: number,
    height: number,
    options: RenderOptions
  ): THREE.WebGLRenderer {
    const rendererOptions: THREE.WebGLRendererParameters = {
      antialias: options.antialias,
      alpha: options.transparent,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    };

    // Use OffscreenCanvas if available and in Web Worker context
    if (this.isWebWorker && typeof OffscreenCanvas !== 'undefined') {
      this.offscreenCanvas = new OffscreenCanvas(width, height);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rendererOptions.canvas = this.offscreenCanvas as any;
    }

    const renderer = new THREE.WebGLRenderer(rendererOptions);
    
    // Set MSAA samples if supported
    if (options.samples > 1 && renderer.capabilities.isWebGL2) {
      // WebGL2 allows setting samples via context attributes
      // This is a simplified version - actual implementation would need
      // to create context with specific sample count
    }

    return renderer;
  }

  /**
   * Update renderer dimensions
   */
  private updateRendererSize(width: number, height: number): void {
    if (this.renderer) {
      this.renderer.setSize(width, height, false);
    }
    if (this.offscreenCanvas instanceof OffscreenCanvas) {
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }
  }

  /**
   * Apply tone mapping settings
   */
  private applyToneMapping(type: ToneMappingType): void {
    if (!this.renderer) return;

    switch (type) {
      case 'linear':
        this.renderer.toneMapping = THREE.LinearToneMapping;
        break;
      case 'reinhard':
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        break;
      case 'filmic':
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        break;
      case 'none':
      default:
        this.renderer.toneMapping = THREE.NoToneMapping;
        break;
    }
    
    this.renderer.toneMappingExposure = 1.0;
  }

  /**
   * Attempt fallback quality if render fails
   */
  private async attemptFallback(job: RenderJob): Promise<void> {
    const qualityOrder: RenderQuality[] = ['ultra', 'high', 'standard', 'preview'];
    const currentIndex = qualityOrder.indexOf(job.options.quality);
    
    // Try lower quality levels
    for (let i = currentIndex + 1; i < qualityOrder.length; i++) {
      const fallbackQuality = qualityOrder[i];
      
      try {
        job.options.quality = fallbackQuality;
        job.status = 'rendering';
        job.error = undefined;
        
        const result = await this.render(job);
        job.result = result;
        job.status = 'complete';
        return;
      } catch (error) {
        continue;
      }
    }

    // All fallbacks failed
    job.status = 'error';
    job.error = 'Render failed at all quality levels';
  }

  /**
   * Notify all progress callbacks
   */
  private notifyProgress(jobId: string, progress: number): void {
    const job = this.queue.find(j => j.id === jobId);
    if (job) {
      job.progress = progress;
    }
    
    this.progressCallbacks.forEach(callback => {
      try {
        callback(jobId, progress);
      } catch (error) {
        console.error('Progress callback error:', error);
      }
    });
  }

  /**
   * Generate a unique job ID
   */
  private generateJobId(): string {
    return `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create an offscreen renderer for non-blocking renders
 * 
 * This creates a renderer that can work in a Web Worker context
 * if Comlink or similar libraries are available.
 */
export function createOffscreenRenderer(): HighResRenderer {
  return new HighResRenderer({ useWebWorker: true });
}

/**
 * Render to Blob for large images (avoids memory issues with dataURLs)
 */
export async function renderToBlob(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality?: number
): Promise<Blob> {
  renderer.render(scene, camera);
  
  const canvas = renderer.domElement;
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      format,
      quality
    );
  });
}

/**
 * Check if offscreen canvas is supported
 */
export function isOffscreenCanvasSupported(): boolean {
  return typeof OffscreenCanvas !== 'undefined' && 
         typeof OffscreenCanvas.prototype.getContext === 'function';
}

/**
 * Get recommended render settings based on device capabilities
 */
export function getRecommendedSettings(): Partial<RenderOptions> {
  const renderer = new THREE.WebGLRenderer({ antialias: false });
  const maxTextureSize = renderer.capabilities.maxTextureSize;
  const isWebGL2 = renderer.capabilities.isWebGL2;
  renderer.dispose();

  // Detect mobile/low-power device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );

  if (isMobile || maxTextureSize < 4096) {
    return {
      quality: 'standard',
      samples: isWebGL2 ? 4 : 1,
      width: 1024,
      height: 1024,
    };
  }

  return {
    quality: 'high',
    samples: isWebGL2 ? 8 : 4,
    width: 2048,
    height: 2048,
  };
}
