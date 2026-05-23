"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error("DropdownMenu components must be used within DropdownMenu")
  }
  return context
}

interface DropdownMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [isControlled, onOpenChange])
  
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ 
  children, 
  asChild 
}: { 
  children: React.ReactNode
  asChild?: boolean 
}) {
  const { open, setOpen } = useDropdownMenu()
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => setOpen(!open),
      "aria-expanded": open,
      "aria-haspopup": "menu",
    })
  }
  
  return (
    <button 
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-haspopup="menu"
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({ 
  children, 
  className,
  align = "center"
}: { 
  children: React.ReactNode
  className?: string
  align?: "start" | "center" | "end"
}) {
  const { open, setOpen } = useDropdownMenu()
  const ref = React.useRef<HTMLDivElement>(null)
  const menuId = React.useId()
  
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  // Handle escape key
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, setOpen])
  
  if (!open) return null
  
  const alignClass = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align]
  
  return (
    <div
      ref={ref}
      id={menuId}
      role="menu"
      className={cn(
        "absolute top-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border border-[#1a2e1a] bg-[#0a0f0a] p-1 shadow-md",
        "motion-reduce:transition-none",
        alignClass,
        className
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({ 
  children, 
  className,
  onClick,
  disabled
}: { 
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}) {
  const { setOpen } = useDropdownMenu()
  
  return (
    <button
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        onClick?.()
        setOpen(false)
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors motion-reduce:transition-none",
        "hover:bg-[#1a2e1a] text-[#e8f5e8]",
        "focus-visible:bg-[#1a2e1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-inset",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return (
    <div 
      role="separator" 
      className={cn("-mx-1 my-1 h-px bg-[#1a2e1a]", className)} 
    />
  )
}

export function DropdownMenuLabel({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div 
      className={cn("px-2 py-1.5 text-sm font-semibold text-[#6b8e6b]", className)}
      role="presentation"
    >
      {children}
    </div>
  )
}

export function DropdownMenuGroup({ 
  children 
}: { 
  children: React.ReactNode
}) {
  return <div role="group">{children}</div>
}
