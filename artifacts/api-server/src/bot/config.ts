/** Public bot configuration. Keep secrets in Replit Secrets, never in source code. */
export const creator = "@Lev_dtmm";
export const creatorTelegramId = 7759567618;

let thinkingStickerId = process.env["THINKING_STICKER_ID"];

export function getThinkingStickerId(): string | undefined {
  return thinkingStickerId;
}

export function setThinkingStickerId(fileId: string): void {
  thinkingStickerId = fileId;
}

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

// ─── Translations (merged in so no extra file is needed) ─────────────────────

export function getHelpText(language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return `📋 *Mes commandes :*

💼 *Conseils & Stratégie*
/advice — Conseil business du jour
/strategy — Stratégie de croissance ou de vente
/marketing — Conseil marketing pratique
/sales — Techniques de vente efficaces

💡 *Idées & Inspiration*
/idea — Génère une idée de business originale
/quote — Citation inspirante d'un entrepreneur
/book — Recommandation de livre business

📊 *Apprentissage*
/case — Analyse d'une entreprise connue
/quiz — Lance un quiz business interactif
/glossary [terme] — Explique un terme (ROI, EBITDA, CAC...)
/news — Tendance économique importante

❓ *Interaction*
/ask [question] — Pose n'importe quelle question
/feedback — Envoie ton avis ou suggestion

💬 Tu peux aussi m'écrire librement — je me souviens de notre conversation et j'adapte mes réponses à ta situation !`;
    case "es":
      return `📋 *Mis comandos:*

💼 *Consejos y Estrategia*
/advice — Consejo de negocio del día
/strategy — Estrategia de crecimiento o ventas
/marketing — Consejo práctico de marketing
/sales — Técnicas de venta eficaces

💡 *Ideas e Inspiración*
/idea — Genera una idea de negocio original
/quote — Cita inspiradora de un emprendedor
/book — Recomendación de libro de negocios

📊 *Aprendizaje*
/case — Análisis de una empresa conocida
/quiz — Lanza un quiz interactivo de negocios
/glossary [término] — Explica un término (ROI, EBITDA, CAC...)
/news — Tendencia económica importante

❓ *Interacción*
/ask [pregunta] — Haz cualquier pregunta
/feedback — Envía tu opinión o sugerencia

💬 También puedes escribirme libremente — recuerdo nuestra conversación y adapto mis respuestas a tu situación.`;
    case "de":
      return `📋 *Meine Befehle:*

💼 *Beratung & Strategie*
/advice — Business-Tipp des Tages
/strategy — Wachstums- oder Verkaufsstrategie
/marketing — Praktischer Marketing-Tipp
/sales — Effektive Verkaufstechniken

💡 *Ideen & Inspiration*
/idea — Generiert eine originelle Geschäftsidee
/quote — Inspirierendes Zitat eines Unternehmers
/book — Buchempfehlung zum Thema Business

📊 *Lernen*
/case — Analyse eines bekannten Unternehmens
/quiz — Startet ein interaktives Business-Quiz
/glossary [Begriff] — Erklärt einen Begriff (ROI, EBITDA, CAC...)
/news — Wichtiger Wirtschaftstrend

❓ *Interaktion*
/ask [Frage] — Stelle mir jede Frage
/feedback — Sende dein Feedback oder deinen Vorschlag

💬 Du kannst mir auch frei schreiben — ich erinnere mich an unser Gespräch und passe meine Antworten an deine Situation an!`;
    case "zh":
      return `📋 *我的指令：*

💼 *建议与战略*
/advice — 今日商业建议
/strategy — 增长或销售策略
/marketing — 实用营销建议
/sales — 有效销售技巧

💡 *创意与灵感*
/idea — 生成一个原创商业点子
/quote — 企业家的励志名言
/book — 商业书籍推荐

📊 *学习*
/case — 分析一家知名企业
/quiz — 开始互动商业问答
/glossary [术语] — 解释一个术语（ROI、EBITDA、CAC等）
/news — 重要经济趋势

❓ *互动*
/ask [问题] — 提出任何问题
/feedback — 发送你的意见或建议

💬 你也可以自由地和我聊天——我会记住我们的对话，并根据你的情况调整回答！`;
    case "ru":
      return `📋 *Мои команды:*

💼 *Советы и стратегия*
/advice — Бизнес-совет дня
/strategy — Стратегия роста или продаж
/marketing — Практический совет по маркетингу
/sales — Эффективные техники продаж

💡 *Идеи и вдохновение*
/idea — Генерирует оригинальную бизнес-идею
/quote — Вдохновляющая цитата предпринимателя
/book — Рекомендация бизнес-книги

📊 *Обучение*
/case — Разбор известной компании
/quiz — Запускает интерактивную бизнес-викторину
/glossary [термин] — Объясняет термин (ROI, EBITDA, CAC...)
/news — Важный экономический тренд

❓ *Взаимодействие*
/ask [вопрос] — Задай любой вопрос
/feedback — Отправь отзыв или предложение

💬 Ты также можешь просто писать мне свободно — я помню наш разговор и адаптирую ответы под твою ситуацию!`;
    default:
      return `📋 *My commands:*

💼 *Advice & Strategy*
/advice — Business tip of the day
/strategy — Growth or sales strategy
/marketing — Practical marketing advice
/sales — Effective sales techniques

💡 *Ideas & Inspiration*
/idea — Generates an original business idea
/quote — Inspiring quote from an entrepreneur
/book — Business book recommendation

📊 *Learning*
/case — Analysis of a well-known company
/quiz — Starts an interactive business quiz
/glossary [term] — Explains a term (ROI, EBITDA, CAC...)
/news — Important economic trend

❓ *Interaction*
/ask [question] — Ask me anything
/feedback — Send your feedback or suggestion

💬 You can also just write to me freely — I remember our conversation and adapt my answers to your situation!`;
  }
}

