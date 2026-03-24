-- =============================================
-- Scripture Companion — Supabase Migration
-- =============================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Scriptures
CREATE TABLE scriptures (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_hindi TEXT,
  description TEXT
);

-- 2. Chapters
CREATE TABLE chapters (
  id SERIAL PRIMARY KEY,
  scripture_id TEXT NOT NULL REFERENCES scriptures(id) ON DELETE CASCADE,
  chapter INT NOT NULL,
  name TEXT NOT NULL,
  name_hindi TEXT,
  name_meaning TEXT,
  verse_count INT DEFAULT 0,
  summary TEXT,
  UNIQUE (scripture_id, chapter)
);

-- 3. Verses
CREATE TABLE verses (
  id TEXT PRIMARY KEY,                -- e.g. 'bg-2.47'
  scripture_id TEXT NOT NULL REFERENCES scriptures(id) ON DELETE CASCADE,
  chapter INT NOT NULL,
  verse INT NOT NULL,
  sanskrit TEXT NOT NULL,
  transliteration TEXT,
  translation_en TEXT,
  translation_hi TEXT,
  context TEXT,
  context_hindi TEXT,
  UNIQUE (scripture_id, chapter, verse)
);

-- 4. Word meanings
CREATE TABLE word_meanings (
  id SERIAL PRIMARY KEY,
  verse_id TEXT NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,    -- preserves word order
  word TEXT NOT NULL,
  meaning TEXT,
  meaning_hindi TEXT
);

-- 5. Full-text search index for multilingual search
ALTER TABLE verses ADD COLUMN search_text TEXT GENERATED ALWAYS AS (
  COALESCE(sanskrit, '') || ' ' ||
  COALESCE(transliteration, '') || ' ' ||
  COALESCE(translation_en, '') || ' ' ||
  COALESCE(translation_hi, '') || ' ' ||
  COALESCE(context, '') || ' ' ||
  COALESCE(context_hindi, '')
) STORED;

CREATE INDEX idx_verses_chapter ON verses (scripture_id, chapter);
CREATE INDEX idx_word_meanings_verse ON word_meanings (verse_id, position);

-- 6. Row-level security (allow public read, no write from client)
ALTER TABLE scriptures ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_meanings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read scriptures" ON scriptures FOR SELECT USING (true);
CREATE POLICY "Public read chapters" ON chapters FOR SELECT USING (true);
CREATE POLICY "Public read verses" ON verses FOR SELECT USING (true);
CREATE POLICY "Public read word_meanings" ON word_meanings FOR SELECT USING (true);
