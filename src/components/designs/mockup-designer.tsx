"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { 
  Move,
  Maximize2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Eye,
  EyeOff,
  Grid3X3,
  Undo2,
  Check,
  Shirt,
  ZoomIn,
  ZoomOut,
  Palette,
  Maximize
} from "lucide-react"

interface DesignPosition {
  x: number
  y: number
  scale: number
  rotation: number
  flipX: boolean
  flipY: boolean
}

interface GarmentTemplate {
  id: string
  name: string
  type: string
  frontImage: string
  backImage?: string
  printArea: {
    front: { x: number; y: number; width: number; height: number }
    back?: { x: number; y: number; width: number; height: number }
  }
}

const GARMENT_TEMPLATES: GarmentTemplate[] = [
  {
    id: "tshirt-white",
    name: "T-Shirt White",
    type: "T-Shirt",
    frontImage: "/templates/tshirt-front.png",
    backImage: "/templates/tshirt-back.png",
    printArea: {
      front: { x: 25, y: 20, width: 50, height: 40 },
      back: { x: 25, y: 20, width: 50, height: 40 },
    }
  },
  {
    id: "tshirt-black",
    name: "T-Shirt Black",
    type: "T-Shirt",
    frontImage: "/templates/tshirt-black-front.png",
    backImage: "/templates/tshirt-black-back.png",
    printArea: {
      front: { x: 25, y: 20, width: 50, height: 40 },
      back: { x: 25, y: 20, width: 50, height: 40 },
    }
  },
  {
    id: "hoodie-white",
    name: "Hoodie White",
    type: "Hoodie",
    frontImage: "/templates/hoodie-front.png",
    backImage: "/templates/hoodie-back.png",
    printArea: {
      front: { x: 20, y: 25, width: 60, height: 45 },
      back: { x: 20, y: 25, width: 60, height: 45 },
    }
  },
  {
    id: "longsleeve-white",
    name: "Long Sleeve White",
    type: "Long Sleeve",
    frontImage: "/templates/longsleeve-front.png",
    backImage: "/templates/longsleeve-back.png",
    printArea: {
      front: { x: 25, y: 20, width: 50, height: 45 },
      back: { x: 25, y: 20, width: 50, height: 45 },
    }
  },
  {
    id: "crewneck-white",
    name: "Crewneck White",
    type: "Crewneck",
    frontImage: "/templates/crewneck-front.png",
    backImage: "/templates/crewneck-back.png",
    printArea: {
      front: { x: 22, y: 22, width: 56, height: 42 },
      back: { x: 22, y: 22, width: 56, height: 42 },
    }
  },
]

interface MockupDesignerProps {
  designImage: string
  designName: string
  onSave: (config: {
    template: GarmentTemplate
    frontPosition: DesignPosition
    backPosition?: DesignPosition
    useBack: boolean
  }) => void
}

