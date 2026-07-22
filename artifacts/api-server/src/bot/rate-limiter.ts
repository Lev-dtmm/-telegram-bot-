/**
 * In-memory rate limiter for the Telegram bot.
 * - Per user: max 20 messages per day
 * - Global: max 300 messages per day total (protects billing)
 * Resets every 24 hours automatically.
 */

const MAX_PER_USER_PER_DAY = 20;
const MAX_GLOBAL_PER_DAY = 300;

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

export function getRateLimitMessage(result: Extract<RateLimitResult, { allowed: false }>): string {
  const hoursLeft = Math.ceil((result.resetAt - Date.now()) / (60 * 60 * 1000));

  if (result.reason === "user_limit") {
    return (
      `⏳ Tu as atteint la limite de *${MAX_PER_USER_PER_DAY} messages par jour*.\n\n` +
      `Reviens dans ~${hoursLeft}h pour continuer. Cette limite existe pour garder le service gratuit et durable pour tous. 🙏`
    );
  }

  return (
    `🔒 Le bot a atteint sa limite journalière de messages.\n\n` +
    `Réessaie dans ~${hoursLeft}h. Merci de ta compréhension !`
  );
}
