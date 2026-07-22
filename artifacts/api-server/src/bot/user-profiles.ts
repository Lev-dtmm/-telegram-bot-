/**
 * In-memory user profile store.
 * Tracks first name, business context, and conversation history per user.
 */

export interface UserProfile {
  firstName: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  businessContext: string; // accumulated context about the user's business
  messageCount: number;
}

const profiles = new Map<number, UserProfile>();

export function getOrCreateProfile(userId: number, firstName?: string): UserProfile {
  let profile = profiles.get(userId);
  if (!profile) {
    profile = {
      firstName: firstName ?? "toi",
      conversationHistory: [],
      businessContext: "",
      messageCount: 0,
    };
    profiles.set(userId, profile);
  }
  // Update first name if provided
  if (firstName && profile.firstName === "toi") {
    profile.firstName = firstName;
  }
  return profile;
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
