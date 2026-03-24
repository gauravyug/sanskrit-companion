"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import VerseCard from "@/components/VerseCard";
import ChapterList from "@/components/ChapterList";
import type { Verse, Language, Scripture } from "@/types";
import gitaMeta from "@/data/bhagavad-gita-meta.json";

const scripture: Scripture = gitaMeta as Scripture;

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [results, setResults] = useState<Verse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"home" | "search" | "chapter">("home");
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [chapterVerses, setChapterVerses] = useState<Verse[]>([]);

  const handleChapterSelect = useCallback(async (chapter: number) => {
    setSelectedChapter(chapter);
    setLoading(true);
    setView("chapter");
    try {
      const res = await fetch(`/api/verses?chapter=${chapter}`);
      const data = await res.json();
      setChapterVerses(data.verses);
    } catch {
      setChapterVerses([]);
    }
    setLoading(false);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setView("home");
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setView("search");
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data.results);
    } catch {
      setResults([]);
    }
    setHasSearched(true);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white">
      <Header language={language} onLanguageChange={setLanguage} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {language === "hi" ? (
              <>
                <span className="text-orange-500">संस्कृत शास्त्रों</span> को
                समझें
              </>
            ) : (
              <>
                Understand{" "}
                <span className="text-orange-500">Sanskrit Scriptures</span>
              </>
            )}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {language === "hi"
              ? "श्लोक खोजें, अर्थ समझें, AI से व्याख्या पाएं — सरल हिन्दी और अंग्रेज़ी में"
              : "Search verses, understand meanings, get AI-powered explanations — in simple English & Hindi"}
          </p>
        </div>

        {/* Search */}
        <div className="mb-10">
          <SearchBar
            language={language}
            onSearch={handleSearch}
            isLoading={loading}
          />
        </div>

        {/* Content */}
        {view === "home" && !hasSearched && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {language === "hi"
                ? "📖 श्रीमद्भगवद्गीता — अध्याय"
                : "📖 Bhagavad Gita — Chapters"}
            </h3>
            <ChapterList chapters={scripture.chapters} language={language} onChapterSelect={handleChapterSelect} />

            {/* Featured Verses */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {language === "hi"
                  ? "⭐ प्रसिद्ध श्लोक"
                  : "⭐ Famous Verses"}
              </h3>
              <FeaturedVerses language={language} />
            </div>
          </div>
        )}

        {view === "chapter" && selectedChapter && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                {loading
                  ? language === "hi"
                    ? "लोड हो रहा है..."
                    : "Loading..."
                  : language === "hi"
                  ? `अध्याय ${selectedChapter} — ${scripture.chapters.find((c) => c.chapter === selectedChapter)?.nameHindi ?? ""}`
                  : `Chapter ${selectedChapter} — ${scripture.chapters.find((c) => c.chapter === selectedChapter)?.name ?? ""}`}
              </h3>
              <button
                onClick={() => {
                  setView("home");
                  setSelectedChapter(null);
                }}
                className="text-sm text-orange-500 hover:text-orange-600"
              >
                {language === "hi" ? "← मुख्य पृष्ठ" : "← Back to home"}
              </button>
            </div>

            {chapterVerses.length === 0 && !loading ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">📖</div>
                <p>
                  {language === "hi"
                    ? "इस अध्याय के श्लोक अभी उपलब्ध नहीं हैं।"
                    : "No verses available for this chapter yet."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {chapterVerses.map((verse) => (
                  <VerseCard
                    key={verse.id}
                    verse={verse}
                    language={language}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {view === "search" && hasSearched && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                {loading
                  ? language === "hi"
                    ? "खोज रहे हैं..."
                    : "Searching..."
                  : language === "hi"
                  ? `${results.length} परिणाम मिले`
                  : `${results.length} result${results.length !== 1 ? "s" : ""} found`}
              </h3>
              <button
                onClick={() => {
                  setView("home");
                  setHasSearched(false);
                }}
                className="text-sm text-orange-500 hover:text-orange-600"
              >
                {language === "hi" ? "← मुख्य पृष्ठ" : "← Back to home"}
              </button>
            </div>

            {results.length === 0 && !loading ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">🔍</div>
                <p>
                  {language === "hi"
                    ? "कोई श्लोक नहीं मिला। कुछ और खोजें।"
                    : "No verses found. Try a different search."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {results.map((verse) => (
                  <VerseCard
                    key={verse.id}
                    verse={verse}
                    language={language}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-sm text-gray-400 border-t border-gray-100 mt-12">
        {language === "hi"
          ? "🙏 शास्त्र साथी — संस्कृत शास्त्रों को सरलता से समझें"
          : "🙏 Scripture Companion — Making Sanskrit scriptures accessible to all"}
      </footer>
    </div>
  );
}

function FeaturedVerses({ language }: { language: Language }) {
  const [featured, setFeatured] = useState<Verse[]>([]);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    fetch("/api/search?q=")
      .then((r) => r.json())
      .then((data) => {
        // Pick a subset of notable verses
        const notable = ["bg-2.47", "bg-2.22", "bg-4.7", "bg-11.32", "bg-18.66"];
        const picked = (data.results as Verse[]).filter((v) =>
          notable.includes(v.id)
        );
        setFeatured(picked);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }

  if (!loaded) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {featured.map((verse) => (
        <VerseCard key={verse.id} verse={verse} language={language} />
      ))}
    </div>
  );
}
