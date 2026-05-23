"use client";

/**
 * Animation Export Component for Stigmator 3D Mockup Generator
 * 
 * Provides frame-by-frame capture and export as video (MP4/WebM) or GIF.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Video,
  Film,
  Image,
  Download,
  X,
  Play,
  Pause,
  Settings,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCw,
  Clock,
  Monitor,
  FileType
} from 'lucide-react';
import { createTurntableAnimation, CameraKeyframe, animateCamera, cancelCameraAnimation } from '@/lib/mockup/camera-animation';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ExportFormat = 'mp4' | 'webm' | 'gif';

export interface ExportResolution {
  width: number;
  height: number;
  label?: string;
}

export interface AnimationExportOptions {
  duration: number;           // seconds
  fps: number;               // default: 30
  resolution: ExportResolution;
  format: ExportFormat;
  quality?: number;          // 0-1 for video formats
  transparent?: boolean;     // for GIF
  loop?: boolean;            // for GIF
}

export interface AnimationExportProps {
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  renderer: THREE.WebGLRenderer | null;
  controls: OrbitControls | null;
  isOpen: boolean;
  onClose: () => void;
  onExport?: (blob: Blob, format: ExportFormat) => void;
  className?: string;
}

export interface ExportProgress {
  frame: number;
  total: number;
  percentage: number;
  estimatedTimeRemaining: number; // seconds
}

// ============================================================================
// Preset Resolutions
// ============================================================================

const PRESET_RESOLUTIONS: ExportResolution[] = [
  { width: 1280, height: 720, label: 'HD (720p)' },
  { width: 1920, height: 1080, label: 'Full HD (1080p)' },
  { width: 2560, height: 1440, label: 'QHD (1440p)' },
  { width: 3840, height: 2160, label: '4K UHD' },
  { width: 1080, height: 1080, label: 'Square (1:1)' },
  { width: 1080, height: 1920, label: 'Vertical (9:16)' },
];

// ============================================================================
// GIF Encoder Worker
// ============================================================================

// Simple GIF encoder using canvas frames
// In production, you might want to use gif.js or similar library
class GifEncoder {
  private frames: ImageData[] = [];
  private width: number;
  private height: number;
  private delay: number;
  private loop: boolean;
  
  constructor(width: number, height: number, delay: number = 100, loop: boolean = true) {
    this.width = width;
    this.height = height;
    this.delay = delay;
    this.loop = loop;
  }
  
  addFrame(imageData: ImageData): void {
    this.frames.push(imageData);
  }
  
  // This is a placeholder - actual GIF encoding would require a library like gif.js
  async encode(): Promise<Blob> {
    // Return a dummy blob for now
    // In production, use gif.js or similar
    return new Blob(['GIF placeholder'], { type: 'image/gif' });
  }
  
  getFrameCount(): number {
    return this.frames.length;
  }
  
  clear(): void {
    this.frames = [];
  }
}

// ============================================================================
// Video Recorder
// ============================================================================

class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private canvas: HTMLCanvasElement;
  private stream: MediaStream | null = null;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }
  
  start(format: 'mp4' | 'webm', fps: number): void {
    this.stream = this.canvas.captureStream(fps);
    
    const mimeType = format === 'mp4' 
      ? 'video/mp4;codecs=h264' 
      : 'video/webm;codecs=vp9';
    
    // Fallback if preferred codec not supported
    const actualMimeType = MediaRecorder.isTypeSupported(mimeType) 
      ? mimeType 
      : 'video/webm';
    
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: actualMimeType,
      videoBitsPerSecond: 5000000, // 5 Mbps
    });
    
    this.chunks = [];
    
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };
    
    this.mediaRecorder.start();
  }
  
  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not started'));
        return;
      }
      
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mediaRecorder?.mimeType });
        this.chunks = [];
        resolve(blob);
      };
      
      this.mediaRecorder.onerror = (e) => {
        reject(new Error(`Recording error: ${e}`));
      };
      
      this.mediaRecorder.stop();
      this.stream?.getTracks().forEach(track => track.stop());
    });
  }
  
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

// ============================================================================
// Export Animation Controller
// ============================================================================

interface ExportState {
  isExporting: boolean;
  isPaused: boolean;
  progress: ExportProgress;
  previewUrl: string | null;
  error: string | null;
}

// ============================================================================
// Main Component
// ============================================================================

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function AnimationExport({
  scene,
  camera,
  renderer,
  controls,
  isOpen,
  onClose,
  onExport,
  className = '',
}: AnimationExportProps) {
  // Export options
  const [format, setFormat] = useState<ExportFormat>('webm');
  const [duration, setDuration] = useState(5);
  const [fps, setFps] = useState(30);
  const [resolution, setResolution] = useState<ExportResolution>(PRESET_RESOLUTIONS[1]);
  const [quality, setQuality] = useState(0.9);
  const [transparent, setTransparent] = useState(false);
  const [loop, setLoop] = useState(true);
  const [activeTab, setActiveTab] = useState('format');
  
  // Export state
  const [exportState, setExportState] = useState<ExportState>({
    isExporting: false,
    isPaused: false,
    progress: {
      frame: 0,
      total: 0,
      percentage: 0,
      estimatedTimeRemaining: 0,
    },
    previewUrl: null,
    error: null,
  });
  
  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const recorderRef = useRef<VideoRecorder | null>(null);
  const gifEncoderRef = useRef<GifEncoder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setExportState({
        isExporting: false,
        isPaused: false,
        progress: {
          frame: 0,
          total: 0,
          percentage: 0,
          estimatedTimeRemaining: 0,
        },
        previewUrl: null,
        error: null,
      });
    }
  }, [isOpen]);
  
  // Calculate total frames
  const totalFrames = Math.round(duration * fps);
  
  // Estimate file size
  const estimateFileSize = useCallback((): string => {
    const pixels = resolution.width * resolution.height;
    const frames = totalFrames;
    
    let bytesPerFrame: number;
    switch (format) {
      case 'gif':
        bytesPerFrame = pixels * 0.5; // GIF compression is variable
        break;
      case 'mp4':
        bytesPerFrame = pixels * 3 * (quality * 0.5);
        break;
      case 'webm':
        bytesPerFrame = pixels * 2 * quality;
        break;
      default:
        bytesPerFrame = pixels * 3;
    }
    
    const totalBytes = bytesPerFrame * frames;
    
    if (totalBytes < 1024 * 1024) {
      return `${(totalBytes / 1024).toFixed(1)} KB`;
    } else if (totalBytes < 1024 * 1024 * 1024) {
      return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  }, [resolution, totalFrames, format, quality]);
  
  // Start export
  const startExport = useCallback(async () => {
    if (!scene || !camera || !renderer || !controls) {
      setExportState(prev => ({ ...prev, error: 'Scene not ready' }));
      return;
    }
    
    setExportState(prev => ({
      ...prev,
      isExporting: true,
      isPaused: false,
      progress: {
        frame: 0,
        total: totalFrames,
        percentage: 0,
        estimatedTimeRemaining: duration,
      },
      error: null,
    }));
    
    abortControllerRef.current = new AbortController();
    const startTime = performance.now();
    
    try {
      // Create capture canvas
      const canvas = document.createElement('canvas');
      canvas.width = resolution.width;
      canvas.height = resolution.height;
      canvasRef.current = canvas;
      
      // Setup recorder/encoder based on format
      if (format === 'mp4' || format === 'webm') {
        recorderRef.current = new VideoRecorder(canvas);
        recorderRef.current.start(format, fps);
      } else {
        gifEncoderRef.current = new GifEncoder(
          resolution.width,
          resolution.height,
          1000 / fps,
          loop
        );
      }
      
      // Store original renderer size
      const originalSize = renderer.getSize(new THREE.Vector2());
      const originalPixelRatio = renderer.getPixelRatio();
      
      // Set renderer to export resolution
      renderer.setSize(resolution.width, resolution.height, false);
      renderer.setPixelRatio(1);
      
      // Create turntable animation keyframes
      const keyframes = createTurntableAnimation(camera, controls, {
        radius: 5,
        height: 2,
        duration: duration * 1000,
        direction: 'clockwise',
      });
      
      // Capture each frame
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      for (let frame = 0; frame < totalFrames; frame++) {
        // Check for cancellation
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Export cancelled');
        }
        
        // Wait if paused
        while (exportState.isPaused) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Export cancelled');
          }
        }
        
        // Calculate progress through animation
        const progress = frame / totalFrames;
        const keyframeIndex = Math.min(
          Math.floor(progress * (keyframes.length - 1)),
          keyframes.length - 2
        );
        const keyframeProgress = (progress * (keyframes.length - 1)) % 1;
        
        // Interpolate camera position
        const from = keyframes[keyframeIndex];
        const to = keyframes[keyframeIndex + 1];
        
        if (from && to) {
          camera.position.lerpVectors(from.position, to.position, keyframeProgress);
          controls.target.lerpVectors(from.target, to.target, keyframeProgress);
          controls.update();
        }
        
        // Render scene
        renderer.render(scene, camera);
        
        // Capture frame
        if (format === 'gif') {
          ctx.drawImage(renderer.domElement, 0, 0);
          const imageData = ctx.getImageData(0, 0, resolution.width, resolution.height);
          gifEncoderRef.current?.addFrame(imageData);
        }
        // For video, the MediaRecorder captures the canvas automatically
        
        // Update progress
        const elapsed = (performance.now() - startTime) / 1000;
        const avgTimePerFrame = elapsed / (frame + 1);
        const remainingFrames = totalFrames - frame - 1;
        const estimatedRemaining = avgTimePerFrame * remainingFrames;
        
        setExportState(prev => ({
          ...prev,
          progress: {
            frame: frame + 1,
            total: totalFrames,
            percentage: Math.round(((frame + 1) / totalFrames) * 100),
            estimatedTimeRemaining: estimatedRemaining,
          },
        }));
        
        // Small delay to allow UI updates
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      // Finalize export
      let blob: Blob;
      
      if (format === 'mp4' || format === 'webm') {
        blob = await recorderRef.current!.stop();
      } else {
        blob = await gifEncoderRef.current!.encode();
      }
      
      // Create preview URL
      const url = URL.createObjectURL(blob);
      
      setExportState(prev => ({
        ...prev,
        isExporting: false,
        previewUrl: url,
      }));
      
      onExport?.(blob, format);
      
      // Restore renderer
      renderer.setSize(originalSize.x, originalSize.y, false);
      renderer.setPixelRatio(originalPixelRatio);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setExportState(prev => ({
        ...prev,
        isExporting: false,
        error: errorMessage,
      }));
    }
  }, [scene, camera, renderer, controls, format, duration, fps, resolution, totalFrames, exportState.isPaused, onExport]);
  
  // Pause/Resume export
  const togglePause = useCallback(() => {
    setExportState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);
  
  // Cancel export
  const cancelExport = useCallback(() => {
    abortControllerRef.current?.abort();
    recorderRef.current?.stop().catch(() => {});
    
    setExportState(prev => ({
      ...prev,
      isExporting: false,
      isPaused: false,
    }));
  }, []);
  
  // Download exported file
  const downloadExport = useCallback(() => {
    if (!exportState.previewUrl) return;
    
    const link = document.createElement('a');
    link.href = exportState.previewUrl;
    link.download = `stigmator-animation-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [exportState.previewUrl, format]);
  
  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-green-500" />
            Export Animation
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Export a turntable animation of your design
          </DialogDescription>
        </DialogHeader>
        
        {exportState.error && (
          <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
            <AlertCircle className="w-4 h-4" />
            {exportState.error}
          </div>
        )}
        
        {exportState.previewUrl ? (
          // Preview mode
          <div className="space-y-4">
            <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center">
              {format === 'gif' ? (
                <img 
                  src={exportState.previewUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-full"
                />
              ) : (
                <video 
                  src={exportState.previewUrl} 
                  controls 
                  autoPlay 
                  loop
                  className="max-w-full max-h-full"
                />
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Export complete! File size: {estimateFileSize()}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose} className="bg-zinc-800 border-zinc-700">
                Close
              </Button>
              <Button onClick={downloadExport} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </DialogFooter>
          </div>
        ) : exportState.isExporting ? (
          // Exporting mode
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Rendering frames...</span>
                <span className="text-zinc-300">
                  {exportState.progress.frame} / {exportState.progress.total}
                </span>
              </div>
              <Progress 
                value={exportState.progress.percentage} 
                className="h-2 bg-zinc-800"
              />
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{exportState.progress.percentage}% complete</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~{formatTime(exportState.progress.estimatedTimeRemaining)} remaining
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={togglePause}
                className="bg-zinc-800 border-zinc-700"
              >
                {exportState.isPaused ? (
                  <><Play className="w-4 h-4 mr-2" /> Resume</>
                ) : (
                  <><Pause className="w-4 h-4 mr-2" /> Pause</>
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={cancelExport}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Settings mode
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-zinc-800 w-full">
              <TabsTrigger value="format" className="flex-1 data-[state=active]:bg-zinc-700">
                <FileType className="w-4 h-4 mr-2" />
                Format
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-zinc-700">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="format" className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {(['webm', 'mp4', 'gif'] as ExportFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      format === f
                        ? 'bg-green-600/20 border-green-500 text-green-400'
                        : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {f === 'gif' ? <Image className="w-5 h-5" /> : <Film className="w-5 h-5" />}
                      <span className="font-medium uppercase">{f}</span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {f === 'webm' && 'Best for web, good compression'}
                      {f === 'mp4' && 'Widely compatible, high quality'}
                      {f === 'gif' && 'Looping animation, no audio'}
                    </p>
                  </button>
                ))}
              </div>
              
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Estimated file size</span>
                  <span className="font-medium">{estimateFileSize()}</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              {/* Duration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-zinc-300">Duration</Label>
                  <span className="text-sm text-zinc-500">{duration} seconds</span>
                </div>
                <Slider
                  value={[duration]}
                  onValueChange={(v) => setDuration(v[0])}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>
              
              {/* FPS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-zinc-300">Frame Rate</Label>
                  <span className="text-sm text-zinc-500">{fps} fps</span>
                </div>
                <Slider
                  value={[fps]}
                  onValueChange={(v) => setFps(v[0])}
                  min={15}
                  max={60}
                  step={5}
                />
              </div>
              
              {/* Resolution */}
              <div className="space-y-2">
                <Label className="text-sm text-zinc-300">Resolution</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_RESOLUTIONS.map((res) => (
                    <button
                      key={res.label}
                      onClick={() => setResolution(res)}
                      className={`p-2 rounded border text-left text-sm transition-colors ${
                        resolution === res
                          ? 'bg-green-600/20 border-green-500 text-green-400'
                          : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <div className="font-medium">{res.label}</div>
                      <div className="text-xs text-zinc-500">{res.width}×{res.height}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Quality (for video) */}
              {format !== 'gif' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-zinc-300">Quality</Label>
                    <span className="text-sm text-zinc-500">{Math.round(quality * 100)}%</span>
                  </div>
                  <Slider
                    value={[quality * 100]}
                    onValueChange={(v) => setQuality(v[0] / 100)}
                    min={50}
                    max={100}
                    step={5}
                  />
                </div>
              )}
            </TabsContent>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose} className="bg-zinc-800 border-zinc-700">
                Cancel
              </Button>
              <Button 
                onClick={startExport}
                disabled={!scene || !camera || !renderer}
                className="bg-green-600 hover:bg-green-700"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Start Export
              </Button>
            </DialogFooter>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Export utilities
export { VideoRecorder, GifEncoder, PRESET_RESOLUTIONS };

export default AnimationExport;
