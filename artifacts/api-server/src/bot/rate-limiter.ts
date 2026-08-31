/**
 * In-memory rate limiter for the Telegram bot.
 * - Per user: max 15 messages per 35 hours
 * - Global: max 1500 messages per day total (protects against a single-day cost spike)
 * - Flood protection: minimum 2 seconds between messages per user
 */

import type { SupportedLanguage } from "./config.js";
import { getRateLimitUserMessage, getRateLimitGlobalMessage } from "./config.js";

export const MAX_PER_USER_PER_WINDOW = 15;
export const MAX_GLOBAL_PER_DAY = 1500;
const MIN_MS_BETWEEN_MESSAGES = 2000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
const USER_WINDOW_MS = 35 * ONE_HOUR_MS;

export const OWNER_IDS = new Set<number>([7759567618]);

interface UserStats {
  count: number;
  resetAt: number;
  lastMessageAt: number;
}

const userCounts = new Map<number, UserStats>();
let globalCount = 0;
let globalResetAt = Date.now() + ONE_DAY_MS;

function getUserWindowReset(): number {
  return Date.now() + USER_WINDOW_MS;
}

function getDayReset(): number {
  return Date.now() + ONE_DAY_MS;
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
    stats.resetAt = getUserWindowReset();
  }
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "user_limit" | "global_limit" | "flood"; resetAt: number };

export function checkRateLimit(userId: number): RateLimitResult {
  if (OWNER_IDS.has(userId)) return { allowed: true };

  resetGlobalIfNeeded();

  let stats = userCounts.get(userId);
  if (!stats) {
    stats = { count: 0, resetAt: getUserWindowReset(), lastMessageAt: 0 };
    userCounts.set(userId, stats);
  }
  resetUserIfNeeded(stats);

  const now = Date.now();
  if (now - stats.lastMessageAt < MIN_MS_BETWEEN_MESSAGES) {
    return { allowed: false, reason: "flood", resetAt: stats.lastMessageAt + MIN_MS_BETWEEN_MESSAGES };
  }

  if (globalCount >= MAX_GLOBAL_PER_DAY) {
    return { allowed: false, reason: "global_limit", resetAt: globalResetAt };
  }

  if (stats.count >= MAX_PER_USER_PER_WINDOW) {
    return { allowed: false, reason: "user_limit", resetAt: stats.resetAt };
  }

  stats.count++;
  stats.lastMessageAt = now;
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
  if (result.reason === "flood") return "";

  const hoursLeft = Math.ceil((result.resetAt - Date.now()) / (60 * 60 * 1000));

  if (result.reason === "user_limit") {
    return getRateLimitUserMessage(hoursLeft, MAX_PER_USER_PER_WINDOW, language);
  }

  return getRateLimitGlobalMessage(hoursLeft, language);
}
