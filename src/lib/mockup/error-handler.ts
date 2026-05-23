import * as Sentry from "@sentry/nextjs"

export type MockupErrorType =
  | "MODEL_LOAD_FAILED"
  | "TEXTURE_LOAD_FAILED"
  | "RENDER_FAILED"
  | "EXPORT_FAILED"
  | "UPLOAD_FAILED"
  | "WEBGL_NOT_SUPPORTED"
  | "OUT_OF_MEMORY"
  | "UNKNOWN"

export interface MockupError {
  type: MockupErrorType
  message: string
  originalError?: Error
  recoverable: boolean
  suggestedAction?: string
}

export interface ErrorHandlerConfig {
  onError?: (error: MockupError) => void
  onRecoverable?: (error: MockupError) => void
  enableSentry?: boolean
}

class MockupErrorHandler {
  private onError: ((error: MockupError) => void) | null = null
  private onRecoverable: ((error: MockupError) => void) | null = null
  private enableSentry: boolean = false
  private recoveryAttempts: Map<MockupErrorType, number> = new Map()
  private maxRecoveryAttempts: number = 3

  constructor(config?: ErrorHandlerConfig) {
    if (config?.onError) {
      this.onError = config.onError
    }
    if (config?.onRecoverable) {
      this.onRecoverable = config.onRecoverable
    }
    if (config?.enableSentry) {
      this.enableSentry = config.enableSentry
    }
  }

  private createError(
    type: MockupErrorType,
    message: string,
    originalError?: Error,
    recoverable: boolean = false,
    suggestedAction?: string
  ): MockupError {
    return {
      type,
      message,
      originalError,
      recoverable,
      suggestedAction,
    }
  }

  private notifyError(error: MockupError): void {
    this.onError?.(error)
    
    if (this.enableSentry) {
      Sentry.captureException(error.originalError || new Error(error.message), {
        extra: {
          errorType: error.type,
          recoverable: error.recoverable,
          suggestedAction: error.suggestedAction,
        },
      })
    }
  }

  // Handle Three.js errors
  handleThreeError(error: Error): MockupError {
    const message = error.message.toLowerCase()
    let mockupError: MockupError

    if (message.includes("texture")) {
      mockupError = this.createError(
        "TEXTURE_LOAD_FAILED",
        "Failed to load texture",
        error,
        true,
        "Try reloading the texture or use a different image format"
      )
    } else if (message.includes("geometry") || message.includes("model")) {
      mockupError = this.createError(
        "MODEL_LOAD_FAILED",
        "Failed to load 3D model",
        error,
        true,
        "Try reloading the model or use a different file format"
      )
    } else if (message.includes("webgl") || message.includes("context")) {
      mockupError = this.createError(
        "RENDER_FAILED",
        "WebGL rendering error",
        error,
        false,
        "Your browser may not support WebGL. Try using a different browser."
      )
    } else if (message.includes("memory") || message.includes("out of memory")) {
      mockupError = this.createError(
        "OUT_OF_MEMORY",
        "Out of memory",
        error,
        true,
        "Try closing other tabs or reducing model complexity"
      )
    } else {
      mockupError = this.createError(
        "UNKNOWN",
        "An unknown error occurred",
        error,
        false,
        "Please refresh the page and try again"
      )
    }

    this.notifyError(mockupError)
    return mockupError
  }

  // Handle WebGL context loss
  handleContextLoss(): MockupError {
    const error = this.createError(
      "RENDER_FAILED",
      "WebGL context lost",
      undefined,
      true,
      "The 3D context was lost. Attempting to restore..."
    )
    this.notifyError(error)
    return error
  }

  // Handle model load failure
  handleModelLoadError(url: string, originalError: Error): MockupError {
    const error = this.createError(
      "MODEL_LOAD_FAILED",
      `Failed to load model from ${url}`,
      originalError,
      true,
      "Check the file URL and try again, or use a different model file"
    )
    this.notifyError(error)
    return error
  }

  // Handle texture load failure
  handleTextureLoadError(url: string, originalError: Error): MockupError {
    const error = this.createError(
      "TEXTURE_LOAD_FAILED",
      `Failed to load texture from ${url}`,
      originalError,
      true,
      "Check the image URL and try again, or use a different image"
    )
    this.notifyError(error)
    return error
  }

