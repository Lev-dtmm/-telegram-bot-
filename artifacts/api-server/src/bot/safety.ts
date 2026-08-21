const dangerousPatterns = [
  /\b(suicide|suicidal|kill myself|end my life|self[- ]?harm|hurt myself|cut myself)\b/i,
  /\b(me suicider|suicide|mettre fin à mes jours|m['’]auto[- ]?mutiler|m['’]infliger du mal)\b/i,
  /\b(selbstmord|suizid|mich umbringen|selbstverletzung)\b/i,
  /\b(suicidio|matarme|hacerme daño|autolesion)\b/i,
  /\b(самоубий|суицид|покончить с собой|навредить себе)\b/i,
  /自杀|自殘|伤害自己/,
];

export function isDangerousMessage(text: string): boolean {
  return dangerousPatterns.some((pattern) => pattern.test(text));
}

export function safetyResponse(language: string): string {
  switch (language) {
    case "fr":
      return "Je suis vraiment désolé que tu traverses ça. Je ne peux pas gérer une situation de danger, mais tu n'as pas à rester seul(e). En France, appelle le **3114** (prévention du suicide, 24h/24 et 7j/7), le **3115** (urgence médicale) ou le **112/15** si le danger est immédiat. Si possible, rapproche-toi maintenant d'une personne de confiance.";
    case "de":
      return "Es tut mir leid, dass du das gerade erlebst. Bitte bleib nicht allein: In einem akuten Notfall ruf **112** an oder wende dich sofort an eine Vertrauensperson. Ich kann eine solche Krise nicht professionell begleiten.";
    case "es":
      return "Siento mucho que estés pasando por esto. No tienes que estar a solas: si hay peligro inmediato llama al **112** y contacta ahora con una persona de confianza. No puedo gestionar una crisis de forma profesional.";
    case "zh":
      return "很抱歉你正在经历这些。请不要独自面对：如果有即时危险，请立即拨打当地急救电话，并联系一位信任的人。我无法代替专业危机援助。";
    case "ru":
      return "Мне жаль, что тебе сейчас так тяжело. Пожалуйста, не оставайся один(одна): при непосредственной опасности немедленно позвони в местную экстренную службу и свяжись с близким человеком. Я не могу заменить профессиональную кризисную помощь.";
    default:
      return "I’m really sorry you’re going through this. Please don’t stay alone: if you are in immediate danger, call **112** or your local emergency number and contact someone you trust now. I can’t provide professional crisis support.";
  }
}
