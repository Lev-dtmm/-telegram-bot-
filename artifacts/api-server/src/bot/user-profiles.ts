/**
 * In-memory user profile store.
 * Tracks first name, business context, and conversation history per user.
 *
 * SECURITY: conversation history and business context (potentially sensitive
 * information about the user's business) are automatically wiped after 24h
 * of inactivity. Language preference and Roy Cohn mode are kept (not sensitive).
 */

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export interface UserProfile {
  firstName: string;
  language: "es" | "fr" | "de" | "en" | "zh" | "ru";
  royCohnMode: boolean;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  businessContext: string; // accumulated context about the user's business
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

export function getOrCreateProfile(userId: number, firstName?: string): UserProfile {
  let profile = profiles.get(userId);
  if (!profile) {
    profile = {
      firstName: firstName ?? "toi",
      language: "en",
      // Roy Cohn is the bot's base persona — always on by default, not just
      // triggered by mentioning his name. Set to false only if a user ever
      // needs to opt out.
      royCohnMode: true,
      conversationHistory: [],
      businessContext: "",
      messageCount: 0,
      lastActivityAt: Date.now(),
    };
    profiles.set(userId, profile);
  } else {
    purgeIfStale(profile);
  }
  // Update first name if provided
  if (firstName && profile.firstName === "toi") {
    profile.firstName = firstName;
  }
  profile.lastActivityAt = Date.now();
  return profile;
}

export function setUserLanguage(userId: number, language: UserProfile["language"]): void {
  const profile = getOrCreateProfile(userId);
  profile.language = language;
}

export function getUserLanguage(userId: number): UserProfile["language"] {
  return getOrCreateProfile(userId).language;
}

export function setRoyCohnMode(userId: number, enabled: boolean): void {
  getOrCreateProfile(userId).royCohnMode = enabled;
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
  // Keep last 12 messages to avoid token overflow
  if (profile.conversationHistory.length > 12) {
    profile.conversationHistory = profile.conversationHistory.slice(-12);
  }
}

export function updateBusinessContext(userId: number, context: string): void {
  const profile = profiles.get(userId);
  if (!profile) return;
  // Append new context (max 400 chars to keep it lean)
  const combined = `${profile.businessContext}\n${context}`.trim();
  profile.businessContext = combined.slice(-400);
}

// Periodic sweep as a safety net for profiles that are never accessed again
// (the lazy check above only fires the next time that specific user interacts).
setInterval(() => {
  const now = Date.now();
  for (const profile of profiles.values()) {
    if (now - profile.lastActivityAt > TWENTY_FOUR_HOURS_MS) {
      profile.conversationHistory = [];
      profile.businessContext = "";
    }
  }
}, 60 * 60 * 1000); // every hour