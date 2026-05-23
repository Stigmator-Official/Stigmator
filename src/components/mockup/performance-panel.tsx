import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  PerformanceMonitor, 
  PerformanceMetrics, 
  PerformanceBudget 
} from '@/lib/mockup/performance/monitor';
import { 
  OPTIMIZATION_LEVELS, 
  setQualityLevel, 
  detectDeviceCapabilities,
  DeviceCapabilities
} from '@/lib/mockup/performance/optimizer';
import { 
  getRendererMemory, 
  requestGC 
} from '@/lib/mockup/performance/memory';

export interface PerformancePanelProps {
  isOpen: boolean;
  onClose: () => void;
  renderer?: THREE.WebGLRenderer | null;
  budget?: Partial<PerformanceBudget>;
}

interface FPSDataPoint {
  timestamp: number;
  fps: number;
}

export function PerformancePanel({ 
  isOpen, 
  onClose, 
  renderer, 
  budget 
}: PerformancePanelProps): React.ReactElement | null {
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memory: 0,
    drawCalls: 0,
    triangles: 0,
    textures: 0,
    shaders: 0,
  });
  const [fpsHistory, setFpsHistory] = useState<FPSDataPoint[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [deviceInfo, setDeviceInfo] = useState<DeviceCapabilities | null>(null);
  const [rendererMemory, setRendererMemory] = useState({ geometries: 0, textures: 0, totalMB: 0 });

  // Initialize monitor
  useEffect(() => {
    if (!isOpen || !renderer) return;

    monitorRef.current = new PerformanceMonitor(budget);
    monitorRef.current.start(renderer);

    // Get device capabilities
    setDeviceInfo(detectDeviceCapabilities());

    return () => {
      monitorRef.current?.stop();
      monitorRef.current = null;
    };
  }, [isOpen, renderer, budget]);

  // Update metrics periodically
  useEffect(() => {
    if (!isOpen || !monitorRef.current) return;

    const interval = setInterval(() => {
      const currentMetrics = monitorRef.current!.getMetrics();
      setMetrics(currentMetrics);

      // Update FPS history
      const now = Date.now();
      setFpsHistory(prev => {
        const newHistory = [...prev, { timestamp: now, fps: currentMetrics.fps }].filter(
          point => now - point.timestamp < 30000 // Keep last 30 seconds
        );
        return newHistory;
      });

      // Update recommendations
      setRecommendations(monitorRef.current!.getOptimizationRecommendations());

      // Update renderer memory
      if (renderer) {
        setRendererMemory(getRendererMemory(renderer));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen, renderer]);

  // Draw FPS graph
  useEffect(() => {
    if (!canvasRef.current || fpsHistory.length < 2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Calculate scales
    const now = Date.now();
    const minTime = now - 30000;
    const maxFps = Math.max(60, ...fpsHistory.map(d => d.fps));

    // Draw FPS line
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();

    fpsHistory.forEach((point, index) => {
      const x = ((point.timestamp - minTime) / 30000) * width;
      const y = height - (point.fps / maxFps) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw target FPS line (60 FPS)
    ctx.strokeStyle = '#3b82f6';
    ctx.setLineDash([5, 5]);
    const targetY = height - (60 / maxFps) * height;
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(width, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px monospace';
    ctx.fillText('60 FPS', 5, targetY - 5);
    ctx.fillText(`${maxFps} FPS`, 5, 15);
    ctx.fillText('0 FPS', 5, height - 5);
  }, [fpsHistory]);

  // Handle quality change
  const handleQualityChange = useCallback((quality: keyof typeof OPTIMIZATION_LEVELS) => {
    if (!renderer) return;
    setQualityLevel(renderer, quality);
    setCurrentQuality(quality);
  }, [renderer]);

  // Handle GC request
  const handleRequestGC = useCallback(() => {
    requestGC();
  }, []);

  // Get color based on value
  const getMetricColor = (value: number, threshold: number): string => {
    const ratio = value / threshold;
    if (ratio < 0.7) return '#22c55e'; // green
    if (ratio < 0.9) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  // Format memory value
  const formatMemory = (mb: number): string => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(2)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 360,
        height: '100vh',
        backgroundColor: '#111827',
        color: '#f3f4f6',
        padding: 20,
        overflowY: 'auto',
        zIndex: 9999,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 14,
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Performance Monitor</h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            fontSize: 20,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          ×
        </button>
      </div>

      {/* FPS Graph */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: 14, color: '#9ca3af' }}>FPS History (30s)</h3>
        <canvas
          ref={canvasRef}
          width={320}
          height={120}
          style={{ borderRadius: 8, display: 'block' }}
        />
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <MetricCard
          label="FPS"
          value={metrics.fps}
          color={getMetricColor(60 - metrics.fps, 30)}
        />
        <MetricCard
          label="Frame Time"
          value={`${metrics.frameTime.toFixed(2)} ms`}
          color={getMetricColor(metrics.frameTime, 16.67)}
        />
        <MetricCard
          label="Draw Calls"
          value={metrics.drawCalls}
          color={getMetricColor(metrics.drawCalls, 500)}
        />
        <MetricCard
          label="Triangles"
          value={metrics.triangles.toLocaleString()}
          color={getMetricColor(metrics.triangles, 1000000)}
        />
        <MetricCard
          label="Textures"
          value={metrics.textures}
          color={getMetricColor(metrics.textures, 100)}
        />
        <MetricCard
          label="Shaders"
          value={metrics.shaders}
          color={getMetricColor(metrics.shaders, 50)}
        />
      </div>

      {/* Memory Usage */}
      <div style={{ marginBottom: 20, padding: 12, backgroundColor: '#1f2937', borderRadius: 8 }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: 14, color: '#9ca3af' }}>Memory Usage</h3>
        
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Heap Memory</span>
            <span style={{ color: getMetricColor(metrics.memory, 256) }}>
              {formatMemory(metrics.memory)}
            </span>
          </div>
          <ProgressBar value={metrics.memory} max={256} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Geometries</span>
            <span>{rendererMemory.geometries}</span>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Textures</span>
            <span>{rendererMemory.textures}</span>
          </div>
        </div>

        <button
          onClick={handleRequestGC}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '8px 16px',
            backgroundColor: '#374151',
            color: '#f3f4f6',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Request Garbage Collection
        </button>
      </div>

      {/* Quality Settings */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: 14, color: '#9ca3af' }}>Quality Settings</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {(Object.keys(OPTIMIZATION_LEVELS) as Array<keyof typeof OPTIMIZATION_LEVELS>).map(level => (
            <button
              key={level}
              onClick={() => handleQualityChange(level)}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: currentQuality === level ? '#3b82f6' : '#374151',
                color: '#f3f4f6',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                textTransform: 'capitalize',
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Device Info */}
      {deviceInfo && (
        <div style={{ marginBottom: 20, padding: 12, backgroundColor: '#1f2937', borderRadius: 8 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: 14, color: '#9ca3af' }}>Device Info</h3>
          <InfoRow label="GPU Tier" value={deviceInfo.gpuTier} />
          <InfoRow label="Mobile" value={deviceInfo.isMobile ? 'Yes' : 'No'} />
          <InfoRow label="Max Texture" value={`${deviceInfo.maxTextureSize}px`} />
          <InfoRow label="WebGL2" value={deviceInfo.supportsWebGL2 ? 'Yes' : 'No'} />
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: 14, color: '#9ca3af' }}>Recommendations</h3>
          <ul style={{ margin: 0, paddingLeft: 16, color: '#fbbf24' }}>
            {recommendations.map((rec, index) => (
              <li key={index} style={{ marginBottom: 6, lineHeight: 1.4 }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
        Press F to toggle FPS counter
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: string | number; 
  color: string;
}): React.ReactElement {
  return (
    <div
      style={{
        padding: 12,
        backgroundColor: '#1f2937',
        borderRadius: 8,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color }}>{value}</div>
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ value, max }: { value: number; max: number }): React.ReactElement {
  const percentage = Math.min((value / max) * 100, 100);
  const color = percentage > 90 ? '#ef4444' : percentage > 70 ? '#eab308' : '#22c55e';

  return (
    <div
      style={{
        height: 6,
        backgroundColor: '#374151',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: color,
          transition: 'width 0.3s ease, background-color 0.3s ease',
        }}
      />
    </div>
  );
}

// Info Row Component
function InfoRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ color: '#9ca3af' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default PerformancePanel;
