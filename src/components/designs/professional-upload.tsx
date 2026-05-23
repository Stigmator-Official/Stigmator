"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Upload, 
  FileImage, 
  Layers, 
  Zap,
  AlertCircle,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Palette,
  Ruler,
  Info
} from "lucide-react"

// Supported professional formats
const SUPPORTED_FORMATS = [
  { ext: "psd", name: "Photoshop", icon: "🎨", maxSize: 500 * 1024 * 1024 }, // 500MB
  { ext: "ai", name: "Illustrator", icon: "✏️", maxSize: 200 * 1024 * 1024 }, // 200MB
  { ext: "procreate", name: "Procreate", icon: "🖌️", maxSize: 100 * 1024 * 1024 }, // 100MB
  { ext: "tiff", name: "TIFF", icon: "📷", maxSize: 300 * 1024 * 1024 }, // 300MB
  { ext: "png", name: "PNG", icon: "🖼️", maxSize: 100 * 1024 * 1024 }, // 100MB
  { ext: "jpg", name: "JPEG", icon: "📸", maxSize: 50 * 1024 * 1024 }, // 50MB
]

interface DesignFile {
  file: File
  id: string
  name: string
  size: number
  type: string
  preview?: string
  status: "uploading" | "processing" | "ready" | "error"
  progress: number
  layers?: number
  dimensions?: { width: number; height: number }
  colorMode?: string
}

interface ProfessionalUploadProps {
  onFilesReady: (files: DesignFile[]) => void
  maxFiles?: number
}

