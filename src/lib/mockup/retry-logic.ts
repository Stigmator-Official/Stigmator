export interface RetryConfig {
  maxAttempts: number // default: 3
  baseDelay: number // ms, default: 1000
  maxDelay: number // ms, default: 10000
  backoffMultiplier: number // default: 2
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
}

export class RetryExhaustedError extends Error {
  constructor(
    message: string,
    public readonly lastError: Error,
    public readonly attempts: number
  ) {
    super(message)
    this.name = "RetryExhaustedError"
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function calculateDelay(
  attempt: number,
  config: RetryConfig,
  useJitter: boolean = true
): number {
  // Exponential backoff: baseDelay * (multiplier ^ attempt)
  let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt)
  
  // Cap at maxDelay
  delay = Math.min(delay, config.maxDelay)
  
  // Add jitter to prevent thundering herd (±25%)
  if (useJitter) {
    const jitter = delay * 0.25 * (Math.random() * 2 - 1)
    delay += jitter
  }
  
  return Math.round(delay)
}

// Retry wrapper for async functions
export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  let lastError: Error | null = null

  for (let attempt = 0; attempt < finalConfig.maxAttempts; attempt++) {
    try {
      const result = await fn()
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on the last attempt
      if (attempt === finalConfig.maxAttempts - 1) {
        break
      }

      const delay = calculateDelay(attempt, finalConfig)
      console.warn(
        `Attempt ${attempt + 1}/${finalConfig.maxAttempts} failed. Retrying in ${delay}ms...`,
        lastError.message
      )
      
      await sleep(delay)
    }
  }

  throw new RetryExhaustedError(
    `Failed after ${finalConfig.maxAttempts} attempts`,
    lastError!,
    finalConfig.maxAttempts
  )
}

// Retry with specific error types to catch
export async function withRetryOnErrors<T>(
  fn: () => Promise<T>,
  retryableErrors: string[],
  config?: Partial<RetryConfig>
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  let lastError: Error | null = null

  for (let attempt = 0; attempt < finalConfig.maxAttempts; attempt++) {
    try {
      const result = await fn()
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if this error type should be retried
      const shouldRetry = retryableErrors.some(
        (errorType) =>
          lastError!.name === errorType ||
          lastError!.message.includes(errorType)
      )

      if (!shouldRetry || attempt === finalConfig.maxAttempts - 1) {
        break
      }

      const delay = calculateDelay(attempt, finalConfig)
      console.warn(
        `Retryable error on attempt ${attempt + 1}/${finalConfig.maxAttempts}. Retrying in ${delay}ms...`,
        lastError.message
      )
      
      await sleep(delay)
    }
  }

  throw new RetryExhaustedError(
    `Failed after ${finalConfig.maxAttempts} attempts`,
    lastError!,
    finalConfig.maxAttempts
  )
}

// Circuit breaker states
type CircuitState = "closed" | "open" | "half-open"

export interface CircuitBreakerConfig {
  failureThreshold: number // Number of failures before opening
  resetTimeout: number // Time in ms before attempting reset
  halfOpenMaxCalls: number // Max calls allowed in half-open state
}

const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  halfOpenMaxCalls: 3,
}

export class CircuitBreaker {
  private state: CircuitState = "closed"
  private failureCount: number = 0
  private successCount: number = 0
  private lastFailureTime: number = 0
  private halfOpenCalls: number = 0
  private config: CircuitBreakerConfig

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = { ...DEFAULT_CIRCUIT_CONFIG, ...config }
  }

  private get now(): number {
    return Date.now()
  }

  private shouldAttemptReset(): boolean {
    return this.now - this.lastFailureTime >= this.config.resetTimeout
  }

  private transitionTo(newState: CircuitState): void {
    console.log(`Circuit breaker transitioning from ${this.state} to ${newState}`)
    this.state = newState

    if (newState === "closed") {
      this.failureCount = 0
      this.successCount = 0
      this.halfOpenCalls = 0
    } else if (newState === "half-open") {
      this.halfOpenCalls = 0
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if we should transition from open to half-open
    if (this.state === "open" && this.shouldAttemptReset()) {
      this.transitionTo("half-open")
    }

    // If open, reject immediately
    if (this.state === "open") {
      const timeUntilRetry = Math.ceil(
        (this.config.resetTimeout - (this.now - this.lastFailureTime)) / 1000
      )
      throw new Error(
        `Circuit breaker is OPEN. Try again in ${timeUntilRetry} seconds.`
      )
    }

    // If half-open, limit concurrent calls
    if (this.state === "half-open") {
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        throw new Error("Circuit breaker is HALF-OPEN. Too many pending requests.")
      }
      this.halfOpenCalls++
    }

    try {
      const result = await fn()
      this.recordSuccess()
      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }

  recordSuccess(): void {
    if (this.state === "half-open") {
      this.successCount++
      // If we've had enough successes in half-open, close the circuit
      if (this.successCount >= this.config.halfOpenMaxCalls) {
        this.transitionTo("closed")
      }
    } else {
      this.failureCount = Math.max(0, this.failureCount - 1)
    }
  }

  recordFailure(): void {
    this.failureCount++
    this.lastFailureTime = this.now

    if (this.state === "half-open") {
      // Any failure in half-open goes back to open
      this.transitionTo("open")
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo("open")
    }
  }

  getState(): CircuitState {
    // Check if we should transition before returning state
    if (this.state === "open" && this.shouldAttemptReset()) {
      return "half-open"
    }
    return this.state
  }

  getStats(): {
    state: CircuitState
    failureCount: number
    successCount: number
    lastFailureTime: number
  } {
    return {
      state: this.getState(),
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    }
  }

  reset(): void {
    this.transitionTo("closed")
  }
}

// Utility to create a debounced retry function
export function createDebouncedRetry<T>(
  fn: () => Promise<T>,
  debounceMs: number = 500,
  config?: Partial<RetryConfig>
): () => Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let pendingPromise: Promise<T> | null = null

  return () => {
    if (pendingPromise) {
      return pendingPromise
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    pendingPromise = new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        withRetry(fn, config)
          .then(resolve)
          .catch(reject)
          .finally(() => {
            pendingPromise = null
            timeoutId = null
          })
      }, debounceMs)
    })

    return pendingPromise
  }
}

// Batch retry - retry multiple operations with individual and collective limits
export async function withBatchRetry<T>(
  operations: Array<() => Promise<T>>,
  config?: Partial<RetryConfig> & { continueOnError?: boolean }
): Promise<{ results: T[]; errors: Error[] }> {
  const results: T[] = []
  const errors: Error[] = []
  const continueOnError = config?.continueOnError ?? false

  for (const [index, operation] of operations.entries()) {
    try {
      const result = await withRetry(operation, config)
      results.push(result)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      errors.push(err)
      console.error(`Operation ${index} failed:`, err.message)
      
      if (!continueOnError) {
        break
      }
    }
  }

  return { results, errors }
}

export default {
  withRetry,
  withRetryOnErrors,
  CircuitBreaker,
  createDebouncedRetry,
  withBatchRetry,
  RetryExhaustedError,
}
