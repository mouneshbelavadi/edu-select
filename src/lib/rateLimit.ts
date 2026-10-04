interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipRecords = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 10 * 60 * 1000
): { allowed: boolean; success: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const record = ipRecords.get(key);

  // Clean expired
  if (!record || now > record.resetAt) {
    ipRecords.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      success: true,
      remaining: limit - 1,
      resetInSec: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    const resetInSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      success: false,
      remaining: 0,
      resetInSec,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const resetInSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  return {
    allowed: true,
    success: true,
    remaining,
    resetInSec,
  };
}
