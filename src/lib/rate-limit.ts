import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Check if Upstash is configured
const isConfigured = () => {
  return !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN
}

const getRedis = () => {
  if (!isConfigured()) return null
  return Redis.fromEnv()
}

// Fallback in-memory rate limiter for development
class MemoryRateLimit {
  private requests = new Map<string, { count: number; resetAt: number }>()
  private lastCleanup = Date.now()

  private cleanup() {
    const now = Date.now()
    // Run cleanup every 5 minutes
    if (now - this.lastCleanup < 300000) return
    this.lastCleanup = now
    for (const [key, entry] of this.requests.entries()) {
      if (entry.resetAt < now) {
        this.requests.delete(key)
      }
    }
  }

  async limit(identifier: string, maxRequests: number) {
    this.cleanup()
    const now = Date.now()
    const windowStart = Math.floor(now / 60000) * 60000 // 1 minute window
    const key = `${identifier}:${windowStart}`
    const current = this.requests.get(key)

    if (!current) {
      this.requests.set(key, { count: 1, resetAt: windowStart + 60000 })
      return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: windowStart + 60000 }
    }

    current.count++
    const success = current.count <= maxRequests
    return {
      success,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - current.count),
      reset: current.resetAt,
    }
  }
}

const memoryLimit = new MemoryRateLimit()

function createLimiter(requests: number, window: string, prefix: string) {
  const redis = getRedis()
  const limiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, window as any),
        prefix: `stigmator:${prefix}`,
        analytics: true,
      })
    : null

  return async (identifier: string) => {
    if (limiter) {
      return limiter.limit(identifier)
    }
    // Dev fallback: respect configured limit
    return memoryLimit.limit(`${prefix}:${identifier}`, requests)
  }
}

export const aiRateLimit = createLimiter(10, "1 h", "ai")
export const authRateLimit = createLimiter(5, "1 m", "auth")
export const webhookRateLimit = createLimiter(100, "1 m", "webhook")
export const adminRateLimit = createLimiter(30, "1 m", "admin")
export const generalRateLimit = createLimiter(60, "1 m", "general")
