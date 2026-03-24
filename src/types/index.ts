export interface WordMeaning {
  word: string;
  meaning: string;
  meaningHindi: string;
}

export interface Verse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  wordMeanings: WordMeaning[];
  translationEn: string;
  translationHi: string;
  context: string;
  contextHindi: string;
}

export interface Chapter {
  chapter: number;
  name: string;
  nameHindi: string;
  nameMeaning: string;
  verseCount: number;
  summary: string;
}

export interface Scripture {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  chapters: Chapter[];
}

export type Language = "en" | "hi";

export type AIProvider = "gemini" | "groq" | "openai";

export interface ExplanationRequest {
  verseId: string;
  mode: "standard" | "eli10";
  language: Language;
  question?: string;
}

export interface ExplanationResponse {
  explanation: string;
  followUp?: string[];
}
