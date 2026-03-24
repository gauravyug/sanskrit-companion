import { NextRequest, NextResponse } from "next/server";
import { getVerseById } from "@/lib/search";
import { getAIExplanation } from "@/lib/ai";
import type { Language, AIProvider } from "@/types";

const validProviders = new Set<AIProvider>(["gemini", "groq", "openai"]);

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { verseId, mode, language, question, provider } = body as {
    verseId?: string;
    mode?: string;
    language?: string;
    question?: string;
    provider?: string;
  };

  if (!verseId || typeof verseId !== "string") {
    return NextResponse.json(
      { error: "verseId is required" },
      { status: 400 }
    );
  }

  const verse = await getVerseById(verseId);
  if (!verse) {
    return NextResponse.json({ error: "Verse not found" }, { status: 404 });
  }

  const safeMode = mode === "eli10" ? "eli10" : "standard";
  const safeLang: Language = language === "hi" ? "hi" : "en";
  const safeQuestion =
    question && typeof question === "string"
      ? question.slice(0, 500)
      : undefined;
  const safeProvider = provider && validProviders.has(provider as AIProvider)
    ? (provider as AIProvider)
    : undefined;

  const result = await getAIExplanation(verse, safeMode, safeLang, safeQuestion, safeProvider);

  // Debug: indicate which source was used
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasGroq = !!process.env.GROQ_API_KEY;
  const hasOpenai = !!process.env.OPENAI_API_KEY;

  return NextResponse.json({
    ...result,
    _debug: {
      providers: { gemini: hasGemini, groq: hasGroq, openai: hasOpenai },
      preferredProvider: safeProvider ?? "auto",
    },
  });
}
