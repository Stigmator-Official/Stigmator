"use client"

import React from "react"
import {
  RefreshCw,
  RotateCcw,
  ExternalLink,
  HelpCircle,
  ImageIcon,
  FileImage,
  Trash2,
  Minimize2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  MockupError,
  getErrorMessage,
  getRecoverySuggestion,
} from "@/lib/mockup/error-handler"

export interface RecoveryActionsProps {
  error: MockupError
  onRetry: () => void
  onReset: () => void
  onFallback: () => void
}

export function RecoveryActions({
  error,
  onRetry,
  onReset,
  onFallback,
}: RecoveryActionsProps): React.ReactNode {
  const isNetworkError =
    error.type === "MODEL_LOAD_FAILED" ||
    error.type === "TEXTURE_LOAD_FAILED" ||
    error.type === "UPLOAD_FAILED"

  const isMemoryError = error.type === "OUT_OF_MEMORY"
  const isWebGLError =
    error.type === "RENDER_FAILED" || error.type === "WEBGL_NOT_SUPPORTED"

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">{getErrorMessage(error)}</p>
        <p className="text-sm text-muted-foreground mb-4">
          {getRecoverySuggestion(error)}
        </p>

        <div className="flex flex-wrap gap-2">
          {/* Retry button for network/recoverable errors */}
          {error.recoverable && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onRetry}
              className="gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              {isNetworkError ? "Retry" : "Try Again"}
            </Button>
          )}

          {/* Reset button for memory errors */}
          {isMemoryError && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onReset}
              className="gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Scene
            </Button>
          )}

          {/* Fallback to Printful for WebGL errors */}
          {isWebGLError && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onFallback}
              className="gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Use Printful
            </Button>
          )}

          {/* Contact support for unknown errors */}
          {error.type === "UNKNOWN" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                window.open("https://support.stigmator.com", "_blank")
              }
              className="gap-1"
            >
              <HelpCircle className="w-4 h-4" />
              Contact Support
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

export interface ModelLoadErrorProps {
  url: string
  onRetry: () => void
  onSelectAlternative: () => void
}

export function ModelLoadError({
  url,
  onRetry,
  onSelectAlternative,
}: ModelLoadErrorProps): React.ReactNode {
  const fileName = url.split("/").pop() || "Unknown file"

  return (
    <div className="p-6 bg-destructive/5 rounded-lg border border-destructive/20">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-destructive/10 rounded-lg">
          <FileImage className="w-6 h-6 text-destructive" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-destructive">
              Failed to Load Model
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Could not load <code className="bg-muted px-1 rounded">{fileName}</code>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onRetry} className="gap-1">
              <RefreshCw className="w-4 h-4" />
              Retry Loading
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onSelectAlternative}
              className="gap-1"
            >
              <ImageIcon className="w-4 h-4" />
              Choose Different Model
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Common causes: Network issues, file not found, or unsupported format.
            Supported formats: GLB, GLTF, OBJ, FBX
          </p>
        </div>
      </div>
    </div>
  )
}

export interface ExportErrorProps {
  onRetry: () => void
  onReduceQuality: () => void
}

export function ExportError({
  onRetry,
  onReduceQuality,
}: ExportErrorProps): React.ReactNode {
  return (
    <div className="p-6 bg-destructive/5 rounded-lg border border-destructive/20">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-destructive/10 rounded-lg">
          <ImageIcon className="w-6 h-6 text-destructive" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-destructive">
              Export Failed
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              We couldn&apos;t export your mockup. This might be due to image size or memory constraints.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onRetry} className="gap-1">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReduceQuality}
              className="gap-1"
            >
              <Minimize2 className="w-4 h-4" />
              Reduce Quality & Retry
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Tips: Try exporting at a lower resolution, or close other browser tabs to free up memory.
          </p>
        </div>
      </div>
    </div>
  )
}

export interface MemoryErrorProps {
  onClearCache: () => void
  onReduceComplexity: () => void
  cacheSize?: number // in MB
}

export function MemoryError({
  onClearCache,
  onReduceComplexity,
  cacheSize,
}: MemoryErrorProps): React.ReactNode {
  return (
    <div className="p-6 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-yellow-500/10 rounded-lg">
          <AlertCircle className="w-6 h-6 text-yellow-500" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-yellow-600">
              Low Memory Warning
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your device is running low on available memory.
              {cacheSize !== undefined && (
                <span> Current cache: <strong>{cacheSize.toFixed(1)} MB</strong></span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={onClearCache}
              variant="secondary"
              className="gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cache
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReduceComplexity}
              className="gap-1"
            >
              <Minimize2 className="w-4 h-4" />
              Reduce Complexity
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Suggestions:</p>
            <ul className="list-disc list-inside">
              <li>Close other browser tabs</li>
              <li>Use a simpler 3D model</li>
              <li>Reduce texture resolution</li>
              <li>Try on a device with more RAM</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Utility component to show inline error with recovery
export function InlineError({
  error,
  onDismiss,
}: {
  error: MockupError
  onDismiss?: () => void
}): React.ReactNode {
  return (
    <Alert variant={error.recoverable ? "default" : "destructive"} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {error.recoverable ? "Warning" : "Error"}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {getErrorMessage(error)}
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="ml-2"
          >
            Dismiss
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

export default RecoveryActions
