import type { Verse, Language, ExplanationResponse } from "@/types";

function buildPrompt(
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
  question?: string
): Promise<ExplanationResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Fallback: return curated explanation from the data itself
    return getFallbackExplanation(verse, mode, language);
  }

  const prompt = buildPrompt(verse, mode, language, question);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.status);
      return getFallbackExplanation(verse, mode, language);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

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
