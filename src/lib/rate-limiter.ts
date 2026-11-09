interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, RateLimitBucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetTime: number;
}

/**
 * Enterprise token bucket / sliding window rate limiter.
 * Guards API gateway against brute force and Denial of Service.
 */
export function checkRateLimit(
  key: string,
  maxRequests = 60,
  windowMs = 60000
): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || now - bucket.lastRefill >= windowMs) {
    bucket = { tokens: maxRequests - 1, lastRefill: now };
    buckets.set(key, bucket);
    return {
      allowed: true,
      remaining: bucket.tokens,
      retryAfterSeconds: 0,
      resetTime: now + windowMs,
    };
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remaining: bucket.tokens,
      retryAfterSeconds: 0,
      resetTime: bucket.lastRefill + windowMs,
    };
  }

  const retryAfterMs = Math.max(0, bucket.lastRefill + windowMs - now);
  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    resetTime: bucket.lastRefill + windowMs,
  };
}

/**
 * Resets the in-memory buckets (useful for tests and maintenance).
 */
export function resetRateLimits(): void {
  buckets.clear();
}
