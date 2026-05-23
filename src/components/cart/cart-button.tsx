"use client"

import { ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context"

export function CartButton() {
  const { cart, setIsOpen } = useCart()

  return (
    <button 
      onClick={() => setIsOpen(true)}
      className="relative p-2 text-[#6b8e6b] hover:text-[#e8f5e8] transition-colors"
    >
      <ShoppingBag className="h-5 w-5" />
      {cart.itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] text-white text-xs font-black flex items-center justify-center">
          {cart.itemCount > 9 ? "9+" : cart.itemCount}
        </span>
      )}
    </button>
  )
}
