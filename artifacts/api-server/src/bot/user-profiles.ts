/**
 * In-memory user profile store, with language + Roy Cohn mode persisted to
 * Postgres so they survive redeploys/restarts (everything else — conversation
 * history and business context — stays in-memory only and auto-wipes after
 * 24h of inactivity, per the security requirements).
 */

import { pool, ensureSchema } from "./db.js";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export interface UserProfile {
  firstName: string;
  language: "es" | "fr" | "de" | "en" | "zh" | "ru";
  royCohnMode: boolean;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  businessContext: string;
  messageCount: number;
  lastActivityAt: number;
}

const profiles = new Map<number, UserProfile>();

function purgeIfStale(profile: UserProfile): void {
  if (Date.now() - profile.lastActivityAt > TWENTY_FOUR_HOURS_MS) {
    profile.conversationHistory = [];
    profile.businessContext = "";
  }
}

async function loadFromDb(
  userId: number
): Promise<{ language: UserProfile["language"]; royCohnMode: boolean } | null> {
  if (!pool) return null;
  try {
    await ensureSchema();
    const res = await pool.query(
      "SELECT language, roy_cohn_mode FROM bot_users WHERE telegram_id = $1",
      [userId]
    );
    if (res.rows.length === 0) return null;
    return {
      language: res.rows[0].language as UserProfile["language"],
      royCohnMode: res.rows[0].roy_cohn_mode as boolean,
    };
  } catch {
    return null;
  }
}

function saveToDb(userId: number, language: UserProfile["language"], royCohnMode: boolean): void {
  if (!pool) return;
  ensureSchema()
    .then(() =>
      pool!.query(
        `INSERT INTO bot_users (telegram_id, language, roy_cohn_mode, updated_at)
         VALUES ($1, $2, $3, now())
         ON CONFLICT (telegram_id) DO UPDATE SET language = $2, roy_cohn_mode = $3, updated_at = now()`,
        [userId, language, royCohnMode]
      )
    )
    .catch(() => {
      /* persistence is best-effort — in-memory cache still works this session */
    });
}

export async function getOrCreateProfile(userId: number, firstName?: string): Promise<UserProfile> {
  let profile = profiles.get(userId);
  if (!profile) {
    const dbData = await loadFromDb(userId);
    profile = {
      firstName: firstName ?? "toi",
      language: dbData?.language ?? "en",
      // Roy Cohn is the bot's base persona — always on by default.
      royCohnMode: dbData?.royCohnMode ?? true,
      conversationHistory: [],
      businessContext: "",
      messageCount: 0,
      lastActivityAt: Date.now(),
    };
    profiles.set(userId, profile);
    if (!dbData) {
      saveToDb(userId, profile.language, profile.royCohnMode);
    }
  } else {
    purgeIfStale(profile);
  }
  if (firstName && profile.firstName === "toi") {
    profile.firstName = firstName;
  }
  profile.lastActivityAt = Date.now();
  return profile;
}

export async function setUserLanguage(userId: number, language: UserProfile["language"]): Promise<void> {
  const profile = await getOrCreateProfile(userId);
  profile.language = language;
  saveToDb(userId, language, profile.royCohnMode);
}

export async function getUserLanguage(userId: number): Promise<UserProfile["language"]> {
  return (await getOrCreateProfile(userId)).language;
}

export function setRoyCohnMode(userId: number, enabled: boolean): void {
  const profile = profiles.get(userId);
  if (!profile) return;
  profile.royCohnMode = enabled;
  saveToDb(userId, profile.language, enabled);
}

export function addToHistory(
  userId: number,
  role: "user" | "assistant",
  content: string
): void {
  const profile = profiles.get(userId);
  if (!profile) return;
  profile.conversationHistory.push({ role, content });
  profile.messageCount++;
  profile.lastActivityAt = Date.now();
  if (profile.conversationHistory.length > 12) {
    profile.conversationHistory = profile.conversationHistory.slice(-12);
  }
}

export function updateBusinessContext(userId: number, context: string): void {
  const profile = profiles.get(userId);
  if (!profile) return;
  const combined = `${profile.businessContext}\n${context}`.trim();
  profile.businessContext = combined.slice(-400);
}

// Periodic sweep as a safety net for profiles that are never accessed again.
setInterval(() => {
  const now = Date.now();
  for (const profile of profiles.values()) {
    if (now - profile.lastActivityAt > TWENTY_FOUR_HOURS_MS) {
      profile.conversationHistory = [];
      profile.businessContext = "";
    }
  }
}, 60 * 60 * 1000); // every hour