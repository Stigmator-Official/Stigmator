"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

function useSelect() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within Select")
  }
  return context
}

export function Select({ 
  children, 
  value, 
  onValueChange 
}: { 
  children: React.ReactNode
  value: string
  onValueChange: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string
}) {
  const { open, setOpen } = useSelect()
  return (
    <button
      onClick={() => setOpen(!open)}
      className={cn(
        "flex w-full items-center justify-between rounded-md border border-[#1a2e1a] bg-[#0a0f0a] px-3 py-2 text-sm text-[#e8f5e8] placeholder:text-[#6b8e6b] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 focus:ring-offset-[#0a0f0a]",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useSelect()
  return <span>{value || placeholder}</span>
}

export function SelectContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string
}) {
  const { open, setOpen } = useSelect()
  const ref = React.useRef<HTMLDivElement>(null)
  
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
  
  if (!open) return null
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-[#1a2e1a] bg-[#0a0f0a] p-1 shadow-md",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SelectItem({ 
  children, 
  value,
  className
}: { 
  children: React.ReactNode
  value: string
  className?: string
}) {
  const { value: selectedValue, onValueChange, setOpen } = useSelect()
  const isSelected = selectedValue === value
  
  return (
    <button
      onClick={() => {
        onValueChange(value)
        setOpen(false)
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-[#1a2e1a] text-[#e8f5e8]",
        isSelected && "bg-[#22c55e]/20 text-[#22c55e]",
        className
      )}
    >
      {children}
    </button>
  )
}
