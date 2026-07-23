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
import { getOrCreateProfile } from "./user-profiles.js";
import { checkRateLimit, getRateLimitMessage, getStats, OWNER_IDS } from "./rate-limiter.js";

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
    const firstName = msg.from?.first_name ?? "toi";
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
    fn: () => Promise<string>
  ): Promise<void> {
    const result = checkRateLimit(userId);
    if (!result.allowed) {
      await reply(chatId, getRateLimitMessage(result));
      return;
    }
    await withTyping(chatId, fn);
  }

  // /start — free
  bot.onText(/^\/start/, async (msg) => {
    const { userId, firstName } = getUserInfo(msg);
    const isOwner = OWNER_IDS.has(userId);
    await withTyping(msg.chat.id, () => handleStart(firstName, isOwner));
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
    await withTypingLimited(msg.chat.id, userId, () => handleAsk(userId, firstName, question));
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
    await withTypingLimited(msg.chat.id, userId, () =>
      handleFreeText(userId, firstName, msg.text!)
    );
  });

  bot.on("polling_error", (err) => {
    logger.error({ err }, "Telegram polling error");
  });
}
