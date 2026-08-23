/**
 * In-memory rate limiter for the Telegram bot.
 * - Per user: max 20 messages per day
 * - Global: max 300 messages per day total (protects billing)
 * Resets every 24 hours automatically.
 */

import type { SupportedLanguage } from "./config.js";
import { getRateLimitUserMessage, getRateLimitGlobalMessage } from "./config.js";

const MAX_PER_USER_PER_DAY = 20;
const MAX_GLOBAL_PER_DAY = 300;

/** Telegram user IDs exempt from all rate limits */
export const OWNER_IDS = new Set<number>([7759567618]);

interface UserStats {
  count: number;
  resetAt: number;
}

const userCounts = new Map<number, UserStats>();
let globalCount = 0;
let globalResetAt = Date.now() + 24 * 60 * 60 * 1000;

function getDayReset(): number {
  return Date.now() + 24 * 60 * 60 * 1000;
}

function resetGlobalIfNeeded(): void {
  if (Date.now() >= globalResetAt) {
    globalCount = 0;
    globalResetAt = getDayReset();
  }
}

function resetUserIfNeeded(stats: UserStats): void {
  if (Date.now() >= stats.resetAt) {
    stats.count = 0;
    stats.resetAt = getDayReset();
  }
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "user_limit" | "global_limit"; resetAt: number };

export function checkRateLimit(userId: number): RateLimitResult {
  // Owner is never rate limited
  if (OWNER_IDS.has(userId)) return { allowed: true };

  resetGlobalIfNeeded();

  // Check global cap first
  if (globalCount >= MAX_GLOBAL_PER_DAY) {
    return { allowed: false, reason: "global_limit", resetAt: globalResetAt };
  }

  // Check per-user cap
  let stats = userCounts.get(userId);
  if (!stats) {
    stats = { count: 0, resetAt: getDayReset() };
    userCounts.set(userId, stats);
  }
  resetUserIfNeeded(stats);

  if (stats.count >= MAX_PER_USER_PER_DAY) {
    return { allowed: false, reason: "user_limit", resetAt: stats.resetAt };
  }

  // Allowed — increment counters
  stats.count++;
  globalCount++;
  return { allowed: true };
}

export function getStats(userId: number): { globalCount: number; globalResetAt: number; userCount: number } {
  resetGlobalIfNeeded();
  const stats = userCounts.get(userId);
  const userCount = stats ? (Date.now() < stats.resetAt ? stats.count : 0) : 0;
  return { globalCount, globalResetAt, userCount };
}

export function getRateLimitMessage(
  result: Extract<RateLimitResult, { allowed: false }>,
  language: SupportedLanguage = "en"
): string {
  const hoursLeft = Math.ceil((result.resetAt - Date.now()) / (60 * 60 * 1000));

  if (result.reason === "user_limit") {
    return getRateLimitUserMessage(hoursLeft, MAX_PER_USER_PER_DAY, language);
  }

  return getRateLimitGlobalMessage(hoursLeft, language);
}