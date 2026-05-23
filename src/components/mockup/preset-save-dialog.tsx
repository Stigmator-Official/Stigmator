/**
 * Preset Save Dialog Component
 * Dialog for saving and editing mockup presets
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Save, 
  Camera, 
  Sparkles, 
  Globe, 
  Star,
  X,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { MockupPreset, GarmentType } from '@/lib/mockup/preset-manager'

// ============================================================================
// Types
// ============================================================================

interface PresetSaveDialogProps {
  isOpen: boolean
  onClose: () => void
  currentConfig: MockupPreset['config']
  existingPreset?: MockupPreset
  onSave: (preset: Omit<MockupPreset, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'version' | 'checksum'>) => void
  
  // Optional: For capturing thumbnail from 3D canvas
  canvasRef?: React.RefObject<HTMLCanvasElement>
  onCaptureThumbnail?: () => Promise<string>
}

// ============================================================================
// Garment Type Labels
// ============================================================================

const GARMENT_LABELS: Record<GarmentType, string> = {
  tshirt: 'T-Shirt',
  hoodie: 'Hoodie',
  tank: 'Tank Top',
  longsleeve: 'Long Sleeve',
  sweatshirt: 'Sweatshirt',
}

// ============================================================================
// Helper: Generate Auto Name
// ============================================================================

function generateAutoName(config: MockupPreset['config']): string {
  const garment = GARMENT_LABELS[config.garmentType]
  const variant = config.variant
  const color = config.color
  const timestamp = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
  
  return `${garment} - ${variant} ${color} (${timestamp})`
}

// ============================================================================
// Thumbnail Preview Component
// ============================================================================

interface ThumbnailPreviewProps {
  thumbnail: string | undefined
  onCapture: () => void
  isCapturing: boolean
  garmentType: GarmentType
}

function ThumbnailPreview({ 
  thumbnail, 
  onCapture, 
  isCapturing,
  garmentType,
}: ThumbnailPreviewProps) {
  return (
    <div className="space-y-2">
      <Label className="text-zinc-300">Preview Thumbnail</Label>
      <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt="Preset preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span className="text-sm">No preview captured</span>
          </div>
        )}
        
        {/* Capture button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onCapture}
                  disabled={isCapturing}
                  className="bg-white/10 backdrop-blur hover:bg-white/20"
                >
                  {isCapturing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 mr-2" />
                  )}
                  {isCapturing ? 'Capturing...' : 'Capture from 3D'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Capture current 3D view as thumbnail</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <p className="text-xs text-zinc-500">
        Click the image to capture the current 3D view
      </p>
    </div>
  )
}

// ============================================================================
// Tag Input Component
// ============================================================================

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

const COMMON_TAGS = ['front', 'back', 'vintage', 'minimal', 'bold', 'colorful', 'monochrome']

function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInputValue('')
  }, [tags, onChange])

  const removeTag = useCallback((tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove))
  }, [tags, onChange])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-zinc-300">Tags</Label>
      
      {/* Input */}
      <div className="flex flex-wrap gap-2 p-2 bg-zinc-900 border border-zinc-800 rounded-md min-h-[44px]">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 gap-1"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-red-400"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              addTag(inputValue)
            }
          }}
          placeholder={tags.length === 0 ? 'Add tags...' : ''}
          className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-sm text-zinc-100 placeholder:text-zinc-600"
        />
      </div>

      {/* Common tags suggestions */}
      <div className="flex flex-wrap gap-1">
        <span className="text-xs text-zinc-500 mr-2">Suggested:</span>
        {COMMON_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
          <button
            key={tag}
            onClick={() => addTag(tag)}
            className="text-xs px-2 py-1 rounded-full bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          >
            + {tag}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function PresetSaveDialog({
  isOpen,
  onClose,
  currentConfig,
  existingPreset,
  onSave,
  canvasRef,
  onCaptureThumbnail,
}: PresetSaveDialogProps) {
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined)
  const [isDefault, setIsDefault] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)

  // Initialize form when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (existingPreset) {
        setName(existingPreset.name)
        setDescription(existingPreset.description || '')
        setTags(existingPreset.tags || [])
        setThumbnail(existingPreset.thumbnail)
        setIsDefault(existingPreset.isDefault || false)
        setIsPublic(existingPreset.isPublic || false)
      } else {
        setName(generateAutoName(currentConfig))
        setDescription('')
        setTags([])
        setThumbnail(undefined)
        setIsDefault(false)
        setIsPublic(false)
      }
    }
  }, [isOpen, existingPreset, currentConfig])

  // Capture thumbnail from canvas
  const handleCaptureThumbnail = useCallback(async () => {
    if (onCaptureThumbnail) {
      setIsCapturing(true)
      try {
        const dataUrl = await onCaptureThumbnail()
        setThumbnail(dataUrl)
      } catch (err) {
        console.error('Failed to capture thumbnail:', err)
      } finally {
        setIsCapturing(false)
      }
      return
    }

    if (canvasRef?.current) {
      setIsCapturing(true)
      try {
        const canvas = canvasRef.current
        const dataUrl = canvas.toDataURL('image/png')
        setThumbnail(dataUrl)
      } catch (err) {
        console.error('Failed to capture thumbnail:', err)
      } finally {
        setIsCapturing(false)
      }
    }
  }, [canvasRef, onCaptureThumbnail])

  // Handle save
  const handleSave = useCallback(() => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    const presetData = {
      name: trimmedName,
      description: description.trim() || undefined,
      config: currentConfig,
      thumbnail,
      tags: tags.length > 0 ? tags : undefined,
      isDefault,
      isPublic,
    }

    onSave(presetData)
    onClose()
  }, [name, description, currentConfig, thumbnail, tags, isDefault, isPublic, onSave, onClose])

  const isValid = name.trim().length > 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-indigo-400" />
            {existingPreset ? 'Edit Preset' : 'Save Preset'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {existingPreset 
              ? 'Update your preset configuration.' 
              : 'Save your current mockup configuration for quick access later.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="preset-name" className="text-zinc-300">
              Preset Name <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Input
                id="preset-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Custom Preset"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
              />
              {!existingPreset && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setName(generateAutoName(currentConfig))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 text-xs text-zinc-500 hover:text-zinc-300"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Auto
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Generate name based on current configuration</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="preset-description" className="text-zinc-300">
              Description
            </Label>
            <Textarea
              id="preset-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this preset configuration..."
              rows={3}
              className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 resize-none"
            />
          </div>

          {/* Tags */}
          <TagInput tags={tags} onChange={setTags} />

          {/* Thumbnail */}
          <ThumbnailPreview
            thumbnail={thumbnail}
            onCapture={handleCaptureThumbnail}
            isCapturing={isCapturing}
            garmentType={currentConfig.garmentType}
          />

          {/* Options */}
          <div className="space-y-3 pt-2">
            <Label className="text-zinc-300">Options</Label>
            
            <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">Set as default</p>
                  <p className="text-xs text-zinc-500">Load this preset when opening the editor</p>
                </div>
              </div>
              <Switch
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">Make public</p>
                  <p className="text-xs text-zinc-500">Share this preset with the community</p>
                </div>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>

          {/* Config Summary */}
          <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800">
            <p className="text-xs font-medium text-zinc-500 mb-2">Configuration Summary</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-600">Garment:</span>
                <span className="text-zinc-400">{GARMENT_LABELS[currentConfig.garmentType]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Variant:</span>
                <span className="text-zinc-400">{currentConfig.variant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Color:</span>
                <span className="text-zinc-400">{currentConfig.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Fabric:</span>
                <span className="text-zinc-400 capitalize">{currentConfig.fabric}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValid}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {existingPreset ? 'Update Preset' : 'Save Preset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
