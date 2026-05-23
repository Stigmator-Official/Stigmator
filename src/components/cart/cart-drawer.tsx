"use client"

import { useEffect, useRef } from "react"
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { OptimizedImage } from "@/components/ui/optimized-image"

export function CartDrawer() {
  const { cart, isOpen, setIsOpen, removeItem, updateQuantity, updateSize, updateColor } = useCart()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return

    // Focus the close button when opened
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
      
      // Focus trap
      if (e.key === "Tab") {
        const focusableElements = drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    
    // Prevent body scroll when drawer is open
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  const platformFee = Math.round(cart.subtotal * 0.15)
  const shipping = cart.itemCount > 0 ? 800 : 0 // $8.00 flat rate
  const total = cart.subtotal + platformFee + shipping

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9998] motion-reduce:transition-none"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0f0a] border-l border-[#1a2e1a] z-[9999] flex flex-col motion-reduce:transition-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1a2e1a]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#4ade80]" aria-hidden="true" />
            <h2 id="cart-title" className="font-black tracking-tighter text-[#e8f5e8]">
              YOUR BAG ({cart.itemCount})
            </h2>
          </div>
          <button 
            ref={closeButtonRef}
            onClick={() => setIsOpen(false)}
            className="p-2 text-[#6b8e6b] hover:text-[#e8f5e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f0a] rounded"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-[#1a2e1a] mx-auto mb-4" aria-hidden="true" />
              <p className="text-[#6b8e6b] font-mono text-sm">YOUR BAG IS EMPTY</p>
              <Link href="/shop" onClick={() => setIsOpen(false)}>
                <Button className="mt-4 bg-[#4ade80] hover:bg-[#3ec46e] text-[#080a08] font-black rounded-none">
                  BROWSE FLASH
                </Button>
              </Link>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.id} className="p-3 bg-[#050805] border border-[#1a2e1a]">
                <div className="flex gap-3">
                  {/* Image */}
                  <div className="w-20 h-20 bg-[#1a2e1a] flex-shrink-0 overflow-hidden relative">
                    <OptimizedImage
                      src={item.mockup_image}
                      alt={item.design_title}
                      fill
                      className="object-cover"
                      transform={{ width: 80, height: 80, resize: "cover" }}
                      sizes="80px"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-[#e8f5e8] text-sm truncate">
                      {item.design_title}
                    </h3>
                    <p className="text-xs text-[#6b8e6b]">{item.product_name}</p>
                    <p className="text-xs text-[#4ade80]">by {item.artist_name}</p>
                    
                    {/* Size/Color Selectors */}
                    <div className="flex gap-2 mt-2">
                      <label htmlFor={`size-${item.id}`} className="sr-only">Size</label>
                      <select
                        id={`size-${item.id}`}
                        value={item.size}
                        onChange={(e) => updateSize(item.id, e.target.value)}
                        className="bg-[#1a2e1a] text-[#e8f5e8] text-xs px-2 py-1 border border-[#2a3e2a] rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80]"
                        aria-label="Select size"
                      >
                        {["XS", "S", "M", "L", "XL", "XXL"].map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                      <label htmlFor={`color-${item.id}`} className="sr-only">Color</label>
                      <select
                        id={`color-${item.id}`}
                        value={item.color}
                        onChange={(e) => updateColor(item.id, e.target.value)}
                        className="bg-[#1a2e1a] text-[#e8f5e8] text-xs px-2 py-1 border border-[#2a3e2a] rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80]"
                        aria-label="Select color"
                      >
                        {["Black", "White", "Natural"].map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Price & Remove */}
                  <div className="text-right">
                    <p className="font-black text-[#e8f5e8]">${(item.total_price / 100).toFixed(2)}</p>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-1 mt-2 text-[#dc2626] hover:bg-[#dc2626]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] rounded"
                      aria-label={`Remove ${item.design_title} from cart`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                
                {/* Quantity */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1a2e1a]">
                  <span className="text-xs text-[#6b8e6b]">QTY</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-[#6b8e6b] hover:text-[#e8f5e8] border border-[#1a2e1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80]"
                      aria-label="Decrease quantity"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <span className="w-8 text-center font-black text-[#e8f5e8]" aria-live="polite" aria-atomic="true">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-[#6b8e6b] hover:text-[#e8f5e8] border border-[#1a2e1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80]"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t border-[#1a2e1a] p-4 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#6b8e6b]">
                <span>Subtotal</span>
                <span className="text-[#e8f5e8]">${(cart.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#6b8e6b]">
                <span>Platform Fee (15%)</span>
                <span className="text-[#f97316]">${(platformFee / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#6b8e6b]">
                <span>Shipping</span>
                <span className="text-[#e8f5e8]">${(shipping / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#1a2e1a]">
                <span className="font-black text-[#e8f5e8]">TOTAL</span>
                <span className="font-black text-[#4ade80] text-xl" aria-live="polite">${(total / 100).toFixed(2)}</span>
              </div>
            </div>
            
            <Link href="/checkout" onClick={() => setIsOpen(false)}>
              <Button className="w-full h-14 bg-[#4ade80] hover:bg-[#3ec46e] text-[#080a08] font-black rounded-none">
                CHECKOUT
                <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
              </Button>
            </Link>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm text-[#6b8e6b] hover:text-[#e8f5e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f0a] rounded py-2"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
