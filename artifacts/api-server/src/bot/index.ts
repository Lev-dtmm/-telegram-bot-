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
    } catch (err) {
      // Fallback: send without Markdown if parsing fails
      try {
        await bot.sendMessage(chatId, text);
      } catch (err2) {
        logger.error({ err: err2 }, "Failed to send Telegram message");
      }
    }
  }

  async function withTyping(chatId: number, fn: () => Promise<string>): Promise<void> {
    try {
      await bot.sendChatAction(chatId, "typing");
    } catch {
      // ignore
    }
    try {
      const text = await fn();
      await reply(chatId, text);
    } catch (err) {
      logger.error({ err }, "Bot handler error");
      await reply(chatId, "⚠️ Une erreur s'est produite. Réessaie dans quelques instants.");
    }
  }

  // /start
  bot.onText(/^\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await withTyping(chatId, handleStart);
  });

  // /help
  bot.onText(/^\/help/, async (msg) => {
    const chatId = msg.chat.id;
    await withTyping(chatId, handleHelp);
  });

  // /advice
  bot.onText(/^\/advice/, async (msg) => {
    const chatId = msg.chat.id;
    await withTyping(chatId, handleAdvice);
  });

  // /idea
  bot.onText(/^\/idea/, async (msg) => {
    const chatId = msg.chat.id;
    await withTyping(chatId, handleIdea);
  });

  // /strategy
  bot.onText(/^\/strategy/, async (msg) => {
    const chatId = msg.chat.id;
    await withTyping(chatId, handleStrategy);
  });

  // /marketing
  bot.onText(/^\/marketing/, async (msg) => {
    const chatId = msg.chat.id;
    await withTyping(chatId, handleMarketing);
  });

  // /sales
  bot.onText(/^\/sales/, async (msg) => {
    const chatId = msg.chat.id;
    await withTyping(chatId, handleSales);
  });

  // /case
  bot.onText(/^\/case/, async (msg) => {
    const chatId = msg.chat.id;
    await withTyping(chatId, handleCase);
  });

  // /book
  bot.onText(/^\/book/, async (msg) => {
    const chatId = msg.chat.id;
    await withTyping(chatId, handleBook);
  });

  // /quote
  bot.onText(/^\/quote/, async (msg) => {
    const chatId = msg.chat.id;
    await withTyping(chatId, handleQuote);
  });

  // /quiz
  bot.onText(/^\/quiz/, async (msg) => {
    const chatId = msg.chat.id;
    await withTyping(chatId, handleQuiz);
  });

  // /glossary [term]
  bot.onText(/^\/glossary(?:\s+(.+))?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const term = match?.[1]?.trim();
    await withTyping(chatId, () => handleGlossary(term));
  });

  // /news
  bot.onText(/^\/news/, async (msg) => {
    const chatId = msg.chat.id;
    await withTyping(chatId, handleNews);
  });

  // /ask [question]
  bot.onText(/^\/ask(?:\s+(.+))?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const question = match?.[1]?.trim() ?? "";
    await withTyping(chatId, () => handleAsk(question));
  });

  // /feedback [message]
  bot.onText(/^\/feedback(?:\s+(.+))?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const feedback = match?.[1]?.trim() ?? "";
    await withTyping(chatId, () => handleFeedback(feedback));
  });

  // Free text (non-command messages)
  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;
    const chatId = msg.chat.id;
    const userId = msg.from?.id ?? chatId;
    await withTyping(chatId, () => handleFreeText(userId, msg.text!));
  });

  bot.on("polling_error", (err) => {
    logger.error({ err }, "Telegram polling error");
  });
}
