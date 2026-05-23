/**
 * Global Types - Barrel Export
 * 
 * Shared types across the application.
 */

// Re-export from existing type files
export * from "./supabase"

// Common UI types
export interface NavItem {
  href: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: {
    message: string
    code?: string
  }
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}
