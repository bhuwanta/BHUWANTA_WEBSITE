import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Redis client — falls back gracefully if not configured
export const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// Rate limiter for contact form: 5 requests per 60 seconds
export const contactRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: 'ratelimit:contact',
    })
  : null

// Cache helpers
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  if (!redis) return fetcher()

  try {
    const cached = await redis.get<T>(key)
    if (cached) return cached

    const data = await fetcher()
    await redis.set(key, JSON.stringify(data), { ex: ttlSeconds })
    return data
  } catch {
    return fetcher()
  }
}
