"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import * as THREE from "three"
import { 
  Package, 
  Download, 
  Pause, 
  Play, 
  X, 
  Check, 
  AlertCircle,
  FileArchive,
  Clock,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { 
  ExportPreset, 
  ExportResult,
  ExportFormat,
  formatFileSize,
  generateFilename,
  captureRendererToBlob,
} from "@/lib/mockup/export-formats"

// ============== TYPES ==============

export interface BatchExportItem {
  id: string
  name: string
  config: {
    garmentType: string
    designName: string
    variant?: string
  }
  thumbnail?: string
}

export interface BatchExportFile {
  angle: string
  url: string
  blob: Blob
  size: number
}

export interface BatchExportResult {
  mockupId: string
  name: string
  status: "pending" | "processing" | "completed" | "error" | "skipped"
  progress: number
  files: BatchExportFile[]
  error?: string
  startedAt?: Date
  completedAt?: Date
}

export interface BatchExportProps {
  mockups: BatchExportItem[]
  preset: ExportPreset
  scene: THREE.Scene
  camera: THREE.Camera
  renderer: THREE.WebGLRenderer
  angles?: string[]
  onComplete?: (results: BatchExportResult[]) => void
  onProgress?: (completed: number, total: number) => void
  className?: string
}

type ExportStatus = "idle" | "running" | "paused" | "completed" | "error"

// ============== UTILITIES ==============

async function createZipArchive(results: BatchExportResult[]): Promise<Blob> {
  // Dynamic import JSZip to avoid loading it unless needed
  const JSZip = (await import("jszip")).default
  const zip = new JSZip()
  
  for (const result of results) {
    if (result.status !== "completed") continue
    
    // Create folder for each mockup
    const folderName = result.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()
    const folder = zip.folder(folderName)
    
    if (folder) {
      for (const file of result.files) {
        folder.file(file.angle.replace(/\s+/g, "_").toLowerCase() + "." + getExtension(file.blob.type), file.blob)
      }
    }
  }
  
  return zip.generateAsync({ type: "blob" })
}

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
  }
  return map[mimeType] || "png"
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${Math.round(ms / 1000)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.round((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

// ============== COMPONENT ==============

export function BatchExport({
  mockups,
  preset,
  scene,
  camera,
  renderer,
  angles = ["front"],
  onComplete,
  onProgress,
  className,
}: BatchExportProps) {
  // ============== STATE ==============
  
  const [selectedMockups, setSelectedMockups] = useState<Set<string>>(new Set())
  const [results, setResults] = useState<BatchExportResult[]>([])
  const [status, setStatus] = useState<ExportStatus>("idle")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  
  // ============== REFS ==============
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const processingRef = useRef(false)
  const processedCountRef = useRef(0)
  
  // ============== EFFECTS ==============
  
  // Initialize results when mockups change
  useEffect(() => {
    const initialResults: BatchExportResult[] = mockups.map((mockup) => ({
      mockupId: mockup.id,
      name: mockup.name,
      status: "pending",
      progress: 0,
      files: [],
    }))
    setResults(initialResults)
    setSelectedMockups(new Set(mockups.map((m) => m.id)))
  }, [mockups])
  
  // Update estimated time
  useEffect(() => {
    if (status === "running" && startTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime.getTime()
        const processed = processedCountRef.current
        const total = selectedMockups.size
        
        if (processed > 0 && processed < total) {
          const avgTimePerItem = elapsed / processed
          const remaining = (total - processed) * avgTimePerItem
          setEstimatedTimeRemaining(Math.round(remaining))
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [status, startTime, selectedMockups.size])
  
  // ============== HANDLERS ==============
  
  const toggleMockupSelection = useCallback((mockupId: string) => {
    setSelectedMockups((prev) => {
      const next = new Set(prev)
      if (next.has(mockupId)) {
        next.delete(mockupId)
      } else {
        next.add(mockupId)
      }
      return next
    })
  }, [])
  
  const selectAll = useCallback(() => {
    setSelectedMockups(new Set(mockups.map((m) => m.id)))
  }, [mockups])
  
  const deselectAll = useCallback(() => {
    setSelectedMockups(new Set())
  }, [])
  
  const toggleExpand = useCallback((mockupId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(mockupId)) {
        next.delete(mockupId)
      } else {
        next.add(mockupId)
      }
      return next
    })
  }, [])
  
  const removeFromQueue = useCallback((mockupId: string) => {
    setResults((prev) => prev.filter((r) => r.mockupId !== mockupId))
    setSelectedMockups((prev) => {
      const next = new Set(prev)
      next.delete(mockupId)
      return next
    })
  }, [])
  
  const processExport = useCallback(async () => {
    if (processingRef.current) return
    processingRef.current = true
    
    const selectedIds = Array.from(selectedMockups)
    const total = selectedIds.length
    processedCountRef.current = 0
    
    setStartTime(new Date())
    
    for (let i = 0; i < selectedIds.length; i++) {
      const mockupId = selectedIds[i]
      const mockup = mockups.find((m) => m.id === mockupId)
      
      if (!mockup) continue
      
      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) {
        break
      }
      
      // Check if paused
      while (status === "paused") {
        await new Promise((resolve) => setTimeout(resolve, 100))
        if (abortControllerRef.current?.signal.aborted) break
      }
      
      // Update status to processing
      setCurrentIndex(i)
      setResults((prev) =>
        prev.map((r) =>
          r.mockupId === mockupId
            ? { ...r, status: "processing", progress: 0, startedAt: new Date() }
            : r
        )
      )
      
      try {
        const exportFiles: BatchExportFile[] = []
        
        // Export from each angle
        for (let j = 0; j < angles.length; j++) {
          // Update progress
          const angleProgress = ((j + 1) / angles.length) * 100
          setResults((prev) =>
            prev.map((r) =>
              r.mockupId === mockupId ? { ...r, progress: angleProgress } : r
            )
          )
          
          // Capture render
          const blob = await captureRendererToBlob(renderer, scene, camera, {
            width: preset.options.width,
            height: preset.options.height,
            format: preset.options.format as ExportFormat,
            quality: preset.options.quality,
          })
          
          exportFiles.push({
            angle: angles[j],
            url: URL.createObjectURL(blob),
            blob,
            size: blob.size,
          })
        }
        
        // Mark as completed
        setResults((prev) =>
          prev.map((r) =>
            r.mockupId === mockupId
              ? {
                  ...r,
                  status: "completed",
                  progress: 100,
                  files: exportFiles,
                  completedAt: new Date(),
                }
              : r
          )
        )
        
        processedCountRef.current++
        
      } catch (error) {
        // Mark as error but continue with next
        setResults((prev) =>
          prev.map((r) =>
            r.mockupId === mockupId
              ? {
                  ...r,
                  status: "error",
                  error: error instanceof Error ? error.message : "Export failed",
                  completedAt: new Date(),
                }
              : r
          )
        )
      }
      
      // Update overall progress
      const progress = ((i + 1) / total) * 100
      setOverallProgress(progress)
      onProgress?.(i + 1, total)
    }
    
    setStatus("completed")
    processingRef.current = false
    onComplete?.(results)
  }, [selectedMockups, mockups, angles, preset, renderer, scene, camera, status, onProgress, onComplete, results])
  
  const startExport = useCallback(() => {
    if (selectedMockups.size === 0) return
    
    abortControllerRef.current = new AbortController()
    setStatus("running")
    setResults((prev) =>
      prev.map((r) =>
        selectedMockups.has(r.mockupId) && r.status === "pending"
          ? { ...r, status: "pending" }
          : r
      )
    )
    processExport()
  }, [selectedMockups, processExport])
  
  const pauseExport = useCallback(() => {
    setStatus("paused")
  }, [])
  
  const resumeExport = useCallback(() => {
    setStatus("running")
  }, [])
  
  const cancelExport = useCallback(() => {
    abortControllerRef.current?.abort()
    setStatus("idle")
    processingRef.current = false
    
    // Reset in-progress items
    setResults((prev) =>
      prev.map((r) =>
        r.status === "processing" ? { ...r, status: "pending", progress: 0 } : r
      )
    )
  }, [])
  
  const resetExport = useCallback(() => {
    setStatus("idle")
    setCurrentIndex(0)
    setOverallProgress(0)
    setEstimatedTimeRemaining(null)
    setStartTime(null)
    processedCountRef.current = 0
    
    // Revoke all blob URLs
    results.forEach((result) => {
      result.files.forEach((file) => {
        URL.revokeObjectURL(file.url)
      })
    })
    
    // Reset all results
    setResults((prev) =>
      prev.map((r) => ({
        ...r,
        status: "pending",
        progress: 0,
        files: [],
        error: undefined,
        startedAt: undefined,
        completedAt: undefined,
      }))
    )
  }, [results])
  
  const downloadAllAsZip = useCallback(async () => {
    const completedResults = results.filter((r) => r.status === "completed")
    if (completedResults.length === 0) return
    
    const zipBlob = await createZipArchive(completedResults)
    const url = URL.createObjectURL(zipBlob)
    
    const link = document.createElement("a")
    link.href = url
    link.download = `stigmator_batch_export_${new Date().toISOString().split("T")[0]}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [results])
  
  const downloadSingle = useCallback((result: BatchExportResult) => {
    result.files.forEach((file, index) => {
      setTimeout(() => {
        const link = document.createElement("a")
        link.href = file.url
        link.download = generateFilename(
          result.name,
          file.angle,
          preset.options.format as ExportFormat
        )
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, index * 100)
    })
  }, [preset.options.format])
  
  // ============== RENDER HELPERS ==============
  
  const getStatusIcon = (status: BatchExportResult["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "processing":
        return <div className="h-4 w-4 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
      case "skipped":
        return <X className="h-4 w-4 text-gray-500" />
      default:
        return <div className="h-4 w-4 rounded-full border border-[#1a2e1a]" />
    }
  }
  
  const getStatusColor = (status: BatchExportResult["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "error":
        return "text-red-400"
      case "processing":
        return "text-[#4ade80]"
      case "skipped":
        return "text-gray-400"
      default:
        return "text-[#7a9a7a]"
    }
  }
  
  // ============== STATS ==============
  
  const stats = {
    total: selectedMockups.size,
    completed: results.filter((r) => r.status === "completed").length,
    errors: results.filter((r) => r.status === "error").length,
    processing: results.filter((r) => r.status === "processing").length,
    pending: results.filter((r) => r.status === "pending").length,
  }
  
  const totalSize = results
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.files.reduce((fSum, f) => fSum + f.size, 0), 0)
  
  // ============== RENDER ==============
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <CardTitle>Batch Export</CardTitle>
          </div>
          <Badge variant="outline" className="border-[#1a2e1a]">
            {stats.completed}/{stats.total} completed
          </Badge>
        </div>
        <CardDescription>
          Export multiple mockups with the same preset settings
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Preset Info */}
        <div className="p-3 bg-[#0a0f0a] rounded-lg border border-[#1a2e1a]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#e8f5e8]">{preset.name}</p>
              <p className="text-xs text-[#7a9a7a]">
                {preset.options.width} × {preset.options.height} • {preset.options.format.toUpperCase()}
              </p>
            </div>
            <Badge variant="outline" className="border-[#1a2e1a] text-[#4ade80]">
              {angles.length} angle{angles.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
        
        {/* Selection Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="h-8 text-xs border-[#1a2e1a] hover:bg-[#1a2e1a]"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deselectAll}
              className="h-8 text-xs border-[#1a2e1a] hover:bg-[#1a2e1a]"
            >
              Deselect All
            </Button>
          </div>
          <span className="text-xs text-[#7a9a7a]">
            {selectedMockups.size} of {mockups.length} selected
          </span>
        </div>
        
        {/* Queue List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {mockups.map((mockup) => {
            const result = results.find((r) => r.mockupId === mockup.id)
            const isSelected = selectedMockups.has(mockup.id)
            const isExpanded = expandedItems.has(mockup.id)
            
            if (!result) return null
            
            return (
              <div
                key={mockup.id}
                className={`
                  border rounded-lg overflow-hidden transition-all
                  ${isSelected ? "border-[#1a2e1a]" : "border-[#0f1a0f] opacity-50"}
                  ${result.status === "processing" ? "bg-[#1a2e1a]/30" : "bg-[#0a0f0a]"}
                `}
              >
                <div className="flex items-center gap-3 p-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleMockupSelection(mockup.id)}
                    disabled={status === "running"}
                  />
                  
                  {mockup.thumbnail ? (
                    <img
                      src={mockup.thumbnail}
                      alt={mockup.name}
                      className="w-10 h-10 rounded object-cover bg-[#1a2e1a]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-[#1a2e1a] flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-[#7a9a7a]" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e8f5e8] truncate">
                      {mockup.name}
                    </p>
                    <p className="text-xs text-[#7a9a7a] truncate">
                      {mockup.config.garmentType}
                    </p>
                  </div>
                  
                  {result.status === "completed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadSingle(result)}
                      className="h-8 px-2 text-[#4ade80] hover:text-[#4ade80] hover:bg-[#4ade80]/10"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <button
                    onClick={() => toggleExpand(mockup.id)}
                    className="p-1 text-[#7a9a7a] hover:text-[#e8f5e8]"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  {status !== "running" && (
                    <button
                      onClick={() => removeFromQueue(mockup.id)}
                      className="p-1 text-[#7a9a7a] hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {result.status === "processing" && (
                  <div className="px-3 pb-3">
                    <Progress value={result.progress} className="h-1" />
                  </div>
                )}
                
                {isExpanded && result.files.length > 0 && (
                  <div className="px-3 pb-3 space-y-2 border-t border-[#1a2e1a] pt-2">
                    {result.files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-[#a8c5a8]">{file.angle}</span>
                        <span className="text-[#7a9a7a]">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ))}
                    {result.completedAt && result.startedAt && (
                      <div className="flex items-center gap-1 text-xs text-[#7a9a7a] pt-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(result.completedAt.getTime() - result.startedAt.getTime())}
                      </div>
                    )}
                  </div>
                )}
                
                {result.error && (
                  <div className="px-3 pb-3 text-xs text-red-400">
                    Error: {result.error}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Progress & Stats */}
        {status !== "idle" && (
          <div className="space-y-3 p-4 bg-[#0a0f0a] rounded-lg border border-[#1a2e1a]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#a8c5a8]">Overall Progress</span>
              <span className="text-[#4ade80]">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            
            {estimatedTimeRemaining !== null && status === "running" && (
              <div className="flex items-center gap-1 text-xs text-[#7a9a7a]">
                <Clock className="h-3 w-3" />
                Estimated time remaining: {formatDuration(estimatedTimeRemaining)}
              </div>
            )}
            
            <div className="flex gap-4 text-xs">
              <span className="text-green-400">{stats.completed} completed</span>
              {stats.errors > 0 && (
                <span className="text-red-400">{stats.errors} errors</span>
              )}
              {stats.processing > 0 && (
                <span className="text-[#4ade80]">{stats.processing} processing</span>
              )}
            </div>
            
            {totalSize > 0 && (
              <div className="text-xs text-[#7a9a7a]">
                Total size: {formatFileSize(totalSize)}
              </div>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {status === "idle" || status === "completed" || status === "error" ? (
            <>
              <Button
                onClick={startExport}
                disabled={selectedMockups.size === 0}
                className="flex-1 bg-[#4ade80] text-[#0a0f0a] hover:bg-[#4ade80]/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Start Export
              </Button>
              
              {status === "completed" && (
                <Button
                  onClick={resetExport}
                  variant="outline"
                  className="border-[#1a2e1a] hover:bg-[#1a2e1a]"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : status === "running" ? (
            <>
              <Button
                onClick={pauseExport}
                variant="outline"
                className="flex-1 border-[#1a2e1a] hover:bg-[#1a2e1a]"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button
                onClick={cancelExport}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={resumeExport}
                className="flex-1 bg-[#4ade80] text-[#0a0f0a] hover:bg-[#4ade80]/90"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
              <Button
                onClick={cancelExport}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
        
        {/* Download All */}
        {stats.completed > 0 && (
          <Button
            onClick={downloadAllAsZip}
            variant="outline"
            className="w-full border-[#1a2e1a] hover:bg-[#1a2e1a]"
          >
            <FileArchive className="h-4 w-4 mr-2" />
            Download All as ZIP ({formatFileSize(totalSize)})
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
