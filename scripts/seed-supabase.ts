/**
 * Seed script — uploads JSON data to Supabase.
 *
 * Usage:
 *   npx tsx scripts/seed-supabase.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role bypasses RLS

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
  );
  console.error("Set them in .env.local or export them before running.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

interface WordMeaning {
  word: string;
  meaning: string;
  meaningHindi: string;
}

interface Verse {
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

interface Chapter {
  chapter: number;
  name: string;
  nameHindi: string;
  nameMeaning: string;
  verseCount: number;
  summary: string;
}

interface Scripture {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  chapters: Chapter[];
}

async function seed() {
  const dataDir = path.join(__dirname, "..", "src", "data");

  // Load JSON files
  const meta: Scripture = JSON.parse(
    fs.readFileSync(path.join(dataDir, "bhagavad-gita-meta.json"), "utf-8")
  );
  const verses: Verse[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, "verses.json"), "utf-8")
  );

  console.log(`Seeding scripture: ${meta.name} (${meta.chapters.length} chapters, ${verses.length} verses)`);

  // 1. Upsert scripture
  const { error: scrErr } = await supabase.from("scriptures").upsert({
    id: meta.id,
    name: meta.name,
    name_hindi: meta.nameHindi,
    description: meta.description,
  });
  if (scrErr) throw new Error(`Scripture insert failed: ${scrErr.message}`);
  console.log("✓ Scripture inserted");

  // 2. Upsert chapters
  const chapterRows = meta.chapters.map((ch) => ({
    scripture_id: meta.id,
    chapter: ch.chapter,
    name: ch.name,
    name_hindi: ch.nameHindi,
    name_meaning: ch.nameMeaning,
    verse_count: ch.verseCount,
    summary: ch.summary,
  }));
  const { error: chErr } = await supabase
    .from("chapters")
    .upsert(chapterRows, { onConflict: "scripture_id,chapter" });
  if (chErr) throw new Error(`Chapters insert failed: ${chErr.message}`);
  console.log(`✓ ${chapterRows.length} chapters inserted`);

  // 3. Upsert verses
  const verseRows = verses.map((v) => ({
    id: v.id,
    scripture_id: v.book,
    chapter: v.chapter,
    verse: v.verse,
    sanskrit: v.sanskrit,
    transliteration: v.transliteration,
    translation_en: v.translationEn,
    translation_hi: v.translationHi,
    context: v.context,
    context_hindi: v.contextHindi,
  }));
  const { error: vErr } = await supabase.from("verses").upsert(verseRows);
  if (vErr) throw new Error(`Verses insert failed: ${vErr.message}`);
  console.log(`✓ ${verseRows.length} verses inserted`);

  // 4. Delete existing word meanings, then insert fresh
  for (const v of verses) {
    await supabase.from("word_meanings").delete().eq("verse_id", v.id);
  }

  const wmRows = verses.flatMap((v) =>
    v.wordMeanings.map((wm, i) => ({
      verse_id: v.id,
      position: i,
      word: wm.word,
      meaning: wm.meaning,
      meaning_hindi: wm.meaningHindi,
    }))
  );

  // Insert in batches of 200
  for (let i = 0; i < wmRows.length; i += 200) {
    const batch = wmRows.slice(i, i + 200);
    const { error: wmErr } = await supabase.from("word_meanings").insert(batch);
    if (wmErr) throw new Error(`Word meanings batch insert failed: ${wmErr.message}`);
  }
  console.log(`✓ ${wmRows.length} word meanings inserted`);

  console.log("\n🎉 Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
