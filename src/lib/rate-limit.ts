/**
 * In-memory rate limiter for AI tutor
 * Prevents abuse and manages Groq free tier quota
 *
 * Limits:
 * - Pro users: 50 explanations/day
 *
 * Note: In-memory, resets on server restart.
 * For production at scale, use Redis or Supabase.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(userId: string, maxRequests = 50): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  const midnightUTC = tomorrow.getTime();

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: midnightUTC });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count += 1;
  return true;
}

export function getRemainingRequests(userId: string, maxRequests = 50): number {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  if (!userLimit || now > userLimit.resetAt) return maxRequests;
  return Math.max(0, maxRequests - userLimit.count);
}
