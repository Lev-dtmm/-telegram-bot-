import TelegramBot from "node-telegram-bot-api";
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
} from "./handlers.js";
import { checkRateLimit, getRateLimitMessage } from "./rate-limiter.js";

export function startBot(): void {
  const token = process.env["TELEGRAM_BOT_TOKEN"];

  if (!token) {
    logger.warn("TELEGRAM_BOT_TOKEN not set — Telegram bot will not start.");
    return;
  }

  const bot = new TelegramBot(token, { polling: true });
  logger.info("Telegram bot started (polling mode)");

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

  /** For commands that don't call OpenAI (free, no rate limit) */
  async function withTyping(chatId: number, fn: () => Promise<string>): Promise<void> {
    try {
      await bot.sendChatAction(chatId, "typing");
    } catch { /* ignore */ }
    try {
      const text = await fn();
      await reply(chatId, text);
    } catch (err) {
      logger.error({ err }, "Bot handler error");
      await reply(chatId, "⚠️ Une erreur s'est produite. Réessaie dans quelques instants.");
    }
  }

  /** For commands that call OpenAI (rate limited) */
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
    await withTyping(msg.chat.id, handleStart);
  });

  // /help — free
  bot.onText(/^\/help/, async (msg) => {
    await withTyping(msg.chat.id, handleHelp);
  });

  // /advice
  bot.onText(/^\/advice/, async (msg) => {
    const userId = msg.from?.id ?? msg.chat.id;
    await withTypingLimited(msg.chat.id, userId, handleAdvice);
  });

  // /idea
  bot.onText(/^\/idea/, async (msg) => {
    const userId = msg.from?.id ?? msg.chat.id;
    await withTypingLimited(msg.chat.id, userId, handleIdea);
  });

  // /strategy
  bot.onText(/^\/strategy/, async (msg) => {
    const userId = msg.from?.id ?? msg.chat.id;
    await withTypingLimited(msg.chat.id, userId, handleStrategy);
  });

  // /marketing
  bot.onText(/^\/marketing/, async (msg) => {
    const userId = msg.from?.id ?? msg.chat.id;
    await withTypingLimited(msg.chat.id, userId, handleMarketing);
  });

  // /sales
  bot.onText(/^\/sales/, async (msg) => {
    const userId = msg.from?.id ?? msg.chat.id;
    await withTypingLimited(msg.chat.id, userId, handleSales);
  });

  // /case
  bot.onText(/^\/case/, async (msg) => {
    const userId = msg.from?.id ?? msg.chat.id;
    await withTypingLimited(msg.chat.id, userId, handleCase);
  });

  // /book
  bot.onText(/^\/book/, async (msg) => {
    const userId = msg.from?.id ?? msg.chat.id;
    await withTypingLimited(msg.chat.id, userId, handleBook);
  });

  // /quote
  bot.onText(/^\/quote/, async (msg) => {
    const userId = msg.from?.id ?? msg.chat.id;
    await withTypingLimited(msg.chat.id, userId, handleQuote);
  });

  // /quiz
  bot.onText(/^\/quiz/, async (msg) => {
    const userId = msg.from?.id ?? msg.chat.id;
    await withTypingLimited(msg.chat.id, userId, handleQuiz);
  });

  // /glossary [term]
  bot.onText(/^\/glossary(?:\s+(.+))?$/, async (msg, match) => {
    const userId = msg.from?.id ?? msg.chat.id;
    const term = match?.[1]?.trim();
    await withTypingLimited(msg.chat.id, userId, () => handleGlossary(term));
  });

  // /news
  bot.onText(/^\/news/, async (msg) => {
    const userId = msg.from?.id ?? msg.chat.id;
    await withTypingLimited(msg.chat.id, userId, handleNews);
  });

  // /ask [question]
  bot.onText(/^\/ask(?:\s+(.+))?$/, async (msg, match) => {
    const userId = msg.from?.id ?? msg.chat.id;
    const question = match?.[1]?.trim() ?? "";
    await withTypingLimited(msg.chat.id, userId, () => handleAsk(question));
  });

  // /feedback — free (no OpenAI call)
  bot.onText(/^\/feedback(?:\s+(.+))?$/, async (msg, match) => {
    const feedback = match?.[1]?.trim() ?? "";
    await withTyping(msg.chat.id, () => handleFeedback(feedback));
  });

  // Free text — rate limited
  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;
    const chatId = msg.chat.id;
    const userId = msg.from?.id ?? chatId;
    await withTypingLimited(chatId, userId, () => handleFreeText(userId, msg.text!));
  });

  bot.on("polling_error", (err) => {
    logger.error({ err }, "Telegram polling error");
  });
}
