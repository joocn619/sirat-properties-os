/**
 * Simple in-memory rate limiter for API routes.
 * For production at scale, switch to Redis (Upstash) or Vercel KV.
 */

const store = new Map<string, { count: number; resetAt: number }>()

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, val] of store) {
      if (now > val.resetAt) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  identifier: string,
  { max = 10, windowMs = 60_000 }: { max?: number; windowMs?: number } = {},
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: max - 1, resetAt: now + windowMs }
  }

  entry.count++

  if (entry.count > max) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { success: true, remaining: max - entry.count, resetAt: entry.resetAt }
}