export function getFeedbackPrompt(firstName: string, language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return `📝 Envoie ton avis avec /feedback suivi de ton message, ${firstName}.\n\nExemple : \`/feedback J'adorerais un mode quiz quotidien !\``;
    case "es":
      return `📝 Envía tu opinión con /feedback seguido de tu mensaje, ${firstName}.\n\nEjemplo: \`/feedback ¡Me encantaría un modo de quiz diario!\``;
    case "de":
      return `📝 Sende dein Feedback mit /feedback gefolgt von deiner Nachricht, ${firstName}.\n\nBeispiel: \`/feedback Ich hätte gerne einen täglichen Quiz-Modus!\``;
    case "zh":
      return `📝 请使用 /feedback 加上你的留言发送反馈，${firstName}。\n\n例如：\`/feedback 我希望有每日问答模式！\``;
    case "ru":
      return `📝 Отправь свой отзыв командой /feedback и текстом сообщения, ${firstName}.\n\nПример: \`/feedback Хочу ежедневный режим викторины!\``;
    default:
      return `📝 Send your feedback with /feedback followed by your message, ${firstName}.\n\nExample: \`/feedback I'd love a daily quiz mode!\``;
  }
}

export function getFeedbackThanks(firstName: string, feedback: string, language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return `✅ Merci ${firstName} pour ton retour !\n\n_"${feedback}"_\n\nC'est exactement ce genre de feedback qui aide à améliorer le bot. Je l'ai bien noté. 🙏`;
    case "es":
      return `✅ ¡Gracias ${firstName} por tu opinión!\n\n_"${feedback}"_\n\nEste es exactamente el tipo de opinión que ayuda a mejorar el bot. Lo tengo anotado. 🙏`;
    case "de":
      return `✅ Danke ${firstName} für dein Feedback!\n\n_"${feedback}"_\n\nGenau solches Feedback hilft, den Bot zu verbessern. Ich habe es notiert. 🙏`;
    case "zh":
      return `✅ 谢谢你的反馈，${firstName}！\n\n_"${feedback}"_\n\n这正是能帮助改进机器人的反馈。我已经记录下来了。🙏`;
    case "ru":
      return `✅ Спасибо, ${firstName}, за отзыв!\n\n_"${feedback}"_\n\nИменно такой фидбек помогает улучшать бота. Я всё записал. 🙏`;
    default:
      return `✅ Thanks ${firstName} for your feedback!\n\n_"${feedback}"_\n\nThis is exactly the kind of feedback that helps improve the bot. Noted. 🙏`;
  }
}

export function getStatsRestricted(language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return "❌ Commande réservée au créateur du bot.";
    case "es":
      return "❌ Comando reservado para el creador del bot.";
    case "de":
      return "❌ Dieser Befehl ist dem Bot-Ersteller vorbehalten.";
    case "zh":
      return "❌ 此命令仅限机器人创建者使用。";
    case "ru":
      return "❌ Эта команда доступна только создателю бота.";
    default:
      return "❌ This command is reserved for the bot's creator.";
  }
}

