"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto-remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: "success", title, message })
  }, [addToast])

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: "error", title, message, duration: 8000 })
  }, [addToast])

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: "warning", title, message })
  }, [addToast])

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: "info", title, message })
  }, [addToast])

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast
  onRemove: (id: string) => void
}) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: "border-[#4ade80] bg-[#4ade80]/10",
    error: "border-[#dc2626] bg-[#dc2626]/10",
    warning: "border-[#fbbf24] bg-[#fbbf24]/10",
    info: "border-[#3b82f6] bg-[#3b82f6]/10",
  }

  const iconColors = {
    success: "text-[#4ade80]",
    error: "text-[#dc2626]",
    warning: "text-[#fbbf24]",
    info: "text-[#3b82f6]",
  }

  const Icon = icons[toast.type]

  return (
    <div
      className={`p-4 border-l-4 ${colors[toast.type]} bg-[#0a0f0a] shadow-lg animate-in slide-in-from-right`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 ${iconColors[toast.type]}`} />
        <div className="flex-1 min-w-0">
          <p className={`font-black text-sm ${iconColors[toast.type]}`}>
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-sm text-[#6b8e6b] mt-1">{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-[#6b8e6b] hover:text-[#e8f5e8] flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
