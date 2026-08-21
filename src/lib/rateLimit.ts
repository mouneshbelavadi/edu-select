// In-memory sliding window rate limiter
// Trade-off: Resets on server restart and doesn't share state across multiple horizontal instances.
// In production, would use Upstash Redis / Redis rate limiter.

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 10 * 60 * 1000 // 10 minutes
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = ipStore.get(ip);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = { count: 1, resetTime: now + windowMs };
    ipStore.set(ip, newRecord);
    return { success: true, limit, remaining: limit - 1, reset: newRecord.resetTime };
  }

  if (record.count >= limit) {
    return { success: false, limit, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { success: true, limit, remaining: limit - record.count, reset: record.resetTime };
}
