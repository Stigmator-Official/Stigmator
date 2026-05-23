"use client"

import React from "react"
import { AlertCircle, RefreshCw, Bug, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export interface MockupErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onReset?: () => void
}

export interface MockupErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class MockupErrorBoundary extends React.Component<
  MockupErrorBoundaryProps,
  MockupErrorBoundaryState
> {
  constructor(props: MockupErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): MockupErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Mockup Error Boundary caught an error:", error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.reset}
        />
      )
    }

    return this.props.children
  }
}

export function DefaultErrorFallback({
  error,
  onReset,
}: {
  error: Error
  onReset: () => void
}): React.ReactNode {
  const handleReportIssue = () => {
    const errorDetails = encodeURIComponent(
      `Error: ${error.message}\nStack: ${error.stack}`
    )
    window.open(
      `https://github.com/your-org/stigmator/issues/new?title=3D%20Viewer%20Crash&body=${errorDetails}`,
      "_blank"
    )
  }

  const handleUsePrintful = () => {
    window.open("https://www.printful.com/mockup-generator", "_blank")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-destructive/5 rounded-lg border border-destructive/20">
      <div className="flex flex-col items-center max-w-md text-center space-y-6">
        {/* Error Icon */}
        <div className="p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-destructive">
            Something went wrong with the 3D viewer
          </h2>
          <p className="text-sm text-muted-foreground">
            We&apos;ve encountered an unexpected error while rendering your mockup.
          </p>
        </div>

        {/* Technical Details (Collapsible) */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground">
              <span className="flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Technical Details
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-3 bg-destructive/5 rounded-md text-left">
                <p className="text-xs font-mono text-destructive break-all">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            onClick={onReset}
            className="flex-1"
            variant="default"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button
            onClick={handleReportIssue}
            className="flex-1"
            variant="outline"
          >
            <Bug className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        </div>

        {/* Alternative Option */}
        <div className="pt-4 border-t border-border w-full">
          <Button
            onClick={handleUsePrintful}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Use Printful mockup instead
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MockupErrorBoundary
