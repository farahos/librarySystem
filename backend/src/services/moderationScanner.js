const rules = [
  {
    flag: "pornography",
    weight: 45,
    pattern: /\b(porn|porno|xxx|nude|nudes|explicit sex|sex tape)\b/i,
  },
  {
    flag: "sexual_content",
    weight: 30,
    pattern: /\b(sexual|erotic|incest|orgasm|fetish)\b/i,
  },
  {
    flag: "explicit_language",
    weight: 20,
    pattern: /\b(fuck|shit|bitch|cunt|asshole)\b/i,
  },
  {
    flag: "hate_speech",
    weight: 50,
    pattern: /\b(kill all|exterminate|subhuman|racial slur|ethnic slur)\b/i,
  },
  {
    flag: "violent_threats",
    weight: 55,
    pattern: /\b(i will kill|murder you|shoot you|stab you|bomb them|death threat)\b/i,
  },
  {
    flag: "spam",
    weight: 25,
    pattern: /(https?:\/\/\S+.*){3,}|(\bfree money\b|\bclick here\b|\btelegram\b|\bwhatsapp\b.*\bdeal\b)/i,
  },
];

export function scanContent(...parts) {
  const text = parts.filter(Boolean).join(" ").slice(0, 20000);
  const flags = [];
  let score = 0;

  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      flags.push(rule.flag);
      score += rule.weight;
    }
  }

  const repeatedCharacters = /(.)\1{12,}/.test(text);
  if (repeatedCharacters) {
    flags.push("spam_patterns");
    score += 15;
  }

  const normalizedScore = Math.min(100, score);
  const risk = normalizedScore >= 70 ? "high" : normalizedScore >= 35 ? "medium" : "low";

  return {
    score: normalizedScore,
    flags: [...new Set(flags)],
    risk,
  };
}

export function reasonFromScan(scan) {
  if (scan.flags.includes("pornography")) return "sexual_content";
  if (scan.flags.includes("sexual_content")) return "sexual_content";
  if (scan.flags.includes("hate_speech")) return "hate_speech";
  if (scan.flags.includes("violent_threats")) return "violence";
  if (scan.flags.includes("spam") || scan.flags.includes("spam_patterns")) return "spam";
  return "other";
}
