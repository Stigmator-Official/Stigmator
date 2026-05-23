"use client"

import { Component, ErrorInfo, ReactNode } from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
    this.setState({ error, errorInfo })
    
    // In production, you would send to error tracking service
    // logErrorToService(error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload()
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center px-4 texture-grain">
          <div className="max-w-lg w-full text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-[#dc2626]/10 border-2 border-[#dc2626] flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-10 w-10 text-[#dc2626]" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-[#e8f5e8] mb-2">
                SOMETHING WENT WRONG
              </h1>
              <p className="text-[#6b8e6b]">
                We&apos;ve encountered an unexpected error.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 p-4 bg-[#050805] border border-[#dc2626] text-left overflow-auto">
                <p className="text-[#dc2626] font-mono text-sm mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-[#6b8e6b] text-xs overflow-x-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRefresh}
                className="bg-[#4ade80] hover:bg-[#3ec46e] text-[#080a08] font-black rounded-none h-12"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                REFRESH PAGE
              </Button>
              
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none h-12"
                >
                  <Home className="h-5 w-5 mr-2" />
                  GO HOME
                </Button>
              </Link>
            </div>

            <button
              onClick={this.handleReset}
              className="mt-4 text-sm text-[#6b8e6b] hover:text-[#4ade80] underline"
            >
              Try to recover
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
import { useState, useCallback } from "react"

export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null)

  const handleError = useCallback((err: unknown) => {
    const error = err instanceof Error ? err : new Error(String(err))
    setError(error)
    console.error("Handled error:", error)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}

// Error fallback component for specific sections
export function SectionErrorFallback({ 
  error, 
  retry 
}: { 
  error: Error 
  retry?: () => void 
}) {
  return (
    <div className="p-6 bg-[#dc2626]/5 border border-[#dc2626] text-center">
      <AlertCircle className="h-8 w-8 text-[#dc2626] mx-auto mb-2" />
      <p className="text-[#e8f5e8] font-black mb-1">FAILED TO LOAD</p>
      <p className="text-sm text-[#6b8e6b] mb-4">{error.message}</p>
      {retry && (
        <Button
          onClick={retry}
          variant="outline"
          className="border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10 rounded-none"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          RETRY
        </Button>
      )}
    </div>
  )
}
