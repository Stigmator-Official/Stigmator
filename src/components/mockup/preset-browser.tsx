/**
 * Preset Browser Component
 * Grid/List view for browsing and managing mockup presets
 */

'use client'

import { useState, useMemo } from 'react'
import { 
  Grid3X3, 
  List, 
  Search, 
  MoreVertical, 
  Download, 
  Copy, 
  Trash2, 
  Edit3,
  Filter,
  X,
  CheckSquare,
  Square,
  Clock,
  Shirt,
  Tag,
  ArrowUpDown,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { MockupPreset, GarmentType } from '@/lib/mockup/preset-manager'

// ============================================================================
// Types
// ============================================================================

interface PresetBrowserProps {
  presets: MockupPreset[]
  selectedId?: string
  onSelect: (preset: MockupPreset) => void
  onEdit: (preset: MockupPreset) => void
  onDelete: (id: string) => void
  onDuplicate: (preset: MockupPreset) => void
  onExport: (preset: MockupPreset) => void
  onBulkExport?: (presets: MockupPreset[]) => void
  onBulkDelete?: (ids: string[]) => void
}

type ViewMode = 'grid' | 'list'
type SortField = 'name' | 'updatedAt' | 'createdAt'
type SortDirection = 'asc' | 'desc'

// ============================================================================
// Garment Type Display
// ============================================================================

const GARMENT_LABELS: Record<GarmentType, string> = {
  tshirt: 'T-Shirt',
  hoodie: 'Hoodie',
  tank: 'Tank Top',
  longsleeve: 'Long Sleeve',
  sweatshirt: 'Sweatshirt',
}

const GARMENT_COLORS: Record<GarmentType, string> = {
  tshirt: 'bg-blue-500/20 text-blue-400',
  hoodie: 'bg-purple-500/20 text-purple-400',
  tank: 'bg-green-500/20 text-green-400',
  longsleeve: 'bg-orange-500/20 text-orange-400',
  sweatshirt: 'bg-red-500/20 text-red-400',
}

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
        <Shirt className="w-10 h-10 text-zinc-500" />
      </div>
      <h3 className="text-xl font-semibold text-zinc-100 mb-2">
        No presets yet
      </h3>
      <p className="text-zinc-400 max-w-sm mb-6">
        Save your mockup configurations as presets to quickly apply them later.
      </p>
      {onCreate && (
        <Button onClick={onCreate} className="bg-indigo-600 hover:bg-indigo-700">
          Create Your First Preset
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// Preset Card Component
// ============================================================================

interface PresetCardProps {
  preset: MockupPreset
  isSelected: boolean
  isChecked: boolean
  viewMode: ViewMode
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onExport: () => void
  onToggleCheck: () => void
}

function PresetCard({
  preset,
  isSelected,
  isChecked,
  viewMode,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
  onToggleCheck,
}: PresetCardProps) {
  const garmentType = preset.config.garmentType
  const garmentLabel = GARMENT_LABELS[garmentType]
  const garmentColorClass = GARMENT_COLORS[garmentType]

  if (viewMode === 'list') {
    return (
      <Card
        className={cn(
          'group cursor-pointer transition-all duration-200 border-zinc-800',
          'hover:border-zinc-700 hover:bg-zinc-800/50',
          isSelected && 'border-indigo-500 bg-indigo-500/10'
        )}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-prevent-select]')) return
          onSelect()
        }}
      >
        <CardContent className="p-4 flex items-center gap-4">
          {/* Checkbox */}
          <div data-prevent-select onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isChecked}
              onCheckedChange={onToggleCheck}
              className="border-zinc-600"
            />
          </div>

          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
            {preset.thumbnail ? (
              <img
                src={preset.thumbnail}
                alt={preset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Shirt className="w-6 h-6 text-zinc-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-zinc-100 truncate">{preset.name}</h4>
              {preset.isDefault && (
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs">
                  Default
                </Badge>
              )}
            </div>
            <p className="text-sm text-zinc-500 truncate">
              {preset.description || 'No description'}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className={cn('text-xs', garmentColorClass)}>
                {garmentLabel}
              </Badge>
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(preset.updatedAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Tags */}
          {preset.tags && preset.tags.length > 0 && (
            <div className="hidden md:flex items-center gap-1 flex-wrap max-w-[200px]">
              {preset.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                  {tag}
                </Badge>
              ))}
              {preset.tags.length > 3 && (
                <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                  +{preset.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div data-prevent-select onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-red-400 focus:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view
  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 border-zinc-800 overflow-hidden',
        'hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50',
        isSelected && 'border-indigo-500 ring-1 ring-indigo-500'
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-prevent-select]')) return
        onSelect()
      }}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
        {preset.thumbnail ? (
          <img
            src={preset.thumbnail}
            alt={preset.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt className="w-12 h-12 text-zinc-600" />
          </div>
        )}
        
        {/* Checkbox overlay */}
        <div 
          className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity"
          data-prevent-select
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isChecked}
            onCheckedChange={onToggleCheck}
            className="border-zinc-400 data-[state=checked]:bg-indigo-600"
          />
        </div>

        {/* Actions overlay */}
        <div 
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          data-prevent-select
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-zinc-900/80 backdrop-blur">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-400 focus:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Default badge */}
        {preset.isDefault && (
          <Badge 
            className="absolute bottom-3 left-3 bg-amber-500/90 text-amber-950"
          >
            Default
          </Badge>
        )}
      </div>

      {/* Info */}
      <CardContent className="p-4">
        <h4 className="font-medium text-zinc-100 truncate mb-1">{preset.name}</h4>
        <p className="text-sm text-zinc-500 truncate mb-3">
          {preset.description || 'No description'}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn('text-xs', garmentColorClass)}>
            {garmentLabel}
          </Badge>
          <span className="text-xs text-zinc-500">
            {formatDistanceToNow(new Date(preset.updatedAt), { addSuffix: true })}
          </span>
        </div>

        {preset.tags && preset.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mt-3">
            {preset.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                {tag}
              </Badge>
            ))}
            {preset.tags.length > 2 && (
              <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                +{preset.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function PresetBrowser({
  presets,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
  onBulkExport,
  onBulkDelete,
}: PresetBrowserProps) {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [garmentFilter, setGarmentFilter] = useState<GarmentType | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // Selection state
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    presets.forEach((p) => p.tags?.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [presets])
  
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Filter and sort presets
  const filteredPresets = useMemo(() => {
    let result = [...presets]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some((t) => t.toLowerCase().includes(query))
      )
    }

    // Garment filter
    if (garmentFilter !== 'all') {
      result = result.filter((p) => p.config.garmentType === garmentFilter)
    }

    // Tag filter
    if (selectedTags.length > 0) {
      result = result.filter((p) =>
        selectedTags.some((t) => p.tags?.includes(t))
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [presets, searchQuery, garmentFilter, selectedTags, sortField, sortDirection])

  // Toggle selection
  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedIds)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedIds(newChecked)
  }

  const toggleAll = () => {
    if (checkedIds.size === filteredPresets.length) {
      setCheckedIds(new Set())
    } else {
      setCheckedIds(new Set(filteredPresets.map((p) => p.id)))
    }
  }

  // Bulk actions
  const handleBulkExport = () => {
    const selectedPresets = presets.filter((p) => checkedIds.has(p.id))
    onBulkExport?.(selectedPresets)
  }

  const handleBulkDelete = () => {
    onBulkDelete?.(Array.from(checkedIds))
    setCheckedIds(new Set())
    setShowBulkDeleteConfirm(false)
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setGarmentFilter('all')
    setSelectedTags([])
  }

  const hasFilters = searchQuery || garmentFilter !== 'all' || selectedTags.length > 0
  const hasSelection = checkedIds.size > 0

  if (presets.length === 0) {
    return <EmptyState onCreate={() => {}} />
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-500"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select value={garmentFilter} onValueChange={(v) => setGarmentFilter(v as GarmentType | 'all')}>
            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-zinc-100">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Garment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tshirt">T-Shirt</SelectItem>
              <SelectItem value="hoodie">Hoodie</SelectItem>
              <SelectItem value="tank">Tank Top</SelectItem>
              <SelectItem value="longsleeve">Long Sleeve</SelectItem>
              <SelectItem value="sweatshirt">Sweatshirt</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-zinc-100">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className="border-zinc-800 text-zinc-400"
          >
            <ArrowUpDown className={cn('w-4 h-4', sortDirection === 'desc' && 'rotate-180')} />
          </Button>

          <Separator orientation="vertical" className="h-8 bg-zinc-800" />

          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className={cn(
              'border-zinc-800',
              viewMode === 'grid' && 'bg-zinc-800 text-zinc-100'
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            className={cn(
              'border-zinc-800',
              viewMode === 'list' && 'bg-zinc-800 text-zinc-100'
            )}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-zinc-500" />
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-colors',
                selectedTags.includes(tag)
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
              )}
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags(selectedTags.filter((t) => t !== tag))
                } else {
                  setSelectedTags([...selectedTags, tag])
                }
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">
            {filteredPresets.length} result{filteredPresets.length !== 1 ? 's' : ''}
          </span>
          <Button variant="link" size="sm" onClick={clearFilters} className="text-indigo-400">
            Clear filters
          </Button>
        </div>
      )}

      {/* Bulk Actions */}
      {hasSelection && (
        <div className="flex items-center gap-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-zinc-200">
              {checkedIds.size} selected
            </span>
          </div>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBulkExport}
            className="text-zinc-300 hover:text-zinc-100"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      )}

      {/* List View Header */}
      {viewMode === 'list' && filteredPresets.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-2 text-sm text-zinc-500 border-b border-zinc-800">
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={checkedIds.size === filteredPresets.length && filteredPresets.length > 0}
              onCheckedChange={toggleAll}
              className="border-zinc-600"
            />
          </div>
          <span className="flex-1">Name</span>
          <span className="w-32 hidden md:block">Tags</span>
          <span className="w-10" />
        </div>
      )}

      {/* Presets Grid/List */}
      <ScrollArea className="h-[500px]">
        {filteredPresets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">No presets match your filters</p>
            <Button variant="link" onClick={clearFilters} className="text-indigo-400 mt-2">
              Clear all filters
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-4',
              viewMode === 'grid' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            )}
          >
            {filteredPresets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isSelected={preset.id === selectedId}
                isChecked={checkedIds.has(preset.id)}
                viewMode={viewMode}
                onSelect={() => onSelect(preset)}
                onEdit={() => onEdit(preset)}
                onDelete={() => setDeleteConfirmId(preset.id)}
                onDuplicate={() => onDuplicate(preset)}
                onExport={() => onExport(preset)}
                onToggleCheck={() => toggleCheck(preset.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Delete Preset</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete this preset? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirmId) {
                  onDelete(deleteConfirmId)
                  setDeleteConfirmId(null)
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Delete {checkedIds.size} Presets</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete these presets? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
