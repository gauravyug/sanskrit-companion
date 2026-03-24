import type { Verse, Language, ExplanationResponse, AIProvider } from "@/types";

// ── Provider config ───────────────────────────────────────────────────
interface ProviderConfig {
  name: string;
  apiUrl: string;
  model: string;
  getHeaders: (key: string) => Record<string, string>;
  buildBody: (prompt: string) => Record<string, unknown>;
  extractContent: (data: Record<string, unknown>) => string;
}

const providers: Record<AIProvider, ProviderConfig> = {
  gemini: {
    name: "Google Gemini",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    model: "gemini-2.0-flash",
    getHeaders: () => ({ "Content-Type": "application/json" }),
    buildBody: (prompt: string) => ({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
    }),
    extractContent: (data) => {
      const candidates = data.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined;
      return candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    },
  },
  groq: {
    name: "Groq",
    apiUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.1-70b-versatile",
    getHeaders: (key: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    }),
    buildBody: (prompt: string) => ({
      model: "llama-3.1-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    }),
    extractContent: (data) => {
      const choices = data.choices as Array<{ message?: { content?: string } }> | undefined;
      return choices?.[0]?.message?.content ?? "";
    },
  },
  openai: {
    name: "OpenAI",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    getHeaders: (key: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    }),
    buildBody: (prompt: string) => ({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    }),
    extractContent: (data) => {
      const choices = data.choices as Array<{ message?: { content?: string } }> | undefined;
      return choices?.[0]?.message?.content ?? "";
    },
  },
};

// ── Resolve which provider to use ─────────────────────────────────────
function getAvailableProvider(preferred?: AIProvider): { provider: ProviderConfig; key: string } | null {
  const order: AIProvider[] = preferred
    ? [preferred, "gemini", "groq", "openai"]
    : ["gemini", "groq", "openai"];

  const keyMap: Record<AIProvider, string | undefined> = {
    gemini: process.env.GEMINI_API_KEY,
    groq: process.env.GROQ_API_KEY,
    openai: process.env.OPENAI_API_KEY,
  };

  for (const id of order) {
    const key = keyMap[id];
    if (key) return { provider: providers[id], key };
  }
  return null;
}

// ── Prompt builder ────────────────────────────────────────────────────
  verse: Verse,
  mode: "standard" | "eli10",
  language: Language,
  question?: string
): string {
  const lang = language === "hi" ? "Hindi" : "English";
  const verseRef = `Bhagavad Gita Chapter ${verse.chapter}, Verse ${verse.verse}`;

  const base = `You are an expert scholar of Sanskrit scriptures, particularly the Bhagavad Gita.
You provide authentic, respectful, and insightful explanations.

Verse reference: ${verseRef}
Sanskrit: ${verse.sanskrit}
Translation: ${verse.translationEn}

Respond in ${lang}.`;

  if (question) {
    return `${base}

The user asks about this verse: "${question}"

Provide a clear, helpful answer. Include relevant philosophical context. At the end, suggest 2-3 follow-up questions the user might find interesting.

Format your response as JSON: { "explanation": "...", "followUp": ["...", "..."] }`;
  }

  if (mode === "eli10") {
    return `${base}

Explain this verse as if speaking to a curious 10-year-old child. Use simple words, fun analogies, and relatable examples from everyday life. Make it engaging and easy to understand. Keep it under 200 words.

At the end, suggest 2-3 simple follow-up questions a child might ask.

Format your response as JSON: { "explanation": "...", "followUp": ["...", "..."] }`;
  }

  return `${base}

Provide a rich explanation covering:
1. The core teaching of this verse
2. Philosophical significance
3. How it connects to everyday life
4. Historical/narrative context in the Mahabharata

Keep it under 300 words. At the end, suggest 2-3 follow-up questions.

Format your response as JSON: { "explanation": "...", "followUp": ["...", "..."] }`;
}

export async function getAIExplanation(
  verse: Verse,
  mode: "standard" | "eli10",
  language: Language,
  question?: string,
  preferredProvider?: AIProvider,
): Promise<ExplanationResponse> {
  const resolved = getAvailableProvider(preferredProvider);

  if (!resolved) {
    return getFallbackExplanation(verse, mode, language);
  }

  const { provider, key } = resolved;
  const prompt = buildPrompt(verse, mode, language, question);

  try {
    // Gemini uses API key as query param
    const url = provider === providers.gemini
      ? `${provider.apiUrl}?key=${key}`
      : provider.apiUrl;

    const response = await fetch(url, {
      method: "POST",
      headers: provider.getHeaders(key),
      body: JSON.stringify(provider.buildBody(prompt)),
    });

    if (!response.ok) {
      console.error(`${provider.name} API error:`, response.status);
      return getFallbackExplanation(verse, mode, language);
    }

    const data = await response.json();
    const content = provider.extractContent(data);

    // Try to parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        explanation: parsed.explanation || content,
        followUp: parsed.followUp || [],
      };
    }

    return { explanation: content, followUp: [] };
  } catch (error) {
    console.error("AI explanation error:", error);
    return getFallbackExplanation(verse, mode, language);
  }
}

function getFallbackExplanation(
  verse: Verse,
  mode: "standard" | "eli10",
  language: Language
): ExplanationResponse {
  const context = language === "hi" ? verse.contextHindi : verse.context;
  const translation =
    language === "hi" ? verse.translationHi : verse.translationEn;

  if (mode === "eli10") {
    const prefix =
      language === "hi"
        ? "🌟 सरल भाषा में:\n\n"
        : "🌟 In simple words:\n\n";
    const suffix =
      language === "hi"
        ? "\n\n💡 यह श्लोक हमें बताता है कि "
        : "\n\n💡 This verse teaches us that ";
    return {
      explanation: `${prefix}${translation}${suffix}${context}`,
      followUp:
        language === "hi"
          ? [
              "इस श्लोक का दैनिक जीवन में क्या महत्व है?",
              "कृष्ण ने यह क्यों कहा?",
              "इसी विषय पर और कौन से श्लोक हैं?",
            ]
          : [
              "How can I apply this in daily life?",
              "Why did Krishna say this?",
              "What other verses relate to this teaching?",
            ],
    };
  }

  return {
    explanation: `${translation}\n\n📖 ${context}`,
    followUp:
      language === "hi"
        ? [
            "इस श्लोक का गहरा अर्थ क्या है?",
            "इसकी दैनिक जीवन में क्या प्रासंगिकता है?",
            "इस अध्याय के अन्य महत्वपूर्ण श्लोक कौन से हैं?",
          ]
        : [
            "What is the deeper meaning of this verse?",
            "How is this relevant in modern life?",
            "What are other important verses in this chapter?",
          ],
  };
}