export function MockupDesigner({ designImage, designName, onSave }: MockupDesignerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<GarmentTemplate>(GARMENT_TEMPLATES[0])
  const [activeSide, setActiveSide] = useState<"front" | "back">("front")
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(100)
  
  const [frontPosition, setFrontPosition] = useState<DesignPosition>({
    x: 50,
    y: 40,
    scale: 60,
    rotation: 0,
    flipX: false,
    flipY: false,
  })
  
  const [backPosition, setBackPosition] = useState<DesignPosition>({
    x: 50,
    y: 40,
    scale: 60,
    rotation: 0,
    flipX: false,
    flipY: false,
  })
  
  const [useBackDesign, setUseBackDesign] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const currentPosition = activeSide === "front" ? frontPosition : backPosition
  const setCurrentPosition = activeSide === "front" ? setFrontPosition : setBackPosition

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return
    setIsDragging(true)
    const rect = canvasRef.current.getBoundingClientRect()
    setDragStart({
      x: e.clientX - rect.left - (currentPosition.x / 100) * rect.width,
      y: e.clientY - rect.top - (currentPosition.y / 100) * rect.height,
    })
  }, [currentPosition])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const newX = ((e.clientX - rect.left - dragStart.x) / rect.width) * 100
    const newY = ((e.clientY - rect.top - dragStart.y) / rect.height) * 100
    
    setCurrentPosition(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100, newX)),
      y: Math.max(0, Math.min(100, newY)),
    }))
  }, [isDragging, dragStart, setCurrentPosition])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const resetPosition = () => {
    setCurrentPosition({
      x: 50,
      y: 40,
      scale: 60,
      rotation: 0,
      flipX: false,
      flipY: false,
    })
  }

  const handleSave = () => {
    onSave({
      template: selectedTemplate,
      frontPosition,
      backPosition: useBackDesign ? backPosition : undefined,
      useBack: useBackDesign,
    })
  }

  const printArea = activeSide === "front" 
    ? selectedTemplate.printArea.front 
    : selectedTemplate.printArea.back

  return (
    <div className="grid lg:grid-cols-[1fr,320px] gap-6">
      {/* Canvas Area */}
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0a0f0a] border border-[#1a2e1a] p-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 transition-colors ${showGrid ? "text-[#4ade80]" : "text-[#6b8e6b]"}`}
            title="Toggle Grid"
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
          
          <div className="w-px h-6 bg-[#1a2e1a]" />
          
          <button
            onClick={() => setZoom(z => Math.max(50, z - 25))}
            className="p-2 text-[#6b8e6b] hover:text-[#e8f5e8]"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="text-xs font-mono text-[#6b8e6b] w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(z => Math.min(200, z + 25))}
            className="p-2 text-[#6b8e6b] hover:text-[#e8f5e8]"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          
          <div className="w-px h-6 bg-[#1a2e1a]" />
          
          <button
            onClick={resetPosition}
            className="p-2 text-[#6b8e6b] hover:text-[#e8f5e8]"
            title="Reset Position"
          >
            <Undo2 className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          {/* Side Toggle */}
          {selectedTemplate.backImage && (
            <div className="flex bg-[#050805] border border-[#1a2e1a]">
              <button
                onClick={() => setActiveSide("front")}
                className={`px-4 py-2 text-xs font-black transition-colors ${
                  activeSide === "front" 
                    ? "bg-[#4ade80] text-black" 
                    : "text-[#6b8e6b] hover:text-[#e8f5e8]"
                }`}
              >
                FRONT
              </button>
              <button
                onClick={() => setActiveSide("back")}
                className={`px-4 py-2 text-xs font-black transition-colors ${
                  activeSide === "back" 
                    ? "bg-[#4ade80] text-black" 
                    : "text-[#6b8e6b] hover:text-[#e8f5e8]"
                }`}
              >
                BACK
              </button>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="relative bg-[#050805] border border-[#1a2e1a] overflow-hidden cursor-move"
          style={{ 
            height: "600px",
            backgroundImage: showGrid ? `
              linear-gradient(to right, #1a2e1a 1px, transparent 1px),
              linear-gradient(to bottom, #1a2e1a 1px, transparent 1px)
            ` : "none",
            backgroundSize: "50px 50px",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Garment Template */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {/* Placeholder for actual garment image */}
            <div className="relative">
              <div 
                className="w-[300px] h-[400px] bg-[#1a2e1a] border-2 border-[#2a3e2a] flex flex-col items-center justify-center"
                style={{
                  background: activeSide === "front" 
                    ? "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)"
                    : "linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%)"
                }}
              >
                <Shirt className="h-32 w-32 text-[#a0a0a0]" />
                <span className="text-[#808080] font-mono text-xs mt-4">
                  {selectedTemplate.name} • {activeSide.toUpperCase()}
                </span>
              </div>
              
              {/* Print Area Guide */}
              {printArea && (
                <div 
                  className="absolute border-2 border-dashed border-[#4ade80]/50"
                  style={{
                    left: `${printArea.x}%`,
                    top: `${printArea.y}%`,
                    width: `${printArea.width}%`,
                    height: `${printArea.height}%`,
                  }}
                >
                  <span className="absolute -top-5 left-0 text-[10px] font-mono text-[#4ade80]">
                    PRINT AREA
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Design Overlay */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${currentPosition.x}%`,
              top: `${currentPosition.y}%`,
              transform: `
                translate(-50%, -50%) 
                scale(${currentPosition.scale / 100})
                rotate(${currentPosition.rotation}deg)
                ${currentPosition.flipX ? "scaleX(-1)" : ""}
                ${currentPosition.flipY ? "scaleY(-1)" : ""}
              `,
            }}
          >
            <img 
              src={designImage} 
              alt={designName}
              className="max-w-[300px] max-h-[300px] object-contain"
              style={{ 
                filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.3))",
                imageRendering: "crisp-edges"
              }}
            />
            {/* Selection Box */}
            <div className="absolute inset-0 border-2 border-[#4ade80] -m-2">
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#4ade80]" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#4ade80]" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#4ade80]" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#4ade80]" />
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 text-xs font-mono text-[#6b8e6b] bg-[#0a0f0a]/80 px-3 py-2">
            <Move className="h-3 w-3 inline mr-1" />
            DRAG TO POSITION • USE CONTROLS TO SCALE & ROTATE
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="space-y-4">
        {/* Template Selector */}
        <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-4">
          <h3 className="font-black tracking-tighter text-[#e8f5e8] mb-3 flex items-center gap-2">
            <Palette className="h-4 w-4 text-[#4ade80]" />
            GARMENT TEMPLATE
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {GARMENT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`w-full p-3 text-left border transition-all ${
                  selectedTemplate.id === template.id
                    ? "border-[#4ade80] bg-[#4ade80]/10"
                    : "border-[#1a2e1a] hover:border-[#4ade80]/50"
                }`}
              >
                <div className="font-black text-sm text-[#e8f5e8]">{template.name}</div>
                <div className="text-xs text-[#6b8e6b] font-mono">{template.type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Position Controls */}
        <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-4 space-y-4">
          <h3 className="font-black tracking-tighter text-[#e8f5e8] flex items-center gap-2">
            <Move className="h-4 w-4 text-[#4ade80]" />
            POSITION
          </h3>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-mono text-[#6b8e6b]">SCALE</span>
              <span className="text-[#e8f5e8]">{currentPosition.scale}%</span>
            </div>
            <Slider 
              value={[currentPosition.scale]} 
              onValueChange={(v) => setCurrentPosition(p => ({ ...p, scale: v[0] }))}
              min={10}
              max={150}
              step={1}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-mono text-[#6b8e6b]">ROTATION</span>
              <span className="text-[#e8f5e8]">{currentPosition.rotation}°</span>
            </div>
            <Slider 
              value={[currentPosition.rotation]} 
              onValueChange={(v) => setCurrentPosition(p => ({ ...p, rotation: v[0] }))}
              min={-180}
              max={180}
              step={1}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCurrentPosition(p => ({ ...p, flipX: !p.flipX }))}
              className={`p-2 border text-xs font-black transition-colors ${
                currentPosition.flipX 
                  ? "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]" 
                  : "border-[#1a2e1a] text-[#6b8e6b]"
              }`}
            >
              <FlipHorizontal className="h-4 w-4 mx-auto mb-1" />
              FLIP H
            </button>
            <button
              onClick={() => setCurrentPosition(p => ({ ...p, flipY: !p.flipY }))}
              className={`p-2 border text-xs font-black transition-colors ${
                currentPosition.flipY 
                  ? "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]" 
                  : "border-[#1a2e1a] text-[#6b8e6b]"
              }`}
            >
              <FlipVertical className="h-4 w-4 mx-auto mb-1" />
              FLIP V
            </button>
          </div>
        </div>

        {/* Back Design Toggle */}
        {selectedTemplate.backImage && (
          <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black tracking-tighter text-[#e8f5e8] flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#4ade80]" />
                BACK DESIGN
              </h3>
              <button
                onClick={() => setUseBackDesign(!useBackDesign)}
                className={`p-1 transition-colors ${useBackDesign ? "text-[#4ade80]" : "text-[#6b8e6b]"}`}
              >
                {useBackDesign ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
            
            {useBackDesign && (
              <p className="text-xs text-[#6b8e6b]">
                Click BACK tab to position the back design separately
              </p>
            )}
          </div>
        )}

        {/* Info */}
        <div className="bg-[#050805] border border-[#1a2e1a] p-4 text-xs font-mono text-[#6b8e6b] space-y-1">
          <div className="flex justify-between">
            <span>X POSITION</span>
            <span className="text-[#e8f5e8]">{currentPosition.x.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Y POSITION</span>
            <span className="text-[#e8f5e8]">{currentPosition.y.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>SCALE</span>
            <span className="text-[#e8f5e8]">{currentPosition.scale}%</span>
          </div>
          <div className="flex justify-between">
            <span>ROTATION</span>
            <span className="text-[#e8f5e8]">{currentPosition.rotation}°</span>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-black rounded-none font-black tracking-wider h-12 brutal-box"
        >
          <Check className="h-5 w-5 mr-2" />
          SAVE MOCKUP
        </Button>
      </div>
    </div>
  )
}
