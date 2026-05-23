/**
 * Demo Data Hook
 * 
 * React hook for accessing and managing demo data within components.
 */

import { useState, useEffect, useCallback } from "react"
import type { DemoData, UserRole, Design, Garment, Order, ProductionJob, RoleSpecificStats } from "./generator"
import { loadDemoData, saveDemoData, clearDemoData, getCurrentDemoUser } from "./generator"

export interface UseDemoDataReturn {
  // Data
  data: DemoData | null
  isLoading: boolean
  
  // User info
  userRole: UserRole | null
  userId: string | null
  userName: string | null
  
  // Role-specific data getters
  getDesigns: () => Design[]
  getGarments: () => Garment[]
  getOrders: () => Order[]
  getProductionJobs: () => ProductionJob[]
  getInkPortfolio: () => DemoData["inkPortfolio"]
  getGivenTattoos: () => DemoData["givenTattoos"]
  getStats: () => RoleSpecificStats | null
  
  // Actions
  addDesign: (design: Design) => void
  updateGarment: (id: string, updates: Partial<Garment>) => void
  refreshData: () => void
  logout: () => void
}

export function useDemoData(): UseDemoDataReturn {
  const [data, setData] = useState<DemoData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      const demoData = loadDemoData()
      setData(demoData)
      setIsLoading(false)
    }
    
    loadData()
    
    // Listen for storage changes (for multi-tab sync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "stigmator_demo_data") {
        loadData()
      }
    }
    
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // Get current user info
  const demoUser = getCurrentDemoUser()
  const userRole = demoUser?.role || null
  const userId = demoUser?.id || null
  const userName = demoUser?.name || null

  // Data getters
  const getDesigns = useCallback(() => data?.designs || [], [data])
  const getGarments = useCallback(() => data?.garments || [], [data])
  const getOrders = useCallback(() => data?.orders || [], [data])
  const getProductionJobs = useCallback(() => data?.productionJobs || [], [data])
  const getInkPortfolio = useCallback(() => data?.inkPortfolio || [], [data])
  const getGivenTattoos = useCallback(() => data?.givenTattoos || [], [data])
  const getStats = useCallback(() => data?.stats || null, [data])

  // Actions
  const addDesign = useCallback((design: Design) => {
    if (!data) return
    
    const newData: DemoData = {
      ...data,
      designs: [design, ...data.designs]
    }
    
    // Update stats
    if ("designCount" in newData.stats) {
      newData.stats = {
        ...newData.stats,
        designCount: (newData.stats as { designCount: number }).designCount + 1
      }
    }
    
    setData(newData)
    saveDemoData(newData)
  }, [data])

  const updateGarment = useCallback((id: string, updates: Partial<Garment>) => {
    if (!data) return
    
    const newData: DemoData = {
      ...data,
      garments: data.garments.map(g => 
        g.id === id ? { ...g, ...updates } : g
      )
    }
    
    setData(newData)
    saveDemoData(newData)
  }, [data])

  const refreshData = useCallback(() => {
    setIsLoading(true)
    const demoData = loadDemoData()
    setData(demoData)
    setIsLoading(false)
  }, [])

  const logout = useCallback(() => {
    clearDemoData()
    setData(null)
  }, [])

  return {
    data,
    isLoading,
    userRole,
    userId,
    userName,
    getDesigns,
    getGarments,
    getOrders,
    getProductionJobs,
    getInkPortfolio,
    getGivenTattoos,
    getStats,
    addDesign,
    updateGarment,
    refreshData,
    logout
  }
}

export default useDemoData
