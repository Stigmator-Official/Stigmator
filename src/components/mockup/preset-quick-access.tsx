/**
 * Preset Quick Access Component
 * Quick access toolbar for loading and saving presets
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Save, 
  ChevronDown, 
  RotateCcw, 
  Clock,
  Star,
  Plus,
  FilePlus,
  MoreHorizontal,
  History,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ScrollArea,
  ScrollBar,
} from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { MockupPreset } from '@/lib/mockup/preset-manager'

// ============================================================================
// Types
// ============================================================================

interface QuickAccessProps {
  recentPresets: MockupPreset[]
  defaultPreset?: MockupPreset
  onLoadPreset: (preset: MockupPreset) => void
  onSaveCurrent: () => void
  onSaveAsNew?: () => void
  onResetToDefault?: () => void
  onOpenBrowser?: () => void
  currentPresetId?: string
}

// ============================================================================
// Preset Thumbnail Component
// ============================================================================

interface PresetThumbnailProps {
  preset: MockupPreset
  isActive?: boolean
  onClick: () => void
}

function PresetThumbnail({ preset, isActive, onClick }: PresetThumbnailProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-200',
              'border-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900',
              isActive 
                ? 'border-indigo-500 ring-2 ring-indigo-500/50' 
                : 'border-zinc-700 hover:border-zinc-500'
            )}
          >
            {preset.thumbnail ? (
              <img
                src={preset.thumbnail}
                alt={preset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <span className="text-xs font-medium text-zinc-500">
                  {preset.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Default indicator */}
            {preset.isDefault && (
              <div className="absolute top-0.5 right-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="font-medium text-zinc-100">{preset.name}</p>
          {preset.description && (
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{preset.description}</p>
          )}
          <p className="text-xs text-zinc-500 mt-1">
            {new Date(preset.updatedAt).toLocaleDateString()}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================================================================
// Save Dropdown Component
// ============================================================================

interface SaveDropdownProps {
  onSaveCurrent: () => void
  onSaveAsNew?: () => void
  hasCurrentPreset: boolean
}

function SaveDropdown({ onSaveCurrent, onSaveAsNew, hasCurrentPreset }: SaveDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 h-9"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
          <ChevronDown className="w-3 h-3 ml-2 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Save Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onSaveCurrent}>
          <Save className="w-4 h-4 mr-2" />
          {hasCurrentPreset ? 'Update Preset' : 'Save Current'}
          <span className="ml-auto text-xs text-zinc-500">Ctrl+S</span>
        </DropdownMenuItem>
        
        {onSaveAsNew && (
          <DropdownMenuItem onClick={onSaveAsNew}>
            <FilePlus className="w-4 h-4 mr-2" />
            Save as New
            <span className="ml-auto text-xs text-zinc-500">Ctrl+Shift+S</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============================================================================
// Recent Presets Dropdown Component
// ============================================================================

interface RecentPresetsDropdownProps {
  recentPresets: MockupPreset[]
  currentPresetId?: string
  onLoadPreset: (preset: MockupPreset) => void
  onOpenBrowser?: () => void
}

function RecentPresetsDropdown({ 
  recentPresets, 
  currentPresetId,
  onLoadPreset,
  onOpenBrowser,
}: RecentPresetsDropdownProps) {
  if (recentPresets.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenBrowser}
        className="h-9 border-zinc-700 text-zinc-400 hover:text-zinc-100"
      >
        <History className="w-4 h-4 mr-2" />
        Browse Presets
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-zinc-700 text-zinc-400 hover:text-zinc-100"
        >
          <Clock className="w-4 h-4 mr-2" />
          Recent
          <ChevronDown className="w-3 h-3 ml-2 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Recent Presets</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="max-h-[300px]">
          <DropdownMenuGroup>
            {recentPresets.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                onClick={() => onLoadPreset(preset)}
                className={cn(
                  'flex items-center gap-3 py-2',
                  preset.id === currentPresetId && 'bg-indigo-500/10'
                )}
              >
                <div className="w-8 h-8 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                  {preset.thumbnail ? (
                    <img
                      src={preset.thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                      {preset.name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{preset.name}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(preset.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                {preset.isDefault && (
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                )}
                {preset.id === currentPresetId && (
                  <Badge variant="secondary" className="text-xs bg-indigo-500/20 text-indigo-400">
                    Active
                  </Badge>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </ScrollArea>
        
        {onOpenBrowser && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenBrowser}>
              <MoreHorizontal className="w-4 h-4 mr-2" />
              Browse All Presets
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function PresetQuickAccess({
  recentPresets,
  defaultPreset,
  onLoadPreset,
  onSaveCurrent,
  onSaveAsNew,
  onResetToDefault,
  onOpenBrowser,
  currentPresetId,
}: QuickAccessProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Check scrollability
  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [checkScroll, recentPresets])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to save
      if (e.ctrlKey && e.key === 's' && !e.shiftKey) {
        e.preventDefault()
        onSaveCurrent()
      }
      // Ctrl+Shift+S to save as new
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        onSaveAsNew?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSaveCurrent, onSaveAsNew])

  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-900/80 backdrop-blur rounded-lg border border-zinc-800">
      {/* Save Buttons */}
      <SaveDropdown
        onSaveCurrent={onSaveCurrent}
        onSaveAsNew={onSaveAsNew}
        hasCurrentPreset={!!currentPresetId}
      />

      <div className="w-px h-6 bg-zinc-800" />

      {/* Recent Presets Strip */}
      <div className="flex-1 relative">
        {/* Scroll indicators */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-900 to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-900 to-transparent z-10 pointer-events-none" />
        )}

        <ScrollArea className="w-full whitespace-nowrap">
          <div 
            ref={scrollRef}
            className="flex items-center gap-2 py-1"
          >
            {/* Default preset first */}
            {defaultPreset && !recentPresets.find(p => p.id === defaultPreset.id) && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onLoadPreset(defaultPreset)}
                        className={cn(
                          'relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-200',
                          'border-2 border-amber-500/50 hover:border-amber-500 hover:scale-105',
                          defaultPreset.id === currentPresetId && 'ring-2 ring-amber-500'
                        )}
                      >
                        {defaultPreset.thumbnail ? (
                          <img
                            src={defaultPreset.thumbnail}
                            alt={defaultPreset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <Star className="w-5 h-5 text-amber-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                          <RotateCcw className="w-5 h-5 text-white" />
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="font-medium">Default Preset</p>
                      <p className="text-xs text-zinc-500">{defaultPreset.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="w-px h-8 bg-zinc-800 mx-1" />
              </>
            )}

            {/* Recent presets */}
            {recentPresets.map((preset) => (
              <PresetThumbnail
                key={preset.id}
                preset={preset}
                isActive={preset.id === currentPresetId}
                onClick={() => onLoadPreset(preset)}
              />
            ))}

            {/* Empty state */}
            {recentPresets.length === 0 && !defaultPreset && (
              <div className="flex items-center gap-2 text-zinc-500 text-sm py-3">
                <History className="w-4 h-4" />
                <span>No recent presets</span>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="w-px h-6 bg-zinc-800" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Reset to default */}
        {onResetToDefault && defaultPreset && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onResetToDefault}
                  className="h-9 w-9 border-zinc-700 text-zinc-400 hover:text-amber-400 hover:border-amber-500/50"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset to Default</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Recent dropdown */}
        <RecentPresetsDropdown
          recentPresets={recentPresets}
          currentPresetId={currentPresetId}
          onLoadPreset={onLoadPreset}
          onOpenBrowser={onOpenBrowser}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Compact Version (for smaller spaces)
// ============================================================================

interface CompactQuickAccessProps {
  recentPresets: MockupPreset[]
  onLoadPreset: (preset: MockupPreset) => void
  onSaveCurrent: () => void
  onOpenBrowser?: () => void
}

export function CompactPresetQuickAccess({
  recentPresets,
  onLoadPreset,
  onSaveCurrent,
  onOpenBrowser,
}: CompactQuickAccessProps) {
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onSaveCurrent}
              className="h-9 w-9 border-zinc-700"
            >
              <Save className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save Preset (Ctrl+S)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-zinc-700 text-zinc-400"
          >
            <Clock className="w-4 h-4 mr-2" />
            {recentPresets.length > 0 ? recentPresets[0].name : 'Recent'}
            <ChevronDown className="w-3 h-3 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {recentPresets.length === 0 ? (
            <DropdownMenuItem disabled>No recent presets</DropdownMenuItem>
          ) : (
            recentPresets.map((preset) => (
              <DropdownMenuItem key={preset.id} onClick={() => onLoadPreset(preset)}>
                <div className="w-6 h-6 rounded bg-zinc-800 mr-2 overflow-hidden">
                  {preset.thumbnail && (
                    <img src={preset.thumbnail} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                {preset.name}
              </DropdownMenuItem>
            ))
          )}
          {onOpenBrowser && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenBrowser}>
                <Plus className="w-4 h-4 mr-2" />
                Browse All
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
