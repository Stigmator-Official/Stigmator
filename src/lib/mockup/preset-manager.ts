/**
 * Preset Manager for Stigmator 3D Mockup Generator
 * Handles CRUD operations, storage, and sync for mockup presets
 */

import Dexie, { type Table } from 'dexie'

// ============================================================================
// Types
// ============================================================================

export type GarmentType = 'tshirt' | 'hoodie' | 'tank' | 'longsleeve' | 'sweatshirt'
export type FabricType = 'cotton' | 'polyester' | 'blend' | 'organic'

export interface MockupPreset {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string

  // The mockup configuration
  config: {
    garmentType: GarmentType
    variant: string
    color: string
    fabric: FabricType
    design: {
      url: string
      transform: {
        position: { x: number; y: number }
        scale: number
        rotation: number
      }
      printArea: string
    }
    camera: {
      angle: { theta: number; phi: number }
      zoom: number
    }
    lighting: 'studio' | 'dramatic' | 'minimal'
  }

  // Preview thumbnail (dataURL)
  thumbnail?: string

  // Metadata
  tags?: string[]
  isDefault?: boolean
  isPublic?: boolean
  
  // Sync metadata
  userId: string
  version: number
  checksum: string
}

export interface PresetManager {
  // CRUD operations
  save(preset: Omit<MockupPreset, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'version' | 'checksum'>): Promise<MockupPreset>
  update(id: string, updates: Partial<MockupPreset>): Promise<MockupPreset>
  delete(id: string): Promise<void>
  get(id: string): Promise<MockupPreset | null>
  list(): Promise<MockupPreset[]>

  // Search/filter
  search(query: string): Promise<MockupPreset[]>
  filterByGarment(type: GarmentType): Promise<MockupPreset[]>
  filterByTags(tags: string[]): Promise<MockupPreset[]>

  // Storage
  exportToJSON(presets: MockupPreset[]): string
  importFromJSON(json: string): MockupPreset[]

  // Sync
  syncToCloud(): Promise<void>
  syncFromCloud(): Promise<void>
  
  // Recent presets
  getRecent(): Promise<MockupPreset[]>
  addToRecent(presetId: string): Promise<void>
  
  // Default preset
  getDefault(): Promise<MockupPreset | null>
  setDefault(id: string): Promise<void>
}

// ============================================================================
// Constants
// ============================================================================

const DB_NAME = 'StigmatorPresets'
const DB_VERSION = 1
const CURRENT_SCHEMA_VERSION = 1
const MAX_RECENT_PRESETS = 10
const RECENT_STORAGE_KEY = 'stigmator:recent_presets'

// ============================================================================
// Database Setup
// ============================================================================

class PresetDatabase extends Dexie {
  presets!: Table<MockupPreset, string>

  constructor() {
    super(DB_NAME)
    this.version(DB_VERSION).stores({
      presets: 'id, name, userId, *tags, createdAt, updatedAt, isDefault, garmentType',
    })
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function generateId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateChecksum(preset: Omit<MockupPreset, 'checksum'>): string {
  // Simple checksum based on config content
  const content = JSON.stringify(preset.config)
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return hash.toString(16)
}

function validatePreset(preset: unknown): MockupPreset {
  // Schema validation
  if (!preset || typeof preset !== 'object') {
    throw new Error('Invalid preset: must be an object')
  }

  const p = preset as Record<string, unknown>

  // Check required fields
  if (!p.id || typeof p.id !== 'string') {
    throw new Error('Invalid preset: missing or invalid id')
  }
  if (!p.name || typeof p.name !== 'string') {
    throw new Error('Invalid preset: missing or invalid name')
  }
  if (!p.config || typeof p.config !== 'object') {
    throw new Error('Invalid preset: missing or invalid config')
  }

  // Version check for future migrations
  const version = (p.version as number) || 0
  if (version > CURRENT_SCHEMA_VERSION) {
    throw new Error(`Unsupported preset version: ${version}`)
  }

  // Integrity check
  if (p.checksum && typeof p.checksum === 'string') {
    const { checksum, ...presetWithoutChecksum } = p as unknown as MockupPreset
    const expectedChecksum = generateChecksum(presetWithoutChecksum)
    if (checksum !== expectedChecksum) {
      console.warn('Preset checksum mismatch - possible corruption')
    }
  }

  return p as unknown as MockupPreset
}

function migratePreset(preset: MockupPreset): MockupPreset {
  // Handle migrations between schema versions
  const version = preset.version || 0

  if (version < CURRENT_SCHEMA_VERSION) {
    // Add migration logic here when schema changes
    // Example:
    // if (version === 0) {
    //   preset.config.lighting = preset.config.lighting || 'studio'
    // }
  }

  return {
    ...preset,
    version: CURRENT_SCHEMA_VERSION,
  }
}

// ============================================================================
// Storage Utilities
// ============================================================================

function getRecentFromStorage(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function setRecentToStorage(recent: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_PRESETS)))
  } catch (e) {
    console.error('Failed to save recent presets:', e)
  }
}

