import { openai } from "./openai-client.js";

const SYSTEM_PROMPT = `Tu es un assistant expert en business, entrepreneuriat et stratégie d'entreprise. 
Tu fournis des conseils pratiques, précis et actionnables. Tu parles en français sauf si l'utilisateur écrit dans une autre langue. 
Tu es concis (réponses de 200-400 mots max pour Telegram), structuré, et tu utilises des emojis avec modération pour rendre le texte lisible.
Tu t'adresses à des entrepreneurs, créateurs d'entreprise et professionnels qui veulent améliorer leurs compétences business.`;

async function askAI(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 600,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });
  return response.choices[0]?.message?.content ?? "Désolé, je n'ai pas pu générer une réponse.";
}

// Conversation memory per user (simple in-memory, max 10 messages)
const userConversations = new Map<number, Array<{ role: "user" | "assistant"; content: string }>>();

export async function handleStart(): Promise<string> {
  return `🚀 *Bienvenue sur Business Advisor AI !*

Je suis ton assistant personnel en entrepreneuriat et stratégie d'entreprise, alimenté par l'IA.

Je peux t'aider à :
💡 Générer des idées de business
📈 Développer tes stratégies de croissance
🎯 Améliorer ton marketing et tes ventes
📚 Apprendre grâce à des études de cas réels
🧠 Comprendre les concepts business clés

Tape /help pour voir toutes mes commandes, ou pose-moi directement ta question !`;
}

export async function handleHelp(): Promise<string> {
  return `📋 *Toutes mes commandes :*

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
/glossary — Explique un terme (ROI, EBITDA, CAC...)
/news — Actualité économique importante

❓ *Interaction*
/ask — Pose n'importe quelle question à l'IA
/feedback — Envoie ton avis ou suggestion

Tu peux aussi m'écrire directement sans commande ! 😊`;
}

export async function handleAdvice(): Promise<string> {
  return await askAI(
    "Donne-moi un conseil business pratique et actionnable du jour pour un entrepreneur. Rends-le concret, avec un exemple d'application immédiate. Format : titre court en gras + explication + exemple."
  );
}

export async function handleIdea(): Promise<string> {
  return await askAI(
    "Génère une idée de business originale et viable pour 2024-2025. Présente : le concept, le problème qu'il résout, la cible client, le modèle de revenus potentiel, et pourquoi c'est le bon moment pour le lancer."
  );
}

export async function handleStrategy(): Promise<string> {
  return await askAI(
    "Explique une stratégie de croissance ou de vente puissante utilisée par des entreprises à succès. Donne le nom de la stratégie, comment elle fonctionne, un exemple d'entreprise qui l'a appliquée, et comment un entrepreneur peut l'adapter."
  );
}

export async function handleMarketing(): Promise<string> {
  return await askAI(
    "Donne un conseil marketing pratique et actionnable. Focus sur une tactique concrète qu'un entrepreneur peut appliquer cette semaine pour attirer plus de clients ou augmenter sa visibilité."
  );
}

export async function handleSales(): Promise<string> {
  return await askAI(
    "Partage une technique de vente efficace et éprouvée. Explique le principe psychologique derrière, donne un exemple de dialogue ou de script, et dis dans quel contexte l'utiliser."
  );
}

export async function handleCase(): Promise<string> {
  return await askAI(
    "Analyse le parcours et le succès d'une entreprise connue (choisis une variée à chaque fois : startup tech, retail, service, etc.). Format : nom + secteur, contexte de départ, défi principal, stratégie clé qui a tout changé, résultats, leçon applicable."
  );
}

export async function handleBook(): Promise<string> {
  return await askAI(
    "Recommande un livre sur le business, l'entrepreneuriat, le marketing ou le leadership. Donne : titre, auteur, pourquoi ce livre est incontournable, l'idée principale, et la leçon la plus précieuse qu'on en tire."
  );
}

export async function handleQuote(): Promise<string> {
  return await askAI(
    "Partage une citation inspirante d'un entrepreneur, investisseur ou leader d'entreprise célèbre. Donne la citation en italique, le nom et le contexte de la personne, puis explique pourquoi cette citation est puissante et comment l'appliquer."
  );
}

export async function handleQuiz(): Promise<string> {
  return await askAI(
    "Crée une question de quiz business avec 4 choix de réponses (A, B, C, D). La question doit porter sur un concept clé en entrepreneuriat, marketing, finance ou stratégie. Format : question, les 4 options, puis après une ligne vide indique la bonne réponse et explique pourquoi."
  );
}

export async function handleGlossary(term?: string): Promise<string> {
  const subject = term
    ? `Explique le terme business "${term}" de manière claire et accessible.`
    : "Choisis un terme business important (ROI, EBITDA, CAC, LTV, MVP, Burn Rate, etc.) et explique-le.";
  return await askAI(
    `${subject} Format : définition simple, formule si applicable, exemple concret, et pourquoi c'est important pour un entrepreneur.`
  );
}

export async function handleNews(): Promise<string> {
  return await askAI(
    "Résume une tendance ou actualité économique/business importante de ces derniers mois. Explique ce que c'est, pourquoi ça compte pour les entrepreneurs, et quelles opportunités ou risques cela crée."
  );
}

export async function handleAsk(question: string): Promise<string> {
  if (!question.trim()) {
    return "❓ Utilise /ask suivi de ta question.\n\nExemple : `/ask Comment fixer le prix de mon produit ?`";
  }
  return await askAI(question);
}

export async function handleFreeText(userId: number, text: string): Promise<string> {
  // Maintain conversation history
  let history = userConversations.get(userId) ?? [];
  history.push({ role: "user", content: text });

  // Keep last 10 messages to avoid token overflow
  if (history.length > 10) {
    history = history.slice(-10);
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 600,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
    ],
  });

  const reply = response.choices[0]?.message?.content ?? "Désolé, je n'ai pas pu répondre.";
  history.push({ role: "assistant", content: reply });
  userConversations.set(userId, history);
  return reply;
}

export async function handleFeedback(feedback: string): Promise<string> {
  if (!feedback.trim()) {
    return "📝 Envoie ton avis ou suggestion avec /feedback suivi de ton message.\n\nExemple : `/feedback J'adorerais un mode quiz quotidien !`";
  }
  // Just acknowledge — in a real app you'd save to DB
  return `✅ Merci pour ton retour !\n\n_"${feedback}"_\n\nTon avis est précieux et nous aide à améliorer le bot. 🙏`;
}
