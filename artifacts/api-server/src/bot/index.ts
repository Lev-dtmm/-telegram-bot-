import TelegramBot, { type Message } from "node-telegram-bot-api";
import { logger } from "../lib/logger.js";
import {
  handleStart,
  handleHelp,
  handleAdvice,
  handleIdea,
  handleStrategy,
  handleMarketing,
  handleSales,
  handleCase,
  handleBook,
  handleQuote,
  handleQuiz,
  handleGlossary,
  handleNews,
  handleAsk,
  handleFreeText,
  handleFeedback,
  handleStats,
} from "./handlers.js";
import { getOrCreateProfile, getUserLanguage, setRoyCohnMode, setUserLanguage } from "./user-profiles.js";
import { checkRateLimit, getRateLimitMessage, getStats, OWNER_IDS } from "./rate-limiter.js";
import { creator, creatorTelegramId, languageOptions, getThinkingStickerId, setThinkingStickerId, type SupportedLanguage } from "./config.js";
import { isDangerousMessage, safetyResponse } from "./safety.js";

export function startBot(): void {
  const token = process.env["TELEGRAM_BOT_TOKEN"];

  if (!token) {
    logger.warn("TELEGRAM_BOT_TOKEN not set — Telegram bot will not start.");
    return;
  }

  const bot = new TelegramBot(token, { polling: true });
  logger.info("Telegram bot started (polling mode)");

  function getUserInfo(msg: Message): { userId: number; firstName: string } {
    const userId = msg.from?.id ?? msg.chat.id;
    const firstName = msg.from?.first_name ?? "there";
    // Ensure profile exists with the right first name
    getOrCreateProfile(userId, firstName);
    return { userId, firstName };
  }

  async function reply(chatId: number, text: string): Promise<void> {
    try {
      await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
    } catch {
      try {
        await bot.sendMessage(chatId, text);
      } catch (err2) {
        logger.error({ err: err2 }, "Failed to send Telegram message");
      }
    }
  }

  /** Free commands — no rate limit, no OpenAI call */
  async function withTyping(chatId: number, fn: () => Promise<string>): Promise<void> {
    try { await bot.sendChatAction(chatId, "typing"); } catch { /* ignore */ }
    try {
      const text = await fn();
      await reply(chatId, text);
    } catch (err) {
      logger.error({ err }, "Bot handler error");
      await reply(chatId, "⚠️ Une erreur s'est produite. Réessaie dans quelques instants.");
    }
  }

  /** AI-powered commands — rate limited */
  async function withTypingLimited(
    chatId: number,
    userId: number,
    fn: () => Promise<string>,
    rawText = ""
  ): Promise<void> {
    const language = getUserLanguage(userId);
    if (isDangerousMessage(rawText)) {
      await reply(chatId, safetyResponse(language));
      return;
    }
    const result = checkRateLimit(userId);
    if (!result.allowed) {
      await reply(chatId, getRateLimitMessage(result));
      return;
    }
    const stickerId = getThinkingStickerId();
    if (stickerId) {
      try { await bot.sendSticker(chatId, stickerId); } catch (err) {
        logger.warn({ err }, "Thinking sticker could not be sent");
      }
    } else {
      try { await bot.sendMessage(chatId, "💸"); } catch { /* ignore */ }
    }
    await withTyping(chatId, fn);
  }

  // /start — free
  bot.onText(/^\/start/, async (msg) => {
    const { userId, firstName } = getUserInfo(msg);
    const isOwner = OWNER_IDS.has(userId);
    await withTyping(msg.chat.id, () => handleStart(firstName, isOwner));
    await bot.sendMessage(msg.chat.id, `Choose your language / Choisis ta langue :\n\n— Business Advisor AI · ${creator}`, {
      reply_markup: { inline_keyboard: languageOptions.map((option) => [
        { text: option.label, callback_data: `lang:${option.code}` },
      ]) },
    });
  });

  bot.on("callback_query", async (query) => {
    if (!query.message || !query.data?.startsWith("lang:")) return;
    const code = query.data.slice(5) as SupportedLanguage;
    if (!languageOptions.some((option) => option.code === code)) return;
    const userId = query.from.id;
    setUserLanguage(userId, code);
    await bot.answerCallbackQuery(query.id, { text: "Language saved" });
    await reply(query.message.chat.id, languageConfirmation(code));
  });

  bot.onText(/^\/creator/, async (msg) => {
    await reply(msg.chat.id, `This bot is created by ${creator}.`);
  });

  // Owner setup: send any sticker to the bot to retrieve and activate its file_id.
  bot.on("message", async (msg) => {
    if (!msg.sticker || msg.from?.id !== creatorTelegramId) return;
    const fileId = msg.sticker.file_id;
    setThinkingStickerId(fileId);
    await reply(
      msg.chat.id,
      `✅ Sticker activé !\n\nIdentifiant : \`${fileId}\`\n\nPour le garder après un redémarrage ou sur Hetzner, ajoute cette variable d'environnement :\n\`THINKING_STICKER_ID=${fileId}\``,
    );
  });

  bot.onText(/^\/terms/, async (msg) => {
    await reply(msg.chat.id, `Terms & privacy notice:

• General educational information only — not medical, legal, tax, or financial advice.
• Never share passwords, payment details, or highly sensitive information.
• Telegram and OpenAI process messages to deliver this service.
• Conversation context is kept in memory only for personalization and is lost when the service restarts.
• For deletion or privacy questions, contact ${creator}.
• In immediate danger, contact local emergency services.`);
  });

  bot.onText(/^\/privacy/, async (msg) => {
    await reply(msg.chat.id, `Privacy: we minimize data and do not needlessly store conversations in a database. Telegram and OpenAI may process messages to provide replies. Do not send secrets. Contact ${creator} for privacy questions or deletion requests.`);
  });

  // /stats — owner only
  bot.onText(/^\/stats/, async (msg) => {
    const { userId } = getUserInfo(msg);
    if (!OWNER_IDS.has(userId)) {
      await reply(msg.chat.id, "❌ Commande réservée au créateur du bot.");
      return;
    }
    const { globalCount, globalResetAt, userCount } = getStats(userId);
    await reply(msg.chat.id, handleStats(globalCount, globalResetAt, userCount));
  });

  // /help — free
  bot.onText(/^\/help/, async (msg) => {
    await withTyping(msg.chat.id, () => handleHelp());
  });

  // /advice
  bot.onText(/^\/advice/, async (msg) => {
    const { userId, firstName } = getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleAdvice(userId, firstName));
  });

  // /idea
  bot.onText(/^\/idea/, async (msg) => {
    const { userId, firstName } = getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleIdea(userId, firstName));
  });

  // /strategy
  bot.onText(/^\/strategy/, async (msg) => {
    const { userId, firstName } = getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleStrategy(userId, firstName));
  });

  // /marketing
  bot.onText(/^\/marketing/, async (msg) => {
    const { userId, firstName } = getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleMarketing(userId, firstName));
  });

  // /sales
  bot.onText(/^\/sales/, async (msg) => {
    const { userId, firstName } = getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleSales(userId, firstName));
  });

  // /case
  bot.onText(/^\/case/, async (msg) => {
    const { userId, firstName } = getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleCase(userId, firstName));
  });

  // /book
  bot.onText(/^\/book/, async (msg) => {
    const { userId, firstName } = getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleBook(userId, firstName));
  });

  // /quote
  bot.onText(/^\/quote/, async (msg) => {
    const { userId, firstName } = getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleQuote(firstName));
  });

  // /quiz
  bot.onText(/^\/quiz/, async (msg) => {
    const { userId, firstName } = getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleQuiz(firstName));
  });

  // /glossary [term]
  bot.onText(/^\/glossary(?:\s+(.+))?$/, async (msg, match) => {
    const { userId, firstName } = getUserInfo(msg);
    const term = match?.[1]?.trim();
    await withTypingLimited(msg.chat.id, userId, () => handleGlossary(firstName, term));
  });

  // /news
  bot.onText(/^\/news/, async (msg) => {
    const { userId, firstName } = getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleNews(userId, firstName));
  });

  // /ask [question]
  bot.onText(/^\/ask(?:\s+(.+))?$/, async (msg, match) => {
    const { userId, firstName } = getUserInfo(msg);
    const question = match?.[1]?.trim() ?? "";
    await withTypingLimited(msg.chat.id, userId, () => handleAsk(userId, firstName, question), question);
  });

  // /feedback — free
  bot.onText(/^\/feedback(?:\s+(.+))?$/, async (msg, match) => {
    const { firstName } = getUserInfo(msg);
    const feedback = match?.[1]?.trim() ?? "";
    await withTyping(msg.chat.id, () => handleFeedback(firstName, feedback));
  });

  // Free text — rate limited
  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;
    const { userId, firstName } = getUserInfo(msg);
    const language = getUserLanguage(userId);
    if (isDangerousMessage(msg.text)) {
      await reply(msg.chat.id, safetyResponse(language));
      return;
    }
    if (msg.text.toLowerCase().includes("roy cohn") && userId === creatorTelegramId) {
      setRoyCohnMode(userId, true);
      await reply(msg.chat.id, "Secret mode activated: hard-nosed advocate voice enabled.");
      return;
    }
    await withTypingLimited(msg.chat.id, userId, () =>
      handleFreeText(userId, firstName, msg.text!)
    );
  });

  bot.on("polling_error", (err) => {
    logger.error({ err }, "Telegram polling error");
  });
}

function languageConfirmation(language: SupportedLanguage): string {
  const messages: Record<SupportedLanguage, string> = {
    en: "English selected. I’ll adapt all future replies to you.",
    fr: "Français sélectionné. Toutes mes prochaines réponses s'adapteront à toi.",
    es: "Español seleccionado. Adaptaré todas mis respuestas a ti.",
    de: "Deutsch ausgewählt. Meine Antworten passen sich an dich an.",
    zh: "已选择中文。之后我会使用中文回复。",
    ru: "Русский выбран. Дальше я буду отвечать на русском.",
  };
  return messages[language];
}
