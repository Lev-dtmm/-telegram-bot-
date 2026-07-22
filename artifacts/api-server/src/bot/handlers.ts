import OpenAI from "openai";
import {
  getOrCreateProfile,
  addToHistory,
  updateBusinessContext,
} from "./user-profiles.js";

if (!process.env["OPENAI_API_KEY"]) {
  throw new Error("OPENAI_API_KEY environment variable is required.");
}

const openai = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(firstName: string, businessContext: string): string {
  return `Tu es un coach business personnel appelé "BusinessAI", qui accompagne ${firstName} avec bienveillance, précision et chaleur humaine.

TON IDENTITÉ DE COACH :
- Tu parles directement à ${firstName} en utilisant son prénom naturellement (pas à chaque phrase, juste quand c'est naturel).
- Tu es à la fois expert business ET humain : tu comprends que derrière chaque question il y a un entrepreneur avec des doutes, des ambitions et parfois du stress.
- Tu valides les émotions avant de donner des conseils. Si quelqu'un est découragé, tu le reconnais d'abord.
- Tu poses UNE question de suivi à la fin de chaque réponse pour approfondir et montrer que tu es vraiment engagé dans sa réussite.
- Tu adaptes ton ton : si ${firstName} est enthousiaste, tu l'es aussi. S'il est découragé, tu es chaleureux et encourageant.
- Tu célèbres les victoires, même petites ("C'est une excellente décision", "Tu vas dans la bonne direction").
- Tu es honnête : si une idée a des risques, tu les mentionnes avec tact plutôt que de juste acquiescer.

STYLE DE RÉPONSE :
- Réponses de 150-350 mots maximum (format Telegram).
- Utilise des retours à la ligne pour aérer, pas de murs de texte.
- Emojis avec modération (1-3 par réponse max), toujours pertinents.
- Commence parfois par reconnaître ce que ${firstName} a dit avant de répondre.
- Langue : français par défaut, mais tu t'adaptes si ${firstName} écrit dans une autre langue.

MÉMOIRE DU CONTEXTE :
${businessContext ? `Ce que tu sais sur ${firstName} et son projet : ${businessContext}` : `Tu ne connais pas encore le projet de ${firstName} — pose des questions pour découvrir.`}

RÈGLES ABSOLUES :
- Ne jamais donner de conseils juridiques ou fiscaux définitifs (toujours recommander un professionnel).
- Ne jamais inventer des chiffres ou statistiques précises sans les contextualiser.
- Ne jamais être condescendant ou faire sentir ${firstName} incompétent.`;
}

// ─── Core AI call ─────────────────────────────────────────────────────────────

async function askAI(
  prompt: string,
  firstName: string,
  businessContext: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<string> {
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt(firstName, businessContext) },
    ...history,
    { role: "user", content: prompt },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 600,
    messages,
  });

  return (
    response.choices[0]?.message?.content ??
    "Désolé, je n'ai pas pu générer une réponse."
  );
}

// ─── Context extractor (runs silently to update business context) ─────────────

async function extractContext(
  userMessage: string,
  assistantResponse: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 80,
    messages: [
      {
        role: "system",
        content:
          "Extrait en max 1-2 phrases les infos utiles sur le projet/business/situation de l'utilisateur (secteur, stade, objectif, défi). Si rien d'utile, réponds juste: 'rien'.",
      },
      {
        role: "user",
        content: `Message utilisateur: "${userMessage}"\nRéponse assistant: "${assistantResponse}"`,
      },
    ],
  });
  const extracted =
    response.choices[0]?.message?.content?.trim() ?? "rien";
  return extracted === "rien" ? "" : extracted;
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function handleStart(firstName: string): Promise<string> {
  return `👋 Salut ${firstName} ! Bienvenue sur *Business Advisor AI* — ton coach business personnel.

Je suis là pour t'accompagner sur l'entrepreneuriat, la stratégie, le marketing, les ventes, et tout ce qui fait qu'une entreprise réussit.

Ce qui me différencie d'un simple bot : je retiens le contexte de notre conversation, je m'adapte à ta situation, et je te pose des questions pour mieux t'aider.

📋 Tape /help pour voir toutes mes commandes.
💬 Ou dis-moi simplement où tu en es avec ton projet — on commence là où tu es.

*Alors, c'est quoi ton projet en ce moment ?* 🚀`;
}

export async function handleHelp(): Promise<string> {
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
}

export async function handleAdvice(
  userId: number,
  firstName: string
): Promise<string> {
  const profile = getOrCreateProfile(userId, firstName);
  return await askAI(
    `Donne à ${firstName} un conseil business pratique et actionnable du jour, adapté à son contexte si tu le connais. Rends-le concret avec une action immédiate possible. Termine par une question pour comprendre où il en est.`,
    firstName,
    profile.businessContext,
    profile.conversationHistory.slice(-4)
  );
}

export async function handleIdea(
  userId: number,
  firstName: string
): Promise<string> {
  const profile = getOrCreateProfile(userId, firstName);
  return await askAI(
    `Génère une idée de business originale et viable pour 2024-2025, idéalement adaptée au contexte de ${firstName} si tu le connais. Présente : le concept, le problème résolu, la cible, le modèle de revenus, et pourquoi maintenant. Termine en demandant ce que ${firstName} en pense.`,
    firstName,
    profile.businessContext,
    profile.conversationHistory.slice(-4)
  );
}

export async function handleStrategy(
  userId: number,
  firstName: string
): Promise<string> {
  const profile = getOrCreateProfile(userId, firstName);
  return await askAI(
    `Explique à ${firstName} une stratégie de croissance ou de vente puissante, adaptée à son contexte si possible. Donne le nom, comment ça marche, un exemple réel, et comment l'adapter. Termine par une question sur sa situation actuelle.`,
    firstName,
    profile.businessContext,
    profile.conversationHistory.slice(-4)
  );
}

