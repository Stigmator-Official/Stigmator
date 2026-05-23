"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Grid3X3,
  Trash2,
  Layers,
  FlipHorizontal,
  FlipVertical,
  ChevronUp,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Plus,
  Move,
  Maximize2,
  RotateCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GarmentType } from "@/lib/garments/catalog";

// ============================================================================
// Types
// ============================================================================

export interface Design {
  id: string;
  name: string;
  image_url: string;
  thumbnail_url?: string;
  style?: string;
  description?: string;
}

export interface DesignPlacement {
  id: string;
  designId: string;
  design: Design;
  zoneId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  opacity: number;
  zIndex: number;
}

interface PlacementCanvasProps {
  garment: GarmentType;
  placements: DesignPlacement[];
  onPlacementsChange: (placements: DesignPlacement[]) => void;
  selectedColor: string;
  availableDesigns?: Design[];
}

interface DragState {
  isDragging: boolean;
  placementId: string | null;
  startX: number;
  startY: number;
  initialPlacementX: number;
  initialPlacementY: number;
}

// ============================================================================
// Color Helpers
// ============================================================================

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

function darkenColor(color: string, percent: number): string {
  return lightenColor(color, -percent);
}

// ============================================================================
// Main Component
// ============================================================================

export function PlacementCanvas({
  garment,
  placements,
  onPlacementsChange,
  selectedColor,
  availableDesigns = [],
}: PlacementCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    placementId: null,
    startX: 0,
    startY: 0,
    initialPlacementX: 0,
    initialPlacementY: 0,
  });

  const selectedPlacement = useMemo(
    () => placements.find((p) => p.id === selectedPlacementId) || null,
    [placements, selectedPlacementId]
  );

  const getPlacementsForZone = useCallback(
    (zoneId: string) => placements.filter((p) => p.zoneId === zoneId),
    [placements]
  );

  const canAddToZone = useCallback(
    (zoneId: string) => {
      const zone = garment.placementZones.find((z) => z.id === zoneId);
      if (!zone) return false;
      const currentCount = getPlacementsForZone(zoneId).length;
      return currentCount < (zone.maxDesigns || 1);
    },
    [garment.placementZones, getPlacementsForZone]
  );

  const addDesignToZone = useCallback(
    (design: Design, zoneId: string) => {
      const zone = garment.placementZones.find((z) => z.id === zoneId);
      if (!zone || !canAddToZone(zoneId)) return;

      const newPlacement: DesignPlacement = {
        id: `placement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        designId: design.id,
        design,
        zoneId,
        x: zone.x,
        y: zone.y,
        scale: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
        opacity: 1,
        zIndex: placements.length,
      };

      onPlacementsChange([...placements, newPlacement]);
      setSelectedPlacementId(newPlacement.id);
    },
    [garment.placementZones, canAddToZone, placements, onPlacementsChange]
  );

  const updatePlacement = useCallback(
    (placementId: string, updates: Partial<DesignPlacement>) => {
      onPlacementsChange(
        placements.map((p) => (p.id === placementId ? { ...p, ...updates } : p))
      );
    },
    [placements, onPlacementsChange]
  );

  const removePlacement = useCallback(
    (placementId: string) => {
      onPlacementsChange(placements.filter((p) => p.id !== placementId));
      if (selectedPlacementId === placementId) {
        setSelectedPlacementId(null);
      }
    },
    [placements, onPlacementsChange, selectedPlacementId]
  );

  const bringForward = useCallback(() => {
    if (!selectedPlacement) return;
    const maxZ = Math.max(...placements.map((p) => p.zIndex), 0);
    if (selectedPlacement.zIndex < maxZ) {
      updatePlacement(selectedPlacement.id, { zIndex: selectedPlacement.zIndex + 1 });
    }
  }, [selectedPlacement, placements, updatePlacement]);

  const sendBackward = useCallback(() => {
    if (!selectedPlacement) return;
    if (selectedPlacement.zIndex > 0) {
      updatePlacement(selectedPlacement.id, { zIndex: selectedPlacement.zIndex - 1 });
    }
  }, [selectedPlacement, updatePlacement]);

  const bringToFront = useCallback(() => {
    if (!selectedPlacement) return;
    const maxZ = Math.max(...placements.map((p) => p.zIndex), 0);
    updatePlacement(selectedPlacement.id, { zIndex: maxZ + 1 });
  }, [selectedPlacement, placements, updatePlacement]);

  const sendToBack = useCallback(() => {
    if (!selectedPlacement) return;
    updatePlacement(selectedPlacement.id, { zIndex: 0 });
  }, [selectedPlacement, updatePlacement]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, placementId: string, zoneId: string) => {
      e.stopPropagation();
      setSelectedPlacementId(placementId);

      const placement = placements.find((p) => p.id === placementId);
      if (!placement) return;

      setDragState({
        isDragging: true,
        placementId,
        startX: e.clientX,
        startY: e.clientY,
        initialPlacementX: placement.x,
        initialPlacementY: placement.y,
      });
    },
    [placements]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState.isDragging || !dragState.placementId || !canvasRef.current)
        return;

      const zone = garment.placementZones.find(
        (z) => z.id === placements.find((p) => p.id === dragState.placementId)?.zoneId
      );
      if (!zone) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragState.startX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragState.startY) / rect.height) * 100;

      const newX = Math.max(
        zone.x - zone.width / 2 + 5,
        Math.min(zone.x + zone.width / 2 - 5, dragState.initialPlacementX + deltaXPercent)
      );
      const newY = Math.max(
        zone.y - zone.height / 2 + 5,
        Math.min(zone.y + zone.height / 2 - 5, dragState.initialPlacementY + deltaYPercent)
      );

      updatePlacement(dragState.placementId, { x: newX, y: newY });
    },
    [dragState, garment.placementZones, placements, updatePlacement]
  );

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      placementId: null,
      startX: 0,
      startY: 0,
      initialPlacementX: 0,
      initialPlacementY: 0,
    });
  }, []);

  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener("mouseup", handleMouseUp);
      return () => window.removeEventListener("mouseup", handleMouseUp);
    }
  }, [dragState.isDragging, handleMouseUp]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left: Canvas */}
      <div className="flex-1 flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 bg-[#0a0f0a] border border-[#1a2e1a] p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`flex items-center gap-2 px-3 py-2 border transition-colors ${
                showGrid
                  ? "border-[#4ade80] text-[#4ade80] bg-[#4ade80]/10"
                  : "border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]/50"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="text-xs font-mono">GRID</span>
            </button>

            <div className="flex items-center gap-1 border border-[#1a2e1a] bg-[#050805]">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="p-2 text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] transition-colors"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs text-[#6b8e6b] font-mono w-14 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                className="p-2 text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] transition-colors"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#6b8e6b] font-mono">
              {placements.length} DESIGN{placements.length !== 1 ? "S" : ""}
            </span>
            {selectedPlacement && (
              <button
                onClick={() => removePlacement(selectedPlacement.id)}
                className="flex items-center gap-2 px-3 py-2 border border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-xs font-mono">DELETE</span>
              </button>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="relative flex-1 bg-[#050805] border-2 border-[#1a2e1a] overflow-hidden cursor-crosshair"
          style={{
            minHeight: "500px",
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelectedPlacementId(null)}
        >
          {/* Zoom Container */}
          <div
            className="absolute inset-0 transition-transform duration-200"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            {/* Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="10%" height="10%" patternUnits="userSpaceOnUse">
                      <path d="M 10% 0 L 0 0 0 10%" fill="none" stroke="#4ade80" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            )}

            {/* Garment Silhouette */}
            <GarmentSilhouette garment={garment} color={selectedColor} />

            {/* Placement Zones */}
            {garment.placementZones.map((zone) => {
              const zonePlacements = getPlacementsForZone(zone.id);
              const isActive = activeZone === zone.id;
              const canAdd = canAddToZone(zone.id);

              return (
                <div
                  key={zone.id}
                  className={`absolute border-2 transition-all ${
                    isActive
                      ? canAdd
                        ? "border-[#4ade80] bg-[#4ade80]/10"
                        : "border-[#dc2626] bg-[#dc2626]/10"
                      : "border-[#1a2e1a]/50 border-dashed hover:border-[#4ade80]/30"
                  }`}
                  style={{
                    left: `${zone.x - zone.width / 2}%`,
                    top: `${zone.y - zone.height / 2}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                  }}
                  onMouseEnter={() => setActiveZone(zone.id)}
                  onMouseLeave={() => setActiveZone(null)}
                >
                  {isActive && (
                    <div className="absolute -top-6 left-0 bg-[#4ade80] text-black text-[10px] font-black px-2 py-1 whitespace-nowrap">
                      {zone.name}
                      {!canAdd && " (FULL)"}
                    </div>
                  )}

                  {zonePlacements.map((placement) => (
                    <PlacedDesign
                      key={placement.id}
                      placement={placement}
                      zone={zone}
                      isSelected={selectedPlacementId === placement.id}
                      onMouseDown={(e) => handleMouseDown(e, placement.id, zone.id)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Design Library + Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Design Library */}
        <div className="bg-[#0a0f0a] border border-[#1a2e1a] flex flex-col max-h-[320px]">
          <div className="p-3 border-b border-[#1a2e1a]">
            <h4 className="font-black tracking-tighter text-[#e8f5e8] text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#4ade80]" />
              DESIGN LIBRARY
            </h4>
          </div>
          <div className="p-3 overflow-y-auto flex-1">
            {availableDesigns.length === 0 ? (
              <p className="text-xs text-[#6b8e6b] text-center py-4">
                No designs available
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableDesigns.map((design) => (
                  <DesignLibraryItem
                    key={design.id}
                    design={design}
                    onClick={() => {
                      const availableZone = garment.placementZones.find((z) =>
                        canAddToZone(z.id)
                      );
                      if (availableZone) {
                        addDesignToZone(design, availableZone.id);
                      }
                    }}
                    disabled={!garment.placementZones.some((z) => canAddToZone(z.id))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Controls */}
        {selectedPlacement ? (
          <div className="bg-[#0a0f0a] border border-[#1a2e1a] flex flex-col">
            <div className="p-3 border-b border-[#1a2e1a] flex items-center justify-between">
              <h4 className="font-black tracking-tighter text-[#e8f5e8] text-sm flex items-center gap-2">
                <Move className="h-4 w-4 text-[#4ade80]" />
                EDIT DESIGN
              </h4>
              <button
                onClick={() => removePlacement(selectedPlacement.id)}
                className="text-[#dc2626] hover:text-[#ef4444] transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Position Controls */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#6b8e6b] font-mono">
                  <Move className="h-3 w-3" />
                  POSITION (%)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6b8e6b] font-mono w-4">X</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={Math.round(selectedPlacement.x)}
                      onChange={(e) =>
                        updatePlacement(selectedPlacement.id, {
                          x: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                        })
                      }
                      className="flex-1 bg-[#050805] border border-[#1a2e1a] text-[#e8f5e8] text-sm px-2 py-1.5 font-mono focus:border-[#4ade80] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6b8e6b] font-mono w-4">Y</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={Math.round(selectedPlacement.y)}
                      onChange={(e) =>
                        updatePlacement(selectedPlacement.id, {
                          y: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                        })
                      }
                      className="flex-1 bg-[#050805] border border-[#1a2e1a] text-[#e8f5e8] text-sm px-2 py-1.5 font-mono focus:border-[#4ade80] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Scale Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#6b8e6b] font-mono">
                    <Maximize2 className="h-3 w-3" />
                    SCALE
                  </div>
                  <span className="text-xs text-[#4ade80] font-mono">
                    {Math.round(selectedPlacement.scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={2}
                  step={0.05}
                  value={selectedPlacement.scale}
                  onChange={(e) =>
                    updatePlacement(selectedPlacement.id, { scale: parseFloat(e.target.value) })
                  }
                  className="w-full h-2 bg-[#1a2e1a] rounded-none appearance-none cursor-pointer accent-[#4ade80]"
                  style={{ accentColor: "#4ade80" }}
                />
              </div>

              {/* Rotation Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#6b8e6b] font-mono">
                    <RotateCw className="h-3 w-3" />
                    ROTATION
                  </div>
                  <span className="text-xs text-[#4ade80] font-mono">
                    {Math.round(selectedPlacement.rotation)}deg
                  </span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={selectedPlacement.rotation}
                  onChange={(e) =>
                    updatePlacement(selectedPlacement.id, { rotation: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-[#1a2e1a] rounded-none appearance-none cursor-pointer"
                  style={{ accentColor: "#4ade80" }}
                />
              </div>

              {/* Opacity Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#6b8e6b] font-mono">
                    <Eye className="h-3 w-3" />
                    OPACITY
                  </div>
                  <span className="text-xs text-[#4ade80] font-mono">
                    {Math.round(selectedPlacement.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={selectedPlacement.opacity}
                  onChange={(e) =>
                    updatePlacement(selectedPlacement.id, { opacity: parseFloat(e.target.value) })
                  }
                  className="w-full h-2 bg-[#1a2e1a] rounded-none appearance-none cursor-pointer"
                  style={{ accentColor: "#4ade80" }}
                />
              </div>

              {/* Flip Controls */}
              <div className="space-y-2">
                <div className="text-xs text-[#6b8e6b] font-mono">FLIP</div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updatePlacement(selectedPlacement.id, { flipX: !selectedPlacement.flipX })
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border transition-colors ${
                      selectedPlacement.flipX
                        ? "border-[#4ade80] text-[#4ade80] bg-[#4ade80]/10"
                        : "border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]/50"
                    }`}
                  >
                    <FlipHorizontal className="h-4 w-4" />
                    <span className="text-xs font-mono">X</span>
                  </button>
                  <button
                    onClick={() =>
                      updatePlacement(selectedPlacement.id, { flipY: !selectedPlacement.flipY })
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border transition-colors ${
                      selectedPlacement.flipY
                        ? "border-[#4ade80] text-[#4ade80] bg-[#4ade80]/10"
                        : "border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]/50"
                    }`}
                  >
                    <FlipVertical className="h-4 w-4" />
                    <span className="text-xs font-mono">Y</span>
                  </button>
                </div>
              </div>

              {/* Layer Controls */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#6b8e6b] font-mono">
                  <Layers className="h-3 w-3" />
                  LAYER ORDER
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={sendToBack}
                    className="flex-1 px-2 py-2 border border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:border-[#4ade80]/50 transition-colors"
                  >
                    <ChevronDown className="h-4 w-4 mx-auto" />
                  </button>
                  <button
                    onClick={sendBackward}
                    className="flex-1 px-2 py-2 border border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:border-[#4ade80]/50 transition-colors"
                  >
                    <span className="text-xs font-mono">-1</span>
                  </button>
                  <div className="flex items-center justify-center px-3 border border-[#1a2e1a] bg-[#050805]">
                    <span className="text-xs text-[#e8f5e8] font-mono">
                      {selectedPlacement.zIndex}
                    </span>
                  </div>
                  <button
                    onClick={bringForward}
                    className="flex-1 px-2 py-2 border border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:border-[#4ade80]/50 transition-colors"
                  >
                    <span className="text-xs font-mono">+1</span>
                  </button>
                  <button
                    onClick={bringToFront}
                    className="flex-1 px-2 py-2 border border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:border-[#4ade80]/50 transition-colors"
                  >
                    <ChevronUp className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-8 text-center">
            <Move className="h-8 w-8 text-[#1a2e1a] mx-auto mb-3" />
            <p className="text-xs text-[#6b8e6b]">
              Click a design on the canvas or add one from the library to edit
            </p>
          </div>
        )}

        {/* Zone Summary */}
        <div className="bg-[#0a0f0a] border border-[#1a2e1a]">
          <div className="p-3 border-b border-[#1a2e1a]">
            <h4 className="font-black tracking-tighter text-[#e8f5e8] text-sm">
              ZONES
            </h4>
          </div>
          <div className="p-3 space-y-1 max-h-40 overflow-y-auto">
            {garment.placementZones.map((zone) => {
              const count = getPlacementsForZone(zone.id).length;
              const max = zone.maxDesigns || 1;
              const isFull = count >= max;

              return (
                <div
                  key={zone.id}
                  className={`flex items-center justify-between p-2 text-xs ${
                    isFull ? "bg-[#4ade80]/10" : "bg-[#050805]"
                  }`}
                >
                  <span className={isFull ? "text-[#4ade80]" : "text-[#6b8e6b]"}>
                    {zone.name}
                  </span>
                  <span
                    className={`font-mono ${
                      isFull ? "text-[#4ade80]" : "text-[#6b8e6b]"
                    }`}
                  >
                    {count}/{max}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface PlacedDesignProps {
  placement: DesignPlacement;
  zone: { x: number; y: number; width: number; height: number };
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

function PlacedDesign({ placement, zone, isSelected, onMouseDown }: PlacedDesignProps) {
  const imageUrl = placement.design.thumbnail_url || placement.design.image_url;

  return (
    <div
      className={`absolute cursor-move ${isSelected ? "z-50" : ""}`}
      style={{
        left: `${placement.x - zone.x + zone.width / 2}%`,
        top: `${placement.y - zone.y + zone.height / 2}%`,
        transform: `translate(-50%, -50%) rotate(${placement.rotation}deg) scaleX(${placement.flipX ? -1 : 1}) scaleY(${placement.flipY ? -1 : 1})`,
        zIndex: placement.zIndex,
        opacity: placement.opacity,
      }}
      onMouseDown={onMouseDown}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`relative transition-all ${
          isSelected ? "ring-2 ring-[#4ade80] ring-offset-2 ring-offset-[#050805]" : ""
        }`}
        style={{
          transform: `scale(${placement.scale})`,
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={placement.design.name}
            className="max-w-[80px] max-h-[80px] object-contain pointer-events-none"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
            draggable={false}
          />
        ) : (
          <div className="w-16 h-16 bg-[#1a2e1a] flex items-center justify-center text-2xl">
            <span className="text-[#6b8e6b]">?</span>
          </div>
        )}

        {isSelected && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#4ade80] text-black text-[10px] font-black px-2 py-0.5 whitespace-nowrap">
            {placement.design.name}
          </div>
        )}
      </div>
    </div>
  );
}

interface DesignLibraryItemProps {
  design: Design;
  onClick: () => void;
  disabled: boolean;
}

function DesignLibraryItem({ design, onClick, disabled }: DesignLibraryItemProps) {
  const imageUrl = design.thumbnail_url || design.image_url;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative aspect-square border overflow-hidden transition-all ${
        disabled
          ? "border-[#1a2e1a] opacity-30 cursor-not-allowed"
          : "border-[#1a2e1a] hover:border-[#4ade80] hover:scale-105 cursor-pointer"
      }`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={design.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[#1a2e1a] flex items-center justify-center">
          <span className="text-[#6b8e6b] text-lg">?</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
        <Plus className="h-6 w-6 text-[#4ade80]" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
        <p className="text-[10px] text-[#e8f5e8] truncate">{design.name}</p>
      </div>
    </button>
  );
}

interface GarmentSilhouetteProps {
  garment: GarmentType;
  color: string;
}

function GarmentSilhouette({ garment, color }: GarmentSilhouetteProps) {
  const renderSilhouette = () => {
    switch (garment.category) {
      case "tops":
        return <TeeShirtSilhouette color={color} />;
      case "bottoms":
        return <PantsSilhouette color={color} />;
      case "outerwear":
        return <JacketSilhouette color={color} />;
      case "headwear":
        return <HatSilhouette color={color} />;
      case "bags":
        return <BagSilhouette color={color} />;
      case "accessories":
        return <AccessorySilhouette color={color} />;
      case "footwear":
        return <FootwearSilhouette color={color} />;
      default:
        return <GenericSilhouette color={color} />;
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
      <div className="relative w-full h-full max-w-[300px]">{renderSilhouette()}</div>
    </div>
  );
}

// ============================================================================
// SVG Silhouettes
// ============================================================================

function TeeShirtSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-2xl">
      <path
        d="M60 20 L80 20 L90 35 L110 35 L120 20 L140 20 L160 60 L140 75 L130 65 L130 220 L70 220 L70 65 L60 75 L40 60 Z"
        fill={color}
        stroke="#1a2e1a"
        strokeWidth="2"
      />
      <path
        d="M80 20 Q100 45 120 20"
        fill="none"
        stroke={darkenColor(color, 20)}
        strokeWidth="2"
      />
      <line x1="60" y1="20" x2="40" y2="60" stroke={darkenColor(color, 20)} strokeWidth="1" />
      <line x1="140" y1="20" x2="160" y2="60" stroke={darkenColor(color, 20)} strokeWidth="1" />
    </svg>
  );
}

function PantsSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 280" className="w-full h-full drop-shadow-2xl">
      <path
        d="M70 20 L130 20 L140 280 L105 280 L100 100 L95 280 L60 280 Z"
        fill={color}
        stroke="#1a2e1a"
        strokeWidth="2"
      />
      <rect x="70" y="20" width="60" height="15" fill={darkenColor(color, 20)} />
      <path d="M70 35 L85 35 L85 60" fill="none" stroke={darkenColor(color, 20)} strokeWidth="1" />
      <path d="M130 35 L115 35 L115 60" fill="none" stroke={darkenColor(color, 20)} strokeWidth="1" />
    </svg>
  );
}

function JacketSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 260" className="w-full h-full drop-shadow-2xl">
      <path
        d="M55 15 L80 15 L100 35 L120 15 L145 15 L170 70 L150 85 L140 75 L140 250 L60 250 L60 75 L50 85 L30 70 Z"
        fill={color}
        stroke="#1a2e1a"
        strokeWidth="2"
      />
      <path d="M80 15 L100 35 L120 15" fill="none" stroke={darkenColor(color, 20)} strokeWidth="2" />
      <line x1="100" y1="35" x2="100" y2="250" stroke={darkenColor(color, 30)} strokeWidth="2" />
    </svg>
  );
}

function HatSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full drop-shadow-2xl">
      <path
        d="M40 80 Q40 20 100 20 Q160 20 160 80"
        fill={color}
        stroke="#1a2e1a"
        strokeWidth="2"
      />
      <path
        d="M35 75 L165 75 L170 90 Q100 100 30 90 Z"
        fill={color}
        stroke="#1a2e1a"
        strokeWidth="2"
      />
      <line x1="100" y1="20" x2="100" y2="75" stroke={darkenColor(color, 20)} strokeWidth="1" />
    </svg>
  );
}

function BagSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-2xl">
      <rect x="40" y="60" width="120" height="140" rx="5" fill={color} stroke="#1a2e1a" strokeWidth="2" />
      <path d="M60 60 L60 30 Q60 10 100 10 Q140 10 140 30 L140 60" fill="none" stroke={color} strokeWidth="8" />
      <path d="M60 60 L60 30 Q60 10 100 10 Q140 10 140 30 L140 60" fill="none" stroke="#1a2e1a" strokeWidth="2" />
    </svg>
  );
}

function AccessorySilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
      <circle cx="100" cy="100" r="70" fill={color} stroke="#1a2e1a" strokeWidth="2" />
      <circle cx="100" cy="100" r="50" fill="none" stroke={darkenColor(color, 20)} strokeWidth="1" />
      <circle cx="100" cy="100" r="30" fill="none" stroke={darkenColor(color, 20)} strokeWidth="1" />
    </svg>
  );
}

function FootwearSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-2xl">
      <path
        d="M30 80 Q30 40 60 30 L120 25 Q160 20 170 50 Q180 80 160 90 L40 95 Q30 95 30 80"
        fill={color}
        stroke="#1a2e1a"
        strokeWidth="2"
      />
      <path d="M60 30 Q80 60 120 55" fill="none" stroke={darkenColor(color, 20)} strokeWidth="2" />
      <line x1="100" y1="25" x2="100" y2="60" stroke={darkenColor(color, 20)} strokeWidth="1" />
    </svg>
  );
}

function GenericSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-2xl">
      <rect x="50" y="20" width="100" height="200" rx="10" fill={color} stroke="#1a2e1a" strokeWidth="2" />
    </svg>
  );
}