export function getStatsText(globalCount: number, hoursLeft: number, userCount: number, maxGlobalPerDay: number, language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return `📊 *Statistiques du bot*\n\n🌍 Messages globaux aujourd'hui : *${globalCount}* / ${maxGlobalPerDay}\n👤 Tes messages aujourd'hui : *${userCount}* (illimité pour toi)\n🔄 Remise à zéro dans : ~${hoursLeft}h`;
    case "es":
      return `📊 *Estadísticas del bot*\n\n🌍 Mensajes globales hoy: *${globalCount}* / ${maxGlobalPerDay}\n👤 Tus mensajes hoy: *${userCount}* (ilimitado para ti)\n🔄 Reinicio en: ~${hoursLeft}h`;
    case "de":
      return `📊 *Bot-Statistiken*\n\n🌍 Globale Nachrichten heute: *${globalCount}* / ${maxGlobalPerDay}\n👤 Deine Nachrichten heute: *${userCount}* (unbegrenzt für dich)\n🔄 Zurücksetzen in: ~${hoursLeft}Std`;
    case "zh":
      return `📊 *机器人统计*\n\n🌍 今日全局消息数：*${globalCount}* / ${maxGlobalPerDay}\n👤 你今日的消息数：*${userCount}*（对你无限制）\n🔄 将在约 ${hoursLeft} 小时后重置`;
    case "ru":
      return `📊 *Статистика бота*\n\n🌍 Сообщений сегодня всего: *${globalCount}* / ${maxGlobalPerDay}\n👤 Твоих сообщений сегодня: *${userCount}* (без ограничений для тебя)\n🔄 Сброс через: ~${hoursLeft}ч`;
    default:
      return `📊 *Bot statistics*\n\n🌍 Global messages today: *${globalCount}* / ${maxGlobalPerDay}\n👤 Your messages today: *${userCount}* (unlimited for you)\n🔄 Resets in: ~${hoursLeft}h`;
  }
}

export function getAskEmptyPrompt(firstName: string, language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return `❓ Utilise /ask suivi de ta question, ${firstName}.\n\nExemple : \`/ask Comment fixer le prix de mon produit ?\``;
    case "es":
      return `❓ Usa /ask seguido de tu pregunta, ${firstName}.\n\nEjemplo: \`/ask ¿Cómo fijo el precio de mi producto?\``;
    case "de":
      return `❓ Nutze /ask gefolgt von deiner Frage, ${firstName}.\n\nBeispiel: \`/ask Wie bepreise ich mein Produkt?\``;
    case "zh":
      return `❓ 使用 /ask 加上你的问题，${firstName}。\n\n例如：\`/ask 我该如何为产品定价？\``;
    case "ru":
      return `❓ Используй /ask и свой вопрос, ${firstName}.\n\nПример: \`/ask Как мне назначить цену на продукт?\``;
    default:
      return `❓ Use /ask followed by your question, ${firstName}.\n\nExample: \`/ask How do I price my product?\``;
  }
}

export function getGenericError(language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return "⚠️ Une erreur s'est produite. Réessaie dans quelques instants.";
    case "es":
      return "⚠️ Ocurrió un error. Inténtalo de nuevo en unos instantes.";
    case "de":
      return "⚠️ Es ist ein Fehler aufgetreten. Versuch es in ein paar Momenten erneut.";
    case "zh":
      return "⚠️ 出现了一个错误，请稍后再试。";
    case "ru":
      return "⚠️ Произошла ошибка. Попробуй ещё раз через пару минут.";
    default:
      return "⚠️ An error occurred. Please try again in a moment.";
  }
}

export function getRateLimitUserMessage(hoursLeft: number, maxPerUser: number, language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return `⏳ Tu as atteint la limite de *${maxPerUser} messages par jour*.\n\nReviens dans ~${hoursLeft}h pour continuer. Cette limite existe pour garder le service gratuit et durable pour tous. 🙏`;
    case "es":
      return `⏳ Has alcanzado el límite de *${maxPerUser} mensajes por día*.\n\nVuelve en ~${hoursLeft}h para continuar. Este límite existe para mantener el servicio gratuito y sostenible para todos. 🙏`;
    case "de":
      return `⏳ Du hast das Limit von *${maxPerUser} Nachrichten pro Tag* erreicht.\n\nKomm in ~${hoursLeft}Std zurück, um fortzufahren. Dieses Limit sorgt dafür, dass der Service für alle kostenlos bleibt. 🙏`;
    case "zh":
      return `⏳ 你已达到*每日 ${maxPerUser} 条消息*的上限。\n\n请在约 ${hoursLeft} 小时后再来。此限制是为了让服务对所有人保持免费和可持续。🙏`;
    case "ru":
      return `⏳ Ты достиг лимита в *${maxPerUser} сообщений в день*.\n\nВозвращайся через ~${hoursLeft}ч, чтобы продолжить. Этот лимит существует, чтобы сервис оставался бесплатным для всех. 🙏`;
    default:
      return `⏳ You've reached the limit of *${maxPerUser} messages per day*.\n\nCome back in ~${hoursLeft}h to continue. This limit keeps the service free and sustainable for everyone. 🙏`;
  }
}