// ============================================================================
// Cloud Sync (Supabase)
// ============================================================================

interface SupabaseClient {
  from: (table: string) => {
    select: (columns?: string) => Promise<{ data: unknown[] | null; error: Error | null }>
    insert: (data: unknown) => Promise<{ data: unknown[] | null; error: Error | null }>
    upsert: (data: unknown) => Promise<{ data: unknown[] | null; error: Error | null }>
    delete: () => { eq: (column: string, value: string) => Promise<{ error: Error | null }> }
  }
  auth: {
    getUser: () => Promise<{ data: { user: { id: string } | null } }>
  }
}

let supabaseClient: SupabaseClient | null = null

export function setSupabaseClient(client: SupabaseClient): void {
  supabaseClient = client
}

// ============================================================================
// Preset Manager Factory
// ============================================================================

export function createPresetManager(userId: string): PresetManager {
  const db = new PresetDatabase()

  // Initialize database
  db.open().catch((err) => {
    console.error('Failed to open preset database:', err)
  })

  const manager: PresetManager = {
    // -------------------------------------------------------------------------
    // CRUD Operations
    // -------------------------------------------------------------------------

    async save(preset): Promise<MockupPreset> {
      const now = new Date().toISOString()
      const presetWithoutMeta = { ...preset }
      
      const newPreset: MockupPreset = {
        ...presetWithoutMeta,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        userId,
        version: CURRENT_SCHEMA_VERSION,
        checksum: '', // Will be set below
      }

      newPreset.checksum = generateChecksum(newPreset)

      await db.presets.add(newPreset)
      await this.addToRecent(newPreset.id)

      return newPreset
    },

    async update(id, updates): Promise<MockupPreset> {
      const existing = await db.presets.get(id)
      if (!existing) {
        throw new Error(`Preset not found: ${id}`)
      }

      const now = new Date().toISOString()
      const updated: MockupPreset = {
        ...existing,
        ...updates,
        id, // Prevent id change
        userId, // Prevent userId change
        updatedAt: now,
      }

      // Recalculate checksum
      const { checksum: _, ...presetWithoutChecksum } = updated
      updated.checksum = generateChecksum(presetWithoutChecksum)

      await db.presets.put(updated)
      return updated
    },

    async delete(id): Promise<void> {
      await db.presets.delete(id)
      
      // Remove from recent
      const recent = getRecentFromStorage().filter((rid) => rid !== id)
      setRecentToStorage(recent)
    },

    async get(id): Promise<MockupPreset | null> {
      const preset = await db.presets.get(id)
      if (!preset) return null
      
      await this.addToRecent(id)
      return migratePreset(validatePreset(preset))
    },

    async list(): Promise<MockupPreset[]> {
      const presets = await db.presets
        .where('userId')
        .equals(userId)
        .sortBy('updatedAt')
      
      return presets
        .map(migratePreset)
        .map(validatePreset)
        .reverse() // Most recent first
    },

    // -------------------------------------------------------------------------
    // Search & Filter
    // -------------------------------------------------------------------------

    async search(query): Promise<MockupPreset[]> {
      const lowerQuery = query.toLowerCase()
      const all = await this.list()
      
      return all.filter((preset) => {
        const nameMatch = preset.name.toLowerCase().includes(lowerQuery)
        const descMatch = preset.description?.toLowerCase().includes(lowerQuery)
        const tagMatch = preset.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
        const garmentMatch = preset.config.garmentType.toLowerCase().includes(lowerQuery)
        
        return nameMatch || descMatch || tagMatch || garmentMatch
      })
    },

    async filterByGarment(type): Promise<MockupPreset[]> {
      const all = await this.list()
      return all.filter((preset) => preset.config.garmentType === type)
    },

    async filterByTags(tags): Promise<MockupPreset[]> {
      const all = await this.list()
      return all.filter((preset) => 
        tags.some((tag) => preset.tags?.includes(tag))
      )
    },

    // -------------------------------------------------------------------------
    // Import/Export
    // -------------------------------------------------------------------------

    exportToJSON(presets): string {
      const exportData = {
        version: CURRENT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        presets: presets.map((p) => ({
          ...p,
          userId: undefined, // Remove user-specific data
        })),
      }
      return JSON.stringify(exportData, null, 2)
    },

    importFromJSON(json): MockupPreset[] {
      try {
        const data = JSON.parse(json)
        
        if (!data.presets || !Array.isArray(data.presets)) {
          throw new Error('Invalid import: presets array not found')
        }

        // Validate each preset
        const validated = data.presets.map((p: unknown) => {
          const preset = validatePreset(p)
          return migratePreset(preset)
        })

        return validated
      } catch (e) {
        throw new Error(`Import failed: ${(e as Error).message}`)
      }
    },

    // -------------------------------------------------------------------------
    // Cloud Sync
    // -------------------------------------------------------------------------

    async syncToCloud(): Promise<void> {
      if (!supabaseClient) {
        console.warn('Supabase client not configured')
        return
      }

      const presets = await this.list()
      
      for (const preset of presets) {
        const { error } = await supabaseClient
          .from('presets')
          .upsert({
            id: preset.id,
            user_id: userId,
            data: preset,
            updated_at: preset.updatedAt,
          })
        
        if (error) {
          console.error(`Failed to sync preset ${preset.id}:`, error)
        }
      }
    },

    async syncFromCloud(): Promise<void> {
      if (!supabaseClient) {
        console.warn('Supabase client not configured')
        return
      }

      const { data, error } = await supabaseClient
        .from('presets')
        .select('*')
      
      if (error) {
        throw new Error(`Sync failed: ${error.message}`)
      }

      if (!data) return

      for (const row of data) {
        const cloudPreset = (row as { data: MockupPreset }).data
        const localPreset = await db.presets.get(cloudPreset.id)

        // Only update if cloud version is newer
        if (!localPreset || new Date(cloudPreset.updatedAt) > new Date(localPreset.updatedAt)) {
          await db.presets.put({
            ...cloudPreset,
            userId,
          })
        }
      }
    },

    // -------------------------------------------------------------------------
    // Recent Presets
    // -------------------------------------------------------------------------

    async getRecent(): Promise<MockupPreset[]> {
      const recentIds = getRecentFromStorage()
      const presets: MockupPreset[] = []

      for (const id of recentIds) {
        const preset = await db.presets.get(id)
        if (preset && preset.userId === userId) {
          presets.push(migratePreset(validatePreset(preset)))
        }
      }

      return presets
    },

    async addToRecent(presetId): Promise<void> {
      const recent = getRecentFromStorage()
      const filtered = recent.filter((id) => id !== presetId)
      filtered.unshift(presetId)
      setRecentToStorage(filtered)
    },

    // -------------------------------------------------------------------------
    // Default Preset
    // -------------------------------------------------------------------------

    async getDefault(): Promise<MockupPreset | null> {
      const defaultPreset = await db.presets
        .where({ userId, isDefault: true })
        .first()
      
      return defaultPreset ? migratePreset(validatePreset(defaultPreset)) : null
    },

    async setDefault(id): Promise<void> {
      // Clear existing default
      const existing = await db.presets
        .where({ userId, isDefault: true })
        .first()
      
      if (existing) {
        await this.update(existing.id, { isDefault: false })
      }

      // Set new default
      await this.update(id, { isDefault: true })
    },
  }

  return manager
}

// ============================================================================
// Hook for React components
// ============================================================================

import { useCallback, useEffect, useState } from 'react'

export function usePresetManager(userId: string) {
  const [manager] = useState(() => createPresetManager(userId))
  const [presets, setPresets] = useState<MockupPreset[]>([])
  const [recentPresets, setRecentPresets] = useState<MockupPreset[]>([])
  const [defaultPreset, setDefaultPreset] = useState<MockupPreset | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const [all, recent, def] = await Promise.all([
      manager.list(),
      manager.getRecent(),
      manager.getDefault(),
    ])
    setPresets(all)
    setRecentPresets(recent)
    setDefaultPreset(def)
    setLoading(false)
  }, [manager])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    manager,
    presets,
    recentPresets,
    defaultPreset,
    loading,
    refresh,
  }
}
