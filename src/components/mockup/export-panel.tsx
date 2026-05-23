"use client"

import React, { useState, useCallback, useMemo, useEffect } from "react"
import * as THREE from "three"
import { 
  Download, 
  Image as ImageIcon, 
  Instagram, 
  ShoppingBag, 
  Printer, 
  Settings,
  Check,
  AlertCircle,
  FileImage,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronRight,
  Copy,
  CheckCheck
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { 
  ExportOptions, 
  ExportFormat, 
  ExportResult,
  ExportValidationResult,
  CameraAngleId,
  FORMATS,
  estimateFileSize,
  formatFileSize,
  generateFilename,
  validateExportOptions,
  captureRendererToBlob,
  exportFromMultipleAngles,
  CAMERA_ANGLES,
  supportsTransparency,
} from "@/lib/mockup/export-formats"

// ============== TYPES ==============

export interface ExportPreset {
  id: string
  name: string
  description: string
  options: ExportOptions
  recommendedFor: string[]
  icon?: React.ReactNode
}

export interface ExportPanelProps {
  scene: THREE.Scene
  camera: THREE.Camera
  renderer: THREE.WebGLRenderer
  currentConfig: {
    garmentType: string
    designName: string
    variant?: string
  }
  onExportStart?: () => void
  onExportComplete?: (results: ExportResult[]) => void
  onExportError?: (error: Error) => void
  className?: string
}

// ============== EXPORT PRESETS ==============

const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: "shop-listing",
    name: "Shop Listing",
    description: "Optimized for Stigmator product pages",
    options: { width: 1200, height: 1200, format: "webp", quality: 85 },
    recommendedFor: ["Product thumbnails", "Shop listings"],
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    id: "social-square",
    name: "Social Media (Square)",
    description: "Instagram, Twitter, Facebook posts",
    options: { width: 1080, height: 1080, format: "jpg", quality: 90 },
    recommendedFor: ["Instagram posts", "Twitter/X posts", "Facebook"],
    icon: <Instagram className="h-5 w-5" />,
  },
  {
    id: "social-story",
    name: "Social Media (Story)",
    description: "Instagram/Facebook stories, TikTok",
    options: { width: 1080, height: 1920, format: "jpg", quality: 90 },
    recommendedFor: ["Instagram Stories", "TikTok", "Reels"],
    icon: <ImageIcon className="h-5 w-5" />,
  },
  {
    id: "print-ready",
    name: "Print Ready",
    description: "High resolution for printing",
    options: { width: 3000, height: 3000, format: "png", quality: 100 },
    recommendedFor: ["Print catalogs", "Press kits", "Marketing"],
    icon: <Printer className="h-5 w-5" />,
  },
  {
    id: "custom",
    name: "Custom",
    description: "Configure your own settings",
    options: { width: 2048, height: 2048, format: "png", quality: 95 },
    recommendedFor: ["Full control"],
    icon: <Settings className="h-5 w-5" />,
  },
]

// ============== COMPONENT ==============