export function getRateLimitGlobalMessage(hoursLeft: number, language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return `🔒 Le bot a atteint sa limite journalière de messages.\n\nRéessaie dans ~${hoursLeft}h. Merci de ta compréhension !`;
    case "es":
      return `🔒 El bot ha alcanzado su límite diario de mensajes.\n\nInténtalo de nuevo en ~${hoursLeft}h. ¡Gracias por tu comprensión!`;
    case "de":
      return `🔒 Der Bot hat sein tägliches Nachrichtenlimit erreicht.\n\nVersuch es in ~${hoursLeft}Std erneut. Danke für dein Verständnis!`;
    case "zh":
      return `🔒 机器人已达到每日消息上限。\n\n请在约 ${hoursLeft} 小时后重试。感谢理解！`;
    case "ru":
      return `🔒 Бот достиг дневного лимита сообщений.\n\nПопробуй снова через ~${hoursLeft}ч. Спасибо за понимание!`;
    default:
      return `🔒 The bot has reached its daily message limit.\n\nTry again in ~${hoursLeft}h. Thanks for understanding!`;
  }
}

export function getCreatorLine(creator: string, language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return `Ce bot a été créé par ${creator}.`;
    case "es":
      return `Este bot fue creado por ${creator}.`;
    case "de":
      return `Dieser Bot wurde von ${creator} erstellt.`;
    case "zh":
      return `本机器人由 ${creator} 创建。`;
    case "ru":
      return `Этот бот создан ${creator}.`;
    default:
      return `This bot is created by ${creator}.`;
  }
}

export function getStartOwnerText(firstName: string, language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return `🔑 Content de te revoir, *${firstName}* — mon créateur !\n\nTu as un accès illimité à toutes mes fonctionnalités, sans aucune restriction.\n\nCommandes exclusives :\n• /stats — Voir l'activité du bot en temps réel\n\nTout le reste fonctionne normalement. Qu'est-ce qu'on construit aujourd'hui ? 💪`;
    case "es":
      return `🔑 ¡Qué gusto verte de nuevo, *${firstName}* — mi creador!\n\nTienes acceso ilimitado a todas mis funciones, sin restricciones.\n\nComandos exclusivos:\n• /stats — Ver la actividad del bot en tiempo real\n\nTodo lo demás funciona normalmente. ¿Qué construimos hoy? 💪`;
    case "de":
      return `🔑 Schön, dich wiederzusehen, *${firstName}* — mein Schöpfer!\n\nDu hast uneingeschränkten Zugriff auf alle Funktionen.\n\nExklusive Befehle:\n• /stats — Bot-Aktivität in Echtzeit ansehen\n\nAlles andere funktioniert normal. Woran arbeiten wir heute? 💪`;
    case "zh":
      return `🔑 很高兴再次见到你，*${firstName}* —— 我的创造者！\n\n你可以无限制地使用我的所有功能。\n\n专属指令：\n• /stats — 实时查看机器人活动\n\n其余功能一切照常。我们今天要做点什么？💪`;
    case "ru":
      return `🔑 Рад снова видеть тебя, *${firstName}* — мой создатель!\n\nУ тебя неограниченный доступ ко всем функциям, без каких-либо ограничений.\n\nЭксклюзивные команды:\n• /stats — Смотреть активность бота в реальном времени\n\nВсё остальное работает как обычно. Что будем строить сегодня? 💪`;
    default:
      return `🔑 Great to see you again, *${firstName}* — my creator!\n\nYou have unlimited access to all my features, with no restrictions.\n\nExclusive commands:\n• /stats — See real-time bot activity\n\nEverything else works normally. What are we building today? 💪`;
  }
}