export function ProfessionalUpload({ onFilesReady, maxFiles = 5 }: ProfessionalUploadProps) {
  const [files, setFiles] = useState<DesignFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showFormatInfo, setShowFormatInfo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileFormat = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || ""
    return SUPPORTED_FORMATS.find(f => f.ext === ext) || null
  }

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const format = getFileFormat(file.name)
    if (!format) {
      return { valid: false, error: "Unsupported file format" }
    }
    if (file.size > format.maxSize) {
      return { valid: false, error: `File too large (max ${formatFileSize(format.maxSize)})` }
    }
    return { valid: true }
  }

  const processFile = async (file: File): Promise<DesignFile> => {
    const id = Math.random().toString(36).substr(2, 9)
    const format = getFileFormat(file.name)
    
    const designFile: DesignFile = {
      file,
      id,
      name: file.name,
      size: file.size,
      type: format?.name || "Unknown",
      status: "uploading",
      progress: 0,
    }

    // Simulate layer extraction for PSD/AI files
    if (format?.ext === "psd" || format?.ext === "ai") {
      designFile.layers = Math.floor(Math.random() * 20) + 1
    }

    // Simulate dimension extraction
    if (format?.ext === "png" || format?.ext === "jpg" || format?.ext === "tiff") {
      designFile.dimensions = { width: 3000, height: 4000 }
      designFile.colorMode = "RGB"
    }

    // Generate preview for image files
    if (["png", "jpg", "tiff"].includes(format?.ext || "")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        designFile.preview = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }

    return designFile
  }

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return

    const newFiles: DesignFile[] = []
    
    for (let i = 0; i < Math.min(fileList.length, maxFiles - files.length); i++) {
      const file = fileList[i]
      const validation = validateFile(file)
      
      if (!validation.valid) {
        console.error(`Skipping ${file.name}: ${validation.error}`)
        continue
      }

      const designFile = await processFile(file)
      newFiles.push(designFile)

      // Simulate upload progress
      setTimeout(() => {
        setFiles(prev => prev.map(f => 
          f.id === designFile.id 
            ? { ...f, status: "processing", progress: 50 }
            : f
        ))
      }, 500)

      setTimeout(() => {
        setFiles(prev => prev.map(f => 
          f.id === designFile.id 
            ? { ...f, status: "ready", progress: 100 }
            : f
        ))
      }, 1500)
    }

    setFiles(prev => [...prev, ...newFiles])
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [files])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleContinue = () => {
    const readyFiles = files.filter(f => f.status === "ready")
    onFilesReady(readyFiles)
  }

  const allReady = files.length > 0 && files.every(f => f.status === "ready")

  return (
    <div className="space-y-6">
      {/* Format Support Info */}
      <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-4">
        <button 
          onClick={() => setShowFormatInfo(!showFormatInfo)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-[#4ade80]" />
            <span className="font-black tracking-tighter text-[#e8f5e8]">
              PROFESSIONAL FORMATS SUPPORTED
            </span>
          </div>
          <span className="text-[#6b8e6b]">{showFormatInfo ? "−" : "+"}</span>
        </button>
        
        {showFormatInfo && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {SUPPORTED_FORMATS.map((format) => (
              <div key={format.ext} className="flex items-center gap-2 bg-[#050805] p-2">
                <span className="text-lg">{format.icon}</span>
                <div>
                  <div className="text-sm font-black text-[#e8f5e8]">{format.name}</div>
                  <div className="text-xs text-[#6b8e6b] font-mono">
                    .{format.ext.toUpperCase()} • {formatFileSize(format.maxSize)} max
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed p-12 text-center cursor-pointer transition-all
          ${isDragging 
            ? "border-[#4ade80] bg-[#4ade80]/10" 
            : "border-[#1a2e1a] hover:border-[#4ade80]/50 bg-[#0a0f0a]"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".psd,.ai,.procreate,.tiff,.png,.jpg,.jpeg"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center gap-4 text-4xl">
            <span>🎨</span>
            <span>✏️</span>
            <span>🖌️</span>
          </div>
          <div>
            <p className="font-black tracking-tighter text-xl text-[#e8f5e8]">
              DROP YOUR DESIGN FILES
            </p>
            <p className="text-[#6b8e6b] mt-1">
              or click to browse from Procreate, Photoshop, Illustrator...
            </p>
          </div>
          <div className="flex justify-center gap-2 text-xs font-mono text-[#6b8e6b]">
            <span className="bg-[#1a2e1a] px-2 py-1">PSD</span>
            <span className="bg-[#1a2e1a] px-2 py-1">AI</span>
            <span className="bg-[#1a2e1a] px-2 py-1">PROCREATE</span>
            <span className="bg-[#1a2e1a] px-2 py-1">TIFF</span>
            <span className="bg-[#1a2e1a] px-2 py-1">PNG</span>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-black tracking-tighter text-sm text-[#6b8e6b]">
            UPLOADED FILES ({files.length}/{maxFiles})
          </h4>
          
          {files.map((file) => (
            <div 
              key={file.id}
              className="bg-[#0a0f0a] border border-[#1a2e1a] p-4 flex items-center gap-4"
            >
              {/* Preview */}
              <div className="w-16 h-16 bg-[#1a2e1a] flex items-center justify-center flex-shrink-0">
                {file.preview ? (
                  <img 
                    src={file.preview} 
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileImage className="h-8 w-8 text-[#4ade80]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#e8f5e8] truncate">{file.name}</span>
                  {file.status === "ready" && (
                    <CheckCircle2 className="h-4 w-4 text-[#4ade80]" />
                  )}
                  {file.status === "processing" && (
                    <Zap className="h-4 w-4 text-[#fbbf24] animate-pulse" />
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3 text-xs font-mono text-[#6b8e6b] mt-1">
                  <span>{file.type}</span>
                  <span>•</span>
                  <span>{formatFileSize(file.size)}</span>
                  {file.layers && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {file.layers} layers
                      </span>
                    </>
                  )}
                  {file.dimensions && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Ruler className="h-3 w-3" />
                        {file.dimensions.width}×{file.dimensions.height}
                      </span>
                    </>
                  )}
                  {file.colorMode && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Palette className="h-3 w-3" />
                        {file.colorMode}
                      </span>
                    </>
                  )}
                </div>

                {/* Progress Bar */}
                {file.status !== "ready" && (
                  <div className="mt-2 h-1 bg-[#1a2e1a] overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        file.status === "error" ? "bg-[#dc2626]" : "bg-[#4ade80]"
                      }`}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <button
                onClick={() => removeFile(file.id)}
                className="p-2 text-[#6b8e6b] hover:text-[#dc2626] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Continue Button */}
      {files.length > 0 && (
        <Button
          onClick={handleContinue}
          disabled={!allReady}
          className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-black rounded-none font-black tracking-wider h-14 brutal-box disabled:opacity-50"
        >
          {allReady ? (
            <>
              <ImageIcon className="h-5 w-5 mr-2" />
              CONTINUE TO MOCKUP DESIGNER
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2 animate-pulse" />
              PROCESSING FILES...
            </>
          )}
        </Button>
      )}

      {/* Tips */}
      <div className="bg-[#050805] border border-[#1a2e1a] p-4 text-sm">
        <h5 className="font-black tracking-tighter text-[#6b8e6b] mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          BEST PRACTICES FOR UPLOAD
        </h5>
        <ul className="text-[#6b8e6b] space-y-1 list-disc list-inside">
          <li>Use <strong className="text-[#e8f5e8]">300 DPI</strong> for best print quality</li>
          <li><strong className="text-[#e8f5e8]">Transparent PNG</strong> for designs with no background</li>
          <li>Keep layers intact in PSD/AI for easier editing</li>
          <li>Maximum print area is typically 12×16 inches</li>
        </ul>
      </div>
    </div>
  )
}
