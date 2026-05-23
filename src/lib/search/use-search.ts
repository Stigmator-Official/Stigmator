"use client"

import { useState, useCallback, useMemo } from "react"
import { useDebounce } from "@/lib/hooks/use-debounce"

export interface SearchableItem {
  id: string
  name?: string
  description?: string
  tags?: string[]
  artist?: string
  category?: string
  [key: string]: any // Allow additional fields for flexible searching
}

export function useSearch<T extends SearchableItem>(items: T[], delay = 300) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  
  const debouncedQuery = useDebounce(query, delay)

  const results = useMemo(() => {
    let filtered = items

    // Text search
    if (debouncedQuery.trim()) {
      const searchTerms = debouncedQuery.toLowerCase().split(" ")
      
      filtered = filtered.filter((item) => {
        const searchableText = [
          item.name,
          item.description,
          item.artist,
          item.category,
          ...(item.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        return searchTerms.every((term) => searchableText.includes(term))
      })
    }

    // Apply filters
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter((item) => {
          const itemValue = (item as Record<string, unknown>)[key]
          return values.includes(String(itemValue))
        })
      }
    })

    return filtered
  }, [items, debouncedQuery, filters])

  const addFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), value],
    }))
  }, [])

  const removeFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((v) => v !== value),
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setQuery("")
  }, [])

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters: Object.keys(filters).length > 0 || query.length > 0,
  }
}

// Fuzzy search implementation
export function useFuzzySearch<T extends SearchableItem>(items: T[], delay = 300) {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, delay)

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return items

    const searchTerm = debouncedQuery.toLowerCase()
    
    return items
      .map((item) => {
        const nameScore = item.name ? fuzzyMatch(searchTerm, item.name.toLowerCase()) : 0
        const descScore = item.description 
          ? fuzzyMatch(searchTerm, item.description.toLowerCase()) * 0.5
          : 0
        const tagScore = item.tags
          ? Math.max(...item.tags.map((t) => fuzzyMatch(searchTerm, t.toLowerCase()))) * 0.8
          : 0
        
        const score = Math.max(nameScore, descScore, tagScore)
        return { item, score }
      })
      .filter(({ score }) => score > 0.3)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
  }, [items, debouncedQuery])

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
  }
}

// Simple fuzzy matching algorithm
function fuzzyMatch(pattern: string, str: string): number {
  const patternLen = pattern.length
  const strLen = str.length
  
  if (patternLen === 0) return 1
  if (strLen === 0) return 0
  
  // Check for exact match
  if (str.includes(pattern)) {
    return patternLen / strLen + 0.5 // Boost for exact substring
  }
  
  // Fuzzy match
  let patternIdx = 0
  let strIdx = 0
  let matches = 0
  
  while (patternIdx < patternLen && strIdx < strLen) {
    if (pattern[patternIdx] === str[strIdx]) {
      matches++
      patternIdx++
    }
    strIdx++
  }
  
  return matches / patternLen
}