export function getStartUserText(firstName: string, language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return `👋 Salut ${firstName} ! Bienvenue sur *Business Advisor AI* — ton coach business personnel.\n\nJe suis là pour t'accompagner sur l'entrepreneuriat, la stratégie, le marketing, les ventes, et tout ce qui fait qu'une entreprise réussit.\n\nCe qui me différencie d'un simple bot : je retiens le contexte de notre conversation, je m'adapte à ta situation, et je te pose des questions pour mieux t'aider.\n\n📋 Tape /help pour voir toutes mes commandes.\n💬 Ou dis-moi simplement où tu en es avec ton projet — on commence là où tu es.\n\n*Alors, c'est quoi ton projet en ce moment ?* 🚀`;
    case "es":
      return `👋 ¡Hola ${firstName}! Bienvenido a *Business Advisor AI* — tu coach de negocios personal.\n\nEstoy aquí para acompañarte en emprendimiento, estrategia, marketing, ventas y todo lo que hace triunfar a una empresa.\n\nLo que me diferencia de un bot cualquiera: recuerdo el contexto de nuestra conversación, me adapto a tu situación y te hago preguntas para ayudarte mejor.\n\n📋 Escribe /help para ver todos mis comandos.\n💬 O simplemente cuéntame en qué punto está tu proyecto — empezamos donde estés.\n\n*Entonces, ¿en qué proyecto estás ahora?* 🚀`;
    case "de":
      return `👋 Hallo ${firstName}! Willkommen bei *Business Advisor AI* — deinem persönlichen Business-Coach.\n\nIch bin hier, um dich bei Unternehmertum, Strategie, Marketing, Vertrieb und allem, was ein Unternehmen erfolgreich macht, zu unterstützen.\n\nWas mich von einem einfachen Bot unterscheidet: Ich merke mir den Kontext unseres Gesprächs, passe mich an deine Situation an und stelle dir Fragen, um dir besser zu helfen.\n\n📋 Tippe /help, um alle meine Befehle zu sehen.\n💬 Oder erzähl mir einfach, wo du mit deinem Projekt stehst — wir starten dort, wo du bist.\n\n*Also, woran arbeitest du gerade?* 🚀`;
    case "zh":
      return `👋 你好，${firstName}！欢迎使用 *Business Advisor AI* —— 你的私人商业教练。\n\n我在这里陪你一起探讨创业、战略、营销、销售，以及一切能让企业成功的要素。\n\n与普通机器人不同的是：我会记住我们对话的上下文，根据你的情况调整建议，并提出问题以更好地帮助你。\n\n📋 输入 /help 查看我的所有指令。\n💬 或者直接告诉我你的项目进展到哪一步了——我们从你当前所在的位置开始。\n\n*那么，你现在的项目是什么？* 🚀`;
    case "ru":
      return `👋 Привет, ${firstName}! Добро пожаловать в *Business Advisor AI* — твоего личного бизнес-коуча.\n\nЯ здесь, чтобы помочь тебе с предпринимательством, стратегией, маркетингом, продажами и всем, что делает бизнес успешным.\n\nЧто отличает меня от обычного бота: я запоминаю контекст нашего разговора, подстраиваюсь под твою ситуацию и задаю вопросы, чтобы лучше тебе помочь.\n\n📋 Напиши /help, чтобы увидеть все мои команды.\n💬 Или просто расскажи, на каком этапе твой проект — начнём оттуда, где ты сейчас.\n\n*Итак, чем ты сейчас занимаешься?* 🚀`;
    default:
      return `👋 Hi ${firstName}! Welcome to *Business Advisor AI* — your personal business coach.\n\nI'm here to support you on entrepreneurship, strategy, marketing, sales, and everything that makes a business succeed.\n\nWhat sets me apart from a simple bot: I remember the context of our conversation, adapt to your situation, and ask questions to help you better.\n\n📋 Type /help to see all my commands.\n💬 Or just tell me where you are with your project — we start where you are.\n\n*So, what's your project right now?* 🚀`;
  }
}