export async function handleMarketing(
  userId: number,
  firstName: string
): Promise<string> {
  const profile = getOrCreateProfile(userId, firstName);
  return await askAI(
    `Donne à ${firstName} un conseil marketing pratique et actionnable cette semaine. Focus sur une tactique concrète pour attirer plus de clients. Adapte au contexte de ${firstName} si tu le connais. Termine par une question sur sa cible ou son canal actuel.`,
    firstName,
    profile.businessContext,
    profile.conversationHistory.slice(-4)
  );
}

export async function handleSales(
  userId: number,
  firstName: string
): Promise<string> {
  const profile = getOrCreateProfile(userId, firstName);
  return await askAI(
    `Partage avec ${firstName} une technique de vente efficace et éprouvée. Explique le principe psychologique, donne un exemple de dialogue, et dis dans quel contexte l'utiliser. Adapte à son secteur si connu. Termine par une question sur son processus de vente actuel.`,
    firstName,
    profile.businessContext,
    profile.conversationHistory.slice(-4)
  );
}

export async function handleCase(
  userId: number,
  firstName: string
): Promise<string> {
  const profile = getOrCreateProfile(userId, firstName);
  return await askAI(
    `Analyse le succès d'une entreprise connue pour ${firstName} (varie les secteurs). Format : nom + secteur, contexte de départ, défi principal, stratégie clé, résultats, leçon applicable. Termine par demander à ${firstName} comment cette leçon s'applique à son projet.`,
    firstName,
    profile.businessContext,
    profile.conversationHistory.slice(-4)
  );
}

export async function handleBook(
  userId: number,
  firstName: string
): Promise<string> {
  const profile = getOrCreateProfile(userId, firstName);
  return await askAI(
    `Recommande un livre business à ${firstName}, idéalement adapté à son contexte. Donne : titre, auteur, pourquoi ce livre, l'idée principale, la leçon la plus précieuse. Termine par demander s'il a déjà lu des livres business marquants.`,
    firstName,
    profile.businessContext,
    profile.conversationHistory.slice(-4)
  );
}

export async function handleQuote(firstName: string): Promise<string> {
  return await askAI(
    `Partage une citation inspirante d'un entrepreneur ou leader célèbre avec ${firstName}. Donne la citation en italique, la personne, son contexte, et pourquoi cette citation est puissante aujourd'hui. Termine par demander ce que ça lui évoque.`,
    firstName,
    "",
    []
  );
}

export async function handleQuiz(firstName: string): Promise<string> {
  return await askAI(
    `Crée une question de quiz business pour ${firstName} avec 4 choix (A, B, C, D) sur un concept clé en entrepreneuriat, marketing, finance ou stratégie. Après les options, révèle la bonne réponse et explique pourquoi. Rends ça engageant !`,
    firstName,
    "",
    []
  );
}

export async function handleGlossary(
  firstName: string,
  term?: string
): Promise<string> {
  const subject = term
    ? `Explique le terme business "${term}" à ${firstName}`
    : `Choisis un terme business important (ROI, EBITDA, CAC, LTV, MVP, Burn Rate, etc.) et explique-le à ${firstName}`;
  return await askAI(
    `${subject}. Format : définition simple, formule si applicable, exemple concret, pourquoi c'est important. Termine par demander si ${firstName} utilise déjà ce concept.`,
    firstName,
    "",
    []
  );
}

export async function handleNews(
  userId: number,
  firstName: string
): Promise<string> {
  const profile = getOrCreateProfile(userId, firstName);
  return await askAI(
    `Résume une tendance ou actualité économique/business importante pour ${firstName}. Explique ce que c'est, pourquoi ça compte pour les entrepreneurs, et quelles opportunités ou risques cela crée. Termine par demander si cette tendance impacte son secteur.`,
    firstName,
    profile.businessContext,
    profile.conversationHistory.slice(-4)
  );
}

export async function handleAsk(
  userId: number,
  firstName: string,
  question: string
): Promise<string> {
  if (!question.trim()) {
    return `❓ Utilise /ask suivi de ta question, ${firstName}.\n\nExemple : \`/ask Comment fixer le prix de mon produit ?\``;
  }
  const profile = getOrCreateProfile(userId, firstName);
  return await askAI(
    question,
    firstName,
    profile.businessContext,
    profile.conversationHistory.slice(-6)
  );
}

export async function handleFreeText(
  userId: number,
  firstName: string,
  text: string
): Promise<string> {
  const profile = getOrCreateProfile(userId, firstName);

  // Add user message to history
  addToHistory(userId, "user", text);

  const reply = await askAI(
    text,
    firstName,
    profile.businessContext,
    profile.conversationHistory.slice(-10)
  );

  // Add assistant reply to history
  addToHistory(userId, "assistant", reply);

  // Silently extract and update business context (fire and forget)
  extractContext(text, reply)
    .then((ctx) => {
      if (ctx) updateBusinessContext(userId, ctx);
    })
    .catch(() => {/* ignore */});

  return reply;
}

export async function handleFeedback(
  firstName: string,
  feedback: string
): Promise<string> {
  if (!feedback.trim()) {
    return `📝 Envoie ton avis avec /feedback suivi de ton message, ${firstName}.\n\nExemple : \`/feedback J'adorerais un mode quiz quotidien !\``;
  }
  return `✅ Merci ${firstName} pour ton retour !\n\n_"${feedback}"_\n\nC'est exactement ce genre de feedback qui aide à améliorer le bot. Je l'ai bien noté. 🙏`;
}