  // Handle export failure
  handleExportError(originalError: Error): MockupError {
    const error = this.createError(
      "EXPORT_FAILED",
      "Failed to export mockup",
      originalError,
      true,
      "Try reducing image quality or using a different export format"
    )
    this.notifyError(error)
    return error
  }

  // Handle upload failure
  handleUploadError(originalError: Error): MockupError {
    const error = this.createError(
      "UPLOAD_FAILED",
      "Failed to upload file",
      originalError,
      true,
      "Check your internet connection and try again"
    )
    this.notifyError(error)
    return error
  }

  // Attempt recovery
  async attemptRecovery(error: MockupError): Promise<boolean> {
    if (!error.recoverable) {
      return false
    }

    const attempts = this.recoveryAttempts.get(error.type) || 0
    
    if (attempts >= this.maxRecoveryAttempts) {
      console.warn(`Max recovery attempts reached for ${error.type}`)
      return false
    }

    this.recoveryAttempts.set(error.type, attempts + 1)

    switch (error.type) {
      case "RENDER_FAILED":
        // Wait a moment and notify that we're trying to restore
        await new Promise((resolve) => setTimeout(resolve, 1000))
        this.onRecoverable?.(error)
        return true

      case "MODEL_LOAD_FAILED":
      case "TEXTURE_LOAD_FAILED":
        // Network errors might resolve on retry
        await new Promise((resolve) => setTimeout(resolve, 2000))
        this.onRecoverable?.(error)
        return true

      case "OUT_OF_MEMORY":
        // Suggest clearing cache or reducing complexity
        this.onRecoverable?.(error)
        return true

      default:
        return false
    }
  }

  // Reset recovery attempts for a specific error type
  resetRecoveryAttempts(type: MockupErrorType): void {
    this.recoveryAttempts.delete(type)
  }

  // Get current recovery attempts for an error type
  getRecoveryAttempts(type: MockupErrorType): number {
    return this.recoveryAttempts.get(type) || 0
  }
}

// Global error handler instance
let globalErrorHandler: MockupErrorHandler | null = null

export function initializeErrorHandler(config?: ErrorHandlerConfig): void {
  globalErrorHandler = new MockupErrorHandler(config)
}

export function getErrorHandler(): MockupErrorHandler {
  if (!globalErrorHandler) {
    globalErrorHandler = new MockupErrorHandler()
  }
  return globalErrorHandler
}

// Error logging
export function logError(error: MockupError, context?: Record<string, unknown>): void {
  console.error("[Mockup Error]", {
    type: error.type,
    message: error.message,
    recoverable: error.recoverable,
    suggestedAction: error.suggestedAction,
    context,
    originalError: error.originalError,
  })

  // Send to analytics if available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== "undefined" && (window as any).gtag) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gtag = (window as any).gtag
    gtag("event", "mockup_error", {
      event_category: "error",
      event_label: error.type,
      value: error.recoverable ? 1 : 0,
    })
  }
}

// User-friendly error messages
export function getErrorMessage(error: MockupError): string {
  const messages: Record<MockupErrorType, string> = {
    MODEL_LOAD_FAILED: "We couldn't load your 3D model. Please check the file and try again.",
    TEXTURE_LOAD_FAILED: "We couldn't load your texture image. Please try a different image.",
    RENDER_FAILED: "There was a problem displaying the 3D preview. Please refresh the page.",
    EXPORT_FAILED: "We couldn't export your mockup. Please try again with different settings.",
    UPLOAD_FAILED: "Upload failed. Please check your connection and try again.",
    WEBGL_NOT_SUPPORTED: "Your browser doesn't support 3D graphics. Try using Chrome, Firefox, or Edge.",
    OUT_OF_MEMORY: "Your device is running low on memory. Try closing other apps or tabs.",
    UNKNOWN: "Something unexpected happened. Please refresh and try again.",
  }

  return messages[error.type] || error.message
}

// Utility to check if an error is recoverable
export function isRecoverable(error: MockupError): boolean {
  return error.recoverable
}

// Utility to get recovery suggestion
export function getRecoverySuggestion(error: MockupError): string {
  return (
    error.suggestedAction ||
    "Try refreshing the page. If the problem persists, contact support."
  )
}

export { MockupErrorHandler }
export default MockupErrorHandler