export function getTermsText(creator: string, language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return `Conditions et confidentialité :\n\n• Informations générales et éducatives uniquement — pas un conseil médical, juridique ou fiscal.\n• Ne partage jamais de mots de passe, coordonnées bancaires ou informations très sensibles.\n• Telegram et OpenAI traitent les messages pour fournir ce service.\n• Le contexte de conversation est gardé uniquement en mémoire pour la personnalisation et est perdu au redémarrage du service.\n• Pour toute suppression ou question de confidentialité, contacte ${creator}.\n• En cas de danger immédiat, contacte les services d'urgence locaux.`;
    case "es":
      return `Términos y privacidad:\n\n• Solo información general y educativa — no es asesoramiento médico, legal o fiscal.\n• Nunca compartas contraseñas, datos de pago ni información muy sensible.\n• Telegram y OpenAI procesan los mensajes para prestar este servicio.\n• El contexto de la conversación se guarda solo en memoria para personalizar y se pierde al reiniciar el servicio.\n• Para eliminar datos o consultas de privacidad, contacta a ${creator}.\n• En caso de peligro inmediato, contacta a los servicios de emergencia locales.`;
    case "de":
      return `Nutzungsbedingungen & Datenschutz:\n\n• Nur allgemeine, edukative Informationen — keine medizinische, rechtliche oder steuerliche Beratung.\n• Teile niemals Passwörter, Zahlungsdaten oder hochsensible Informationen.\n• Telegram und OpenAI verarbeiten Nachrichten, um diesen Dienst bereitzustellen.\n• Der Gesprächskontext wird nur im Arbeitsspeicher für die Personalisierung gehalten und geht bei einem Neustart verloren.\n• Für Löschung oder Datenschutzfragen kontaktiere ${creator}.\n• Bei unmittelbarer Gefahr kontaktiere die örtlichen Notdienste.`;
    case "zh":
      return `条款与隐私说明：\n\n• 仅提供一般性教育信息——不构成医疗、法律或税务建议。\n• 切勿分享密码、支付信息或高度敏感数据。\n• Telegram 和 OpenAI 会处理消息以提供本服务。\n• 对话上下文仅保存在内存中用于个性化，服务重启后即丢失。\n• 如需删除数据或有隐私相关问题，请联系 ${creator}。\n• 如遇紧急危险，请联系当地急救服务。`;
    case "ru":
      return `Условия и конфиденциальность:\n\n• Только общая образовательная информация — не медицинская, юридическая или налоговая консультация.\n• Никогда не делись паролями, платёжными данными или крайне чувствительной информацией.\n• Telegram и OpenAI обрабатывают сообщения для предоставления этой услуги.\n• Контекст разговора хранится только в памяти для персонализации и теряется при перезапуске сервиса.\n• По вопросам удаления данных или конфиденциальности обращайся к ${creator}.\n• В случае непосредственной опасности обратись в местные экстренные службы.`;
    default:
      return `Terms & privacy notice:\n\n• General educational information only — not medical, legal, tax, or financial advice.\n• Never share passwords, payment details, or highly sensitive information.\n• Telegram and OpenAI process messages to deliver this service.\n• Conversation context is kept in memory only for personalization and is lost when the service restarts.\n• For deletion or privacy questions, contact ${creator}.\n• In immediate danger, contact local emergency services.`;
  }
}

export function getPrivacyText(creator: string, language: SupportedLanguage): string {
  switch (language) {
    case "fr":
      return `Confidentialité : nous minimisons les données et ne stockons pas inutilement les conversations dans une base de données. Telegram et OpenAI peuvent traiter les messages pour fournir les réponses. Ne partage pas d'informations sensibles. Contacte ${creator} pour toute question de confidentialité ou demande de suppression.`;
    case "es":
      return `Privacidad: minimizamos los datos y no almacenamos conversaciones innecesariamente en una base de datos. Telegram y OpenAI pueden procesar los mensajes para dar respuestas. No envíes información sensible. Contacta a ${creator} para consultas de privacidad o solicitudes de eliminación.`;
    case "de":
      return `Datenschutz: Wir minimieren Daten und speichern Gespräche nicht unnötig in einer Datenbank. Telegram und OpenAI können Nachrichten verarbeiten, um Antworten zu liefern. Sende keine sensiblen Informationen. Kontaktiere ${creator} für Datenschutzfragen oder Löschanfragen.`;
    case "zh":
      return `隐私说明：我们尽量减少数据收集，不会将对话不必要地存储在数据库中。Telegram 和 OpenAI 可能会处理消息以生成回复。请勿发送敏感信息。如有隐私相关问题或删除请求，请联系 ${creator}。`;
    case "ru":
      return `Конфиденциальность: мы минимизируем данные и не храним переписку в базе данных без необходимости. Telegram и OpenAI могут обрабатывать сообщения для формирования ответов. Не отправляй конфиденциальную информацию. По вопросам конфиденциальности или удаления данных обращайся к ${creator}.`;
    default:
      return `Privacy: we minimize data and do not needlessly store conversations in a database. Telegram and OpenAI may process messages to provide replies. Do not send secrets. Contact ${creator} for privacy questions or deletion requests.`;
  }
}