export function ExportPanel({
  scene,
  camera,
  renderer,
  currentConfig,
  onExportStart,
  onExportComplete,
  onExportError,
  className,
}: ExportPanelProps) {
  // ============== STATE ==============
  
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset>(EXPORT_PRESETS[0])
  const [customOptions, setCustomOptions] = useState<ExportOptions>({
    width: 2048,
    height: 2048,
    format: "png",
    quality: 95,
    maintainAspectRatio: true,
  })
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true)
  const [selectedAngles, setSelectedAngles] = useState<CameraAngleId[]>(["front"])
  const [watermarkEnabled, setWatermarkEnabled] = useState(false)
  const [watermarkText, setWatermarkText] = useState("Stigmator")
  
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [validation, setValidation] = useState<ExportValidationResult | null>(null)
  const [copiedPreset, setCopiedPreset] = useState(false)
  
  // ============== MEMOIZED VALUES ==============
  
  const currentOptions: ExportOptions = useMemo(() => {
    if (selectedPreset.id === "custom") {
      return customOptions
    }
    return selectedPreset.options
  }, [selectedPreset, customOptions])
  
  const estimatedSize = useMemo(() => {
    return estimateFileSize(
      currentOptions.width,
      currentOptions.height,
      currentOptions.format,
      currentOptions.quality
    )
  }, [currentOptions])
  
  const totalExports = useMemo(() => selectedAngles.length, [selectedAngles])
  
  // ============== EFFECTS ==============
  
  useEffect(() => {
    const result = validateExportOptions(currentOptions)
    setValidation(result)
  }, [currentOptions])
  
  // ============== HANDLERS ==============
  
  const handlePresetSelect = useCallback((preset: ExportPreset) => {
    setSelectedPreset(preset)
    if (preset.id !== "custom") {
      setCustomOptions(preset.options)
    }
  }, [])
  
  const handleWidthChange = useCallback((width: number) => {
    setCustomOptions((prev) => {
      const newOptions = { ...prev, width }
      if (aspectRatioLocked && prev.width > 0) {
        const ratio = prev.height / prev.width
        newOptions.height = Math.round(width * ratio)
      }
      return newOptions
    })
  }, [aspectRatioLocked])
  
  const handleHeightChange = useCallback((height: number) => {
    setCustomOptions((prev) => {
      const newOptions = { ...prev, height }
      if (aspectRatioLocked && prev.height > 0) {
        const ratio = prev.width / prev.height
        newOptions.width = Math.round(height * ratio)
      }
      return newOptions
    })
  }, [aspectRatioLocked])
  
  const handleFormatChange = useCallback((format: ExportFormat) => {
    setCustomOptions((prev) => ({ ...prev, format }))
  }, [])
  
  const handleQualityChange = useCallback((quality: number[]) => {
    setCustomOptions((prev) => ({ ...prev, quality: quality[0] }))
  }, [])
  
  const toggleAngle = useCallback((angleId: CameraAngleId) => {
    setSelectedAngles((prev) => {
      if (prev.includes(angleId)) {
        // Don't allow deselecting if it's the last one
        if (prev.length === 1) return prev
        return prev.filter((id) => id !== angleId)
      }
      return [...prev, angleId]
    })
  }, [])
  
  const handleExport = useCallback(async () => {
    if (!validation?.valid) return
    
    setIsExporting(true)
    setExportProgress(0)
    onExportStart?.()
    
    try {
      const results: ExportResult[] = []
      
      // If only one angle, simple export
      if (selectedAngles.length === 1) {
        const blob = await captureRendererToBlob(
          renderer,
          scene,
          camera,
          currentOptions
        )
        
        const url = URL.createObjectURL(blob)
        const filename = generateFilename(
          currentConfig.garmentType,
          currentConfig.designName,
          currentOptions.format
        )
        
        results.push({
          blob,
          url,
          filename,
          format: currentOptions.format,
          width: currentOptions.width,
          height: currentOptions.height,
          size: blob.size,
        })
        
        // Trigger download
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        
        setExportProgress(100)
      } else {
        // Multi-angle export
        const perspectiveCamera = camera as THREE.PerspectiveCamera
        const angleResults = await exportFromMultipleAngles(
          scene,
          perspectiveCamera,
          renderer,
          { ...currentOptions, angles: selectedAngles },
          (completed, total) => {
            setExportProgress((completed / total) * 100)
          }
        )
        
        for (const result of angleResults) {
          results.push({
            blob: result.blob,
            url: result.url,
            filename: result.filename,
            format: currentOptions.format,
            width: currentOptions.width,
            height: currentOptions.height,
            size: result.blob.size,
          })
          
          // Trigger download for each
          const a = document.createElement("a")
          a.href = result.url
          a.download = result.filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      }
      
      onExportComplete?.(results)
    } catch (error) {
      onExportError?.(error instanceof Error ? error : new Error("Export failed"))
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }, [
    validation?.valid,
    selectedAngles,
    renderer,
    scene,
    camera,
    currentOptions,
    currentConfig,
    onExportStart,
    onExportComplete,
    onExportError,
  ])
  
  const copyPresetSettings = useCallback(() => {
    const settings = JSON.stringify(currentOptions, null, 2)
    navigator.clipboard.writeText(settings)
    setCopiedPreset(true)
    setTimeout(() => setCopiedPreset(false), 2000)
  }, [currentOptions])
  
  // ============== RENDER HELPERS ==============
  
  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case "png":
        return <FileImage className="h-4 w-4" />
      case "jpg":
      case "webp":
        return <ImageIcon className="h-4 w-4" />
    }
  }
  
  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Mockup
          </CardTitle>
          <CardDescription>
            Configure and download your mockup in the format you need
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Preset Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Preset</Label>
            <div className="grid grid-cols-1 gap-2">
              {EXPORT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg border text-left transition-all
                    ${selectedPreset.id === preset.id 
                      ? "border-[#4ade80] bg-[#4ade80]/10" 
                      : "border-[#1a2e1a] hover:border-[#4ade80]/50"
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-md
                    ${selectedPreset.id === preset.id 
                      ? "bg-[#4ade80] text-[#0a0f0a]" 
                      : "bg-[#1a2e1a] text-[#4ade80]"
                    }
                  `}>
                    {preset.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-[#e8f5e8]">{preset.name}</span>
                      {selectedPreset.id === preset.id && (
                        <Check className="h-4 w-4 text-[#4ade80] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#a8c5a8] mt-0.5">{preset.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {preset.recommendedFor.slice(0, 2).map((use) => (
                        <Badge 
                          key={use} 
                          variant="outline" 
                          className="text-[10px] border-[#1a2e1a] text-[#7a9a7a]"
                        >
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom Settings (when custom preset selected) */}
          {selectedPreset.id === "custom" && (
            <div className="space-y-4 p-4 bg-[#0a0f0a] rounded-lg border border-[#1a2e1a]">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Custom Settings</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPresetSettings}
                  className="h-8 px-2 text-[#7a9a7a] hover:text-[#4ade80]"
                >
                  {copiedPreset ? (
                    <CheckCheck className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Dimensions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-[#a8c5a8]">Dimensions</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                    className="h-6 px-2 text-xs text-[#7a9a7a] hover:text-[#4ade80]"
                  >
                    {aspectRatioLocked ? (
                      <><Lock className="h-3 w-3 mr-1" /> Locked</>
                    ) : (
                      <><Unlock className="h-3 w-3 mr-1" /> Free</>
                    )}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Input
                      type="number"
                      value={customOptions.width}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                      className="bg-[#0f1a0f] border-[#1a2e1a] text-[#e8f5e8] h-9"
                      min={100}
                      max={8000}
                    />
                    <span className="text-[10px] text-[#7a9a7a]">Width</span>
                  </div>
                  <div className="flex items-center text-[#7a9a7a]">×</div>
                  <div className="flex-1 space-y-1">
                    <Input
                      type="number"
                      value={customOptions.height}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                      className="bg-[#0f1a0f] border-[#1a2e1a] text-[#e8f5e8] h-9"
                      min={100}
                      max={8000}
                    />
                    <span className="text-[10px] text-[#7a9a7a]">Height</span>
                  </div>
                </div>
              </div>
              
              {/* Format */}
              <div className="space-y-2">
                <Label className="text-xs text-[#a8c5a8]">Format</Label>
                <div className="flex gap-2">
                  {(Object.keys(FORMATS) as ExportFormat[]).map((format) => (
                    <Button
                      key={format}
                      variant={customOptions.format === format ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFormatChange(format)}
                      className={`
                        flex-1 h-9 text-xs
                        ${customOptions.format === format 
                          ? "bg-[#4ade80] text-[#0a0f0a] hover:bg-[#4ade80]/90" 
                          : "border-[#1a2e1a] text-[#a8c5a8] hover:bg-[#1a2e1a]"
                        }
                      `}
                    >
                      {getFormatIcon(format)}
                      <span className="ml-1.5 uppercase">{format}</span>
                    </Button>
                  ))}
                </div>
                {supportsTransparency(customOptions.format) && (
                  <p className="text-[10px] text-[#7a9a7a]">
                    Supports transparency
                  </p>
                )}
              </div>
              
              {/* Quality */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-[#a8c5a8]">Quality</Label>
                  <span className="text-xs font-medium text-[#4ade80]">{customOptions.quality}%</span>
                </div>
                <Slider
                  value={[customOptions.quality]}
                  onValueChange={handleQualityChange}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          )}
          
          {/* Multiple Angles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Camera Angles</Label>
              <Badge variant="outline" className="text-xs border-[#1a2e1a] text-[#7a9a7a]">
                {selectedAngles.length} selected
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CAMERA_ANGLES) as CameraAngleId[]).map((angleId) => {
                const angle = CAMERA_ANGLES[angleId]
                const isSelected = selectedAngles.includes(angleId)
                return (
                  <button
                    key={angleId}
                    onClick={() => toggleAngle(angleId)}
                    className={`
                      flex flex-col items-center justify-center gap-1 p-2 rounded-lg border text-xs transition-all
                      ${isSelected 
                        ? "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]" 
                        : "border-[#1a2e1a] text-[#7a9a7a] hover:border-[#4ade80]/50"
                      }
                    `}
                  >
                    <Eye className={`h-4 w-4 ${isSelected ? "opacity-100" : "opacity-50"}`} />
                    <span>{angle.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Watermark */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Watermark</Label>
              <Switch
                checked={watermarkEnabled}
                onCheckedChange={setWatermarkEnabled}
              />
            </div>
            {watermarkEnabled && (
              <Input
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Enter watermark text"
                className="bg-[#0f1a0f] border-[#1a2e1a] text-[#e8f5e8] h-9"
              />
            )}
          </div>
          
          {/* File Size Estimate */}
          <div className="p-3 bg-[#0a0f0a] rounded-lg border border-[#1a2e1a]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#a8c5a8]">Estimated file size</span>
              <span className="font-medium text-[#e8f5e8]">
                {formatFileSize(estimatedSize * totalExports)}
                {totalExports > 1 && ` (${totalExports} files)`}
              </span>
            </div>
            <div className="text-xs text-[#7a9a7a] mt-1">
              {currentOptions.width} × {currentOptions.height} • {currentOptions.format.toUpperCase()} • {currentOptions.quality}%
            </div>
          </div>
          
          {/* Validation Warnings */}
          {validation && !validation.valid && (
            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {validation.errors.map((error) => (
                    <p key={error} className="text-xs text-red-300">{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {validation?.warnings && validation.warnings.length > 0 && (
            <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {validation.warnings.map((warning) => (
                    <p key={warning} className="text-xs text-amber-300">{warning}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#a8c5a8]">Exporting...</span>
                <span className="text-[#4ade80]">{Math.round(exportProgress)}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}
          
          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || !validation?.valid}
            className="w-full h-11 bg-[#4ade80] text-[#0a0f0a] hover:bg-[#4ade80]/90 font-medium"
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-[#0a0f0a]/30 border-t-[#0a0f0a] rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {totalExports > 1 ? `${totalExports} Images` : "Image"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export { EXPORT_PRESETS }
