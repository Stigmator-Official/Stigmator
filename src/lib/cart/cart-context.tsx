"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import { useToast } from "@/components/toast/toast-context"
import { logger } from "@/lib/logger"

export type CartItem = {
  id: string
  product_design_id: string
  design_title: string
  product_name: string
  artist_name: string
  artist_id: string
  mockup_image: string
  size: string
  color: string
  quantity: number
  unit_price: number // in cents
  total_price: number // in cents
}

export type Cart = {
  items: CartItem[]
  subtotal: number
  itemCount: number
}

const CART_STORAGE_KEY = "stigmator_cart"

interface CartContextType {
  cart: Cart
  addItem: (item: Omit<CartItem, "id" | "total_price">, options?: { silent?: boolean }) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateSize: (itemId: string, size: string) => void
  updateColor: (itemId: string, color: string) => void
  clearCart: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function calculateCart(items: CartItem[]): Cart {
  return {
    items,
    subtotal: items.reduce((sum, item) => sum + item.total_price, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, itemCount: 0 })
  const [isOpen, setIsOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { success } = useToast()

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      if (saved) {
        const items: CartItem[] = JSON.parse(saved)
        setCart(calculateCart(items))
      }
    } catch (e) {
      logger.error("Error loading cart:", e)
    }
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage on change
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return
    
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items))
    } catch (e) {
      logger.error("Error saving cart:", e)
    }
  }, [cart.items, isInitialized])

  const generateItemId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const addItem = useCallback((newItem: Omit<CartItem, "id" | "total_price">, options?: { silent?: boolean }) => {
    setCart(prev => {
      // Check if same product_design with same options exists
      const existingIndex = prev.items.findIndex(
        item => 
          item.product_design_id === newItem.product_design_id &&
          item.size === newItem.size &&
          item.color === newItem.color
      )

      let newItems: CartItem[]
      let message = ""

      if (existingIndex >= 0) {
        // Update quantity of existing item
        newItems = [...prev.items]
        const existing = newItems[existingIndex]
        const newQuantity = existing.quantity + newItem.quantity
        newItems[existingIndex] = {
          ...existing,
          quantity: newQuantity,
          total_price: newQuantity * existing.unit_price,
        }
        message = `Updated quantity of ${newItem.design_title}`
      } else {
        // Add new item
        const item: CartItem = {
          ...newItem,
          id: generateItemId(),
          total_price: newItem.quantity * newItem.unit_price,
        }
        newItems = [...prev.items, item]
        message = `${newItem.design_title} added to cart`
      }

      if (!options?.silent) {
        success("Added to bag", message)
      }

      return calculateCart(newItems)
    })
    setIsOpen(true)
  }, [success])

  const removeItem = useCallback((itemId: string) => {
    setCart(prev => {
      const newItems = prev.items.filter(item => item.id !== itemId)
      return calculateCart(newItems)
    })
  }, [])

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) return
    
    setCart(prev => {
      const newItems = prev.items.map(item =>
        item.id === itemId
          ? { ...item, quantity, total_price: quantity * item.unit_price }
          : item
      )
      return calculateCart(newItems)
    })
  }, [])

  const updateSize = useCallback((itemId: string, size: string) => {
    setCart(prev => {
      // Check if item with same size/color already exists
      const itemToUpdate = prev.items.find(item => item.id === itemId)
      if (!itemToUpdate) return prev

      const duplicateIndex = prev.items.findIndex(
        item => 
          item.id !== itemId &&
          item.product_design_id === itemToUpdate.product_design_id &&
          item.size === size &&
          item.color === itemToUpdate.color
      )

      if (duplicateIndex >= 0) {
        // Merge with existing
        const newItems = prev.items.filter(item => item.id !== itemId)
        const duplicate = newItems[duplicateIndex]
        newItems[duplicateIndex] = {
          ...duplicate,
          quantity: duplicate.quantity + itemToUpdate.quantity,
          total_price: (duplicate.quantity + itemToUpdate.quantity) * duplicate.unit_price,
        }
        return calculateCart(newItems)
      }

      const newItems = prev.items.map(item =>
        item.id === itemId ? { ...item, size } : item
      )
      return calculateCart(newItems)
    })
  }, [])

  const updateColor = useCallback((itemId: string, color: string) => {
    setCart(prev => {
      // Check if item with same size/color already exists
      const itemToUpdate = prev.items.find(item => item.id === itemId)
      if (!itemToUpdate) return prev

      const duplicateIndex = prev.items.findIndex(
        item => 
          item.id !== itemId &&
          item.product_design_id === itemToUpdate.product_design_id &&
          item.size === itemToUpdate.size &&
          item.color === color
      )

      if (duplicateIndex >= 0) {
        // Merge with existing
        const newItems = prev.items.filter(item => item.id !== itemId)
        const duplicate = newItems[duplicateIndex]
        newItems[duplicateIndex] = {
          ...duplicate,
          quantity: duplicate.quantity + itemToUpdate.quantity,
          total_price: (duplicate.quantity + itemToUpdate.quantity) * duplicate.unit_price,
        }
        return calculateCart(newItems)
      }

      const newItems = prev.items.map(item =>
        item.id === itemId ? { ...item, color } : item
      )
      return calculateCart(newItems)
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart({ items: [], subtotal: 0, itemCount: 0 })
  }, [])

  const value: CartContextType = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    updateSize,
    updateColor,
    clearCart,
    isOpen,
    setIsOpen,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
