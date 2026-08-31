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
  handleDocument,
  handlePdf,
  handlePhoto,
  handleVoice,
  handleFeedback,
  handleStats,
} from "./handlers.js";
import { getOrCreateProfile, getUserLanguage, setRoyCohnMode, setUserLanguage } from "./user-profiles.js";
import { checkRateLimit, getRateLimitMessage, getStats, OWNER_IDS, MAX_GLOBAL_PER_DAY } from "./rate-limiter.js";
import { creator, creatorTelegramId, languageOptions, getThinkingStickerId, setThinkingStickerId, type SupportedLanguage } from "./config.js";
import { isDangerousMessage, safetyResponse } from "./safety.js";
import { getCreatorLine, getGenericError, getStatsRestricted, getTermsText, getPrivacyText, getVoiceTranscriptionFailedText, getPhotoReadFailedText } from "./config.js";

export function startBot(): void {
  const token = process.env["TELEGRAM_BOT_TOKEN"];

  if (!token) {
    logger.warn("TELEGRAM_BOT_TOKEN not set — Telegram bot will not start.");
    return;
  }

  const bot = new TelegramBot(token, { polling: true });
  logger.info("Telegram bot started (polling mode)");
  void bot.setMyCommands([
    { command: "start", description: "Start the assistant" },
    { command: "help", description: "Show all available commands" },
    { command: "advice", description: "Get business advice" },
    { command: "idea", description: "Generate a business idea" },
    { command: "ask", description: "Ask the AI a question" },
    { command: "feedback", description: "Send feedback" },
  ]).catch((err) => logger.warn({ err }, "Could not set Telegram command menu"));

  async function getUserInfo(msg: Message): Promise<{ userId: number; firstName: string; language: SupportedLanguage }> {
    const userId = msg.from?.id ?? msg.chat.id;
    const firstName = msg.from?.first_name ?? "there";
    const profile = await getOrCreateProfile(userId, firstName);
    return { userId, firstName, language: profile.language };
  }

  async function reply(chatId: number, text: string): Promise<void> {
    if (!text) return;
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

  async function sendThinkingIndicator(chatId: number): Promise<void> {
    const stickerId = getThinkingStickerId();
    if (stickerId) {
      try { await bot.sendSticker(chatId, stickerId); } catch (err) {
        logger.warn({ err }, "Thinking sticker could not be sent");
      }
    } else {
      try { await bot.sendMessage(chatId, "💸"); } catch { /* ignore */ }
    }
  }

  async function withTyping(chatId: number, fn: () => Promise<string>, language: SupportedLanguage = "en"): Promise<void> {
    try { await bot.sendChatAction(chatId, "typing"); } catch { /* ignore */ }
    try {
      const text = await fn();
      await reply(chatId, text);
    } catch (err) {
      logger.error({ err }, "Bot handler error");
      await reply(chatId, getGenericError(language));
    }
  }

  async function withTypingLimited(
    chatId: number,
    userId: number,
    fn: () => Promise<string>,
    rawText = ""
  ): Promise<void> {
    const language = await getUserLanguage(userId);
    if (isDangerousMessage(rawText)) {
      await reply(chatId, safetyResponse(language));
      return;
    }
    const result = checkRateLimit(userId);
    if (!result.allowed) {
      await reply(chatId, getRateLimitMessage(result, language));
      return;
    }
    await sendThinkingIndicator(chatId);
    await withTyping(chatId, fn, language);
  }

  bot.onText(/^\/start/, async (msg) => {
    const { userId, firstName, language } = await getUserInfo(msg);
    const isOwner = OWNER_IDS.has(userId);
    await withTyping(msg.chat.id, () => handleStart(firstName, isOwner, language), language);
    await bot.sendMessage(msg.chat.id, `Choose your language / Choisis ta langue :\n\n— Business Advisor AI · ${creator}`, {
      reply_markup: {
        inline_keyboard: [
          ...languageOptions.map((option) => [
            { text: option.label, callback_data: `lang:${option.code}` },
          ]),
          [{ text: "📋 Help / Aide", callback_data: "show_help" }],
        ],
      },
    });
  });

  bot.on("callback_query", async (query) => {
    if (!query.message || !query.data) return;
    if (query.data === "show_help") {
      await bot.answerCallbackQuery(query.id);
      const language = await getUserLanguage(query.from.id);
      await reply(query.message.chat.id, await handleHelp(language));
      return;
    }
query.data.startsWith("lang:")) return;
    if (!query.data.startsWith("lang:")) return;
    const code = query.data.slice(5) as SupportedLanguage;
    if (!languageOptions.some((option) => option.code === code)) return;
    const userId = query.from.id;
    await setUserLanguage(userId, code);
    await bot.answerCallbackQuery(query.id, { text: "Language saved" });
    await reply(query.message.chat.id, languageConfirmation(code));
  });

  bot.onText(/^\/creator/, async (msg) => {
    const { language } = await getUserInfo(msg);
    await reply(msg.chat.id, getCreatorLine(creator, language));
  });

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
    const { language } = await getUserInfo(msg);
    await reply(msg.chat.id, getTermsText(creator, language));
  });

  bot.onText(/^\/privacy/, async (msg) => {
    const { language } = await getUserInfo(msg);
    await reply(msg.chat.id, getPrivacyText(creator, language));
  });

  bot.onText(/^\/stats/, async (msg) => {
    const { userId, language } = await getUserInfo(msg);
    if (!OWNER_IDS.has(userId)) {
      await reply(msg.chat.id, getStatsRestricted(language));
      return;
    }
    const { globalCount, globalResetAt, userCount } = getStats(userId);
    await reply(msg.chat.id, handleStats(globalCount, globalResetAt, userCount, MAX_GLOBAL_PER_DAY, language));
  });

  bot.onText(/^\/help/, async (msg) => {
    const { language } = await getUserInfo(msg);
    await withTyping(msg.chat.id, () => handleHelp(language), language);
  });

  bot.onText(/^\/advice/, async (msg) => {
    const { userId, firstName } = await getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleAdvice(userId, firstName));
  });

  bot.onText(/^\/idea/, async (msg) => {
    const { userId, firstName } = await getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleIdea(userId, firstName));
  });

  bot.onText(/^\/strategy/, async (msg) => {
    const { userId, firstName } = await getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleStrategy(userId, firstName));
  });

  bot.onText(/^\/marketing/, async (msg) => {
    const { userId, firstName } = await getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleMarketing(userId, firstName));
  });

  bot.onText(/^\/sales/, async (msg) => {
    const { userId, firstName } = await getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleSales(userId, firstName));
  });

  bot.onText(/^\/case/, async (msg) => {
    const { userId, firstName } = await getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleCase(userId, firstName));
  });

  bot.onText(/^\/book/, async (msg) => {
    const { userId, firstName } = await getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleBook(userId, firstName));
  });

  bot.onText(/^\/quote/, async (msg) => {
    const { userId, firstName } = await getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleQuote(userId, firstName));
  });

  bot.onText(/^\/quiz/, async (msg) => {
    const { userId, firstName } = await getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleQuiz(userId, firstName));
  });

  bot.onText(/^\/glossary(?:\s+(.+))?$/, async (msg, match) => {
    const { userId, firstName } = await getUserInfo(msg);
    const term = match?.[1]?.trim();
    await withTypingLimited(msg.chat.id, userId, () => handleGlossary(userId, firstName, term));
  });

  bot.onText(/^\/news/, async (msg) => {
    const { userId, firstName } = await getUserInfo(msg);
    await withTypingLimited(msg.chat.id, userId, () => handleNews(userId, firstName));
  });

  bot.onText(/^\/ask(?:\s+(.+))?$/, async (msg, match) => {
    const { userId, firstName } = await getUserInfo(msg);
    const question = match?.[1]?.trim() ?? "";
    if (question.toLowerCase().includes("roy cohn")) {
      setRoyCohnMode(userId, true);
    }
    await withTypingLimited(msg.chat.id, userId, () => handleAsk(userId, firstName, question), question);
  });

  bot.onText(/^\/feedback(?:\s+(.+))?$/, async (msg, match) => {
    const { firstName, language } = await getUserInfo(msg);
    const feedback = match?.[1]?.trim() ?? "";
    await withTyping(msg.chat.id, () => handleFeedback(firstName, feedback, language), language);
  });

  // Document upload — text files (.txt/.md/.csv) and PDFs.
  bot.on("message", async (msg) => {
    if (!msg.document) return;
    const { userId, firstName, language } = await getUserInfo(msg);
    const fileName = msg.document.file_name ?? "document";
    const isTextFile = /\.(txt|md|csv)$/i.test(fileName);
    const isPdf = /\.pdf$/i.test(fileName);

    if (!isTextFile && !isPdf) {
      await reply(
        msg.chat.id,
        language === "fr"
          ? "📄 Pour l'instant, je lis les fichiers texte (.txt, .md, .csv) et les PDF. Colle plutôt le contenu directement dans le chat."
          : "📄 Right now I can read text files (.txt, .md, .csv) and PDFs. Paste the content directly in chat instead."
      );
      return;
    }

    const result = checkRateLimit(userId);
    if (!result.allowed) {
      await reply(msg.chat.id, getRateLimitMessage(result, language));
      return;
    }

    await sendThinkingIndicator(msg.chat.id);
    try { await bot.sendChatAction(msg.chat.id, "typing"); } catch { /* ignore */ }

    try {
      const fileLink = await bot.getFileLink(msg.document.file_id);
      const response = await fetch(fileLink);

      if (isPdf) {
        const arrayBuffer = await response.arrayBuffer();
        const pdfBuffer = Buffer.from(arrayBuffer);
        const docReply = await handlePdf(userId, firstName, fileName, pdfBuffer);
        const finalReply = docReply ??
          (language === "fr"
            ? "📄 Je n'ai pas réussi à extraire le texte de ce PDF (probablement un scan sans texte lisible). Essaie de coller le contenu directement en texte."
            : "📄 I couldn't extract text from that PDF (probably a scanned image with no readable text). Try pasting the content as plain text instead.");
        await reply(msg.chat.id, finalReply);
        return;
      }

      const fileText = await response.text();
      const docReply = await handleDocument(userId, firstName, fileName, fileText);
      await reply(msg.chat.id, docReply);
    } catch (err) {
      logger.error({ err }, "Failed to process document");
      await reply(msg.chat.id, getGenericError(language));
    }
  });

  // Photo upload — analyze with vision. Telegram always re-encodes photos as
  // JPEG, so we force that MIME type instead of trusting response headers.
  bot.on("message", async (msg) => {
    if (!msg.photo || msg.photo.length === 0) return;
    const { userId, firstName, language } = await getUserInfo(msg);
    const result = checkRateLimit(userId);
    if (!result.allowed) {
      await reply(msg.chat.id, getRateLimitMessage(result, language));
      return;
    }

    await sendThinkingIndicator(msg.chat.id);
    try { await bot.sendChatAction(msg.chat.id, "typing"); } catch { /* ignore */ }

    try {
      const largest = msg.photo[msg.photo.length - 1];
      const fileLink = await bot.getFileLink(largest.file_id);
      const response = await fetch(fileLink);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      const photoReply = await handlePhoto(userId, firstName, dataUrl, msg.caption);
      await reply(msg.chat.id, photoReply);
    } catch (err) {
      logger.error({ err }, "Failed to process photo");
      await reply(msg.chat.id, getPhotoReadFailedText(language));
    }
  });

  // Voice message — transcribe then respond.
  bot.on("message", async (msg) => {
    if (!msg.voice) return;
    const { userId, firstName, language } = await getUserInfo(msg);
    const result = checkRateLimit(userId);
    if (!result.allowed) {
      await reply(msg.chat.id, getRateLimitMessage(result, language));
      return;
    }

    await sendThinkingIndicator(msg.chat.id);
    try { await bot.sendChatAction(msg.chat.id, "typing"); } catch { /* ignore */ }

    try {
      const fileLink = await bot.getFileLink(msg.voice.file_id);
      const response = await fetch(fileLink);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      const transcriptReply = await handleVoice(userId, firstName, audioBuffer);
      if (transcriptReply === null) {
        await reply(msg.chat.id, getVoiceTranscriptionFailedText(language));
        return;
      }
      await reply(msg.chat.id, transcriptReply);
    } catch (err) {
      logger.error({ err }, "Failed to process voice message");
      await reply(msg.chat.id, getVoiceTranscriptionFailedText(language));
    }
  });

  // Free text — rate limited
  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;
    const { userId, firstName, language } = await getUserInfo(msg);
    if (isDangerousMessage(msg.text)) {
      await reply(msg.chat.id, safetyResponse(language));
      return;
    }
    if (msg.text.toLowerCase().includes("roy cohn")) {
      setRoyCohnMode(userId, true);
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

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception — bot stays alive");
});
process.on("unhandledRejection", (err) => {
  logger.error({ err }, "Unhandled promise rejection — bot stays alive");
});
