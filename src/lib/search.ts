import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import versesData from "@/data/verses.json";
import type { Verse, WordMeaning } from "@/types";

// ── JSON fallback (used when Supabase is not configured) ──────────────
const localVerses: Verse[] = versesData as Verse[];

// ── Helpers: transform Supabase rows → Verse type ─────────────────────
interface VerseRow {
  id: string;
  scripture_id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation_en: string;
  translation_hi: string;
  context: string;
  context_hindi: string;
  word_meanings?: { word: string; meaning: string; meaning_hindi: string; position: number }[];
}

function rowToVerse(row: VerseRow): Verse {
  const wm: WordMeaning[] = (row.word_meanings ?? [])
    .sort((a, b) => a.position - b.position)
    .map((w) => ({ word: w.word, meaning: w.meaning, meaningHindi: w.meaning_hindi }));

  return {
    id: row.id,
    book: row.scripture_id,
    chapter: row.chapter,
    verse: row.verse,
    sanskrit: row.sanskrit,
    transliteration: row.transliteration,
    wordMeanings: wm,
    translationEn: row.translation_en,
    translationHi: row.translation_hi,
    context: row.context,
    contextHindi: row.context_hindi,
  };
}

// ── Public API (async, Supabase-first with JSON fallback) ─────────────

export async function searchVerses(query: string): Promise<Verse[]> {
  if (!query || query.trim().length === 0) return getAllVerses();

  const q = query.toLowerCase().trim();

  // Reference match (e.g. "2.47", "bg 2.47")
  const refMatch = q.match(/(?:bg[- ]?)?(\d+)[.:,](\d+)/);
  if (refMatch) {
    const chapter = parseInt(refMatch[1], 10);
    const verse = parseInt(refMatch[2], 10);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase!
          .from("verses")
          .select("*, word_meanings(*)")
          .eq("chapter", chapter)
          .eq("verse", verse);
        if (!error && data && data.length > 0) return data.map(rowToVerse);
        if (error) console.error("Supabase ref search error:", error.message);
      } catch (e) {
        console.error("Supabase ref search exception:", e);
      }
    }
    const found = localVerses.filter((v) => v.chapter === chapter && v.verse === verse);
    if (found.length > 0) return found;
  }

  // Chapter-only match (e.g. "chapter 2")
  const chapterMatch = q.match(/(?:chapter|ch|अध्याय)\s*(\d+)/);
  if (chapterMatch) {
    const chapter = parseInt(chapterMatch[1], 10);
    return getVersesByChapter(chapter);
  }

  // Full-text search
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase!
        .from("verses")
        .select("*, word_meanings(*)")
        .ilike("search_text", `%${q}%`);
      if (!error && data && data.length > 0) return data.map(rowToVerse);
      if (error) console.error("Supabase search error:", error.message);
    } catch (e) {
      console.error("Supabase search exception:", e);
    }
  }

  return localVerses.filter(
    (v) =>
      v.sanskrit.toLowerCase().includes(q) ||
      v.transliteration.toLowerCase().includes(q) ||
      v.translationEn.toLowerCase().includes(q) ||
      v.translationHi.includes(q) ||
      v.context.toLowerCase().includes(q) ||
      v.contextHindi.includes(q) ||
      v.wordMeanings.some(
        (w) =>
          w.word.includes(q) ||
          w.meaning.toLowerCase().includes(q) ||
          w.meaningHindi.includes(q)
      )
  );
}

export async function getVerseById(id: string): Promise<Verse | undefined> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase!
      .from("verses")
      .select("*, word_meanings(*)")
      .eq("id", id)
      .single();
    if (!error && data) return rowToVerse(data);
    if (error) console.error("Supabase getVerseById error:", error.message);
  }
  return localVerses.find((v) => v.id === id);
}

export async function getAllVerses(): Promise<Verse[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase!
      .from("verses")
      .select("*, word_meanings(*)")
      .order("chapter")
      .order("verse");
    if (!error && data && data.length > 0) return data.map(rowToVerse);
    if (error) console.error("Supabase getAllVerses error:", error.message);
  }
  return localVerses;
}

export async function getVersesByChapter(chapter: number): Promise<Verse[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase!
      .from("verses")
      .select("*, word_meanings(*)")
      .eq("chapter", chapter)
      .order("verse");
    if (!error && data && data.length > 0) return data.map(rowToVerse);
    if (error) console.error("Supabase getVersesByChapter error:", error.message);
  }
  return localVerses.filter((v) => v.chapter === chapter);
}
