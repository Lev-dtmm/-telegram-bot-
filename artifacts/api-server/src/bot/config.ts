/** Public bot configuration. Keep secrets in Replit Secrets, never in source code. */
export const creator = "@Lev_dtmm";
export const creatorTelegramId = 7759567618;

export const thinkingStickerId = process.env["THINKING_STICKER_ID"];

export const languageOptions = [
  { code: "es", label: "🇪🇸 Español" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "de", label: "🇩🇪 Deutsch" },
  { code: "en", label: "🇬🇧 English" },
  { code: "zh", label: "🇨🇳 中文" },
  { code: "ru", label: "🇷🇺 Русский" },
] as const;

export type SupportedLanguage = (typeof languageOptions)[number]["code"];
export const defaultLanguage: SupportedLanguage = "en";
