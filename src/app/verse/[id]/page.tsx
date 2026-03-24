"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import VerseDetail from "@/components/VerseDetail";
import ExplanationPanel from "@/components/ExplanationPanel";
import type { Verse, Language } from "@/types";

export default function VersePage() {
  const params = useParams();
  const verseId = params.id as string;
  const [verse, setVerse] = useState<Verse | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!verseId) return;
    setLoading(true);
    fetch(`/api/verses?id=${encodeURIComponent(verseId)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setVerse(data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [verseId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white">
      <Header language={language} onLanguageChange={setLanguage} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href="/"
            className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
          >
            {language === "hi" ? "← मुख्य पृष्ठ" : "← Home"}
          </Link>
        </nav>

        {loading && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3 animate-pulse">📖</div>
            <p>
              {language === "hi"
                ? "श्लोक लोड हो रहा है..."
                : "Loading verse..."}
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">😔</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {language === "hi" ? "श्लोक नहीं मिला" : "Verse not found"}
            </h2>
            <p className="text-gray-400 mb-4">
              {language === "hi"
                ? `"${verseId}" नहीं मिला`
                : `Could not find "${verseId}"`}
            </p>
            <Link
              href="/"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              {language === "hi" ? "मुख्य पृष्ठ पर जाएं" : "Go to homepage"}
            </Link>
          </div>
        )}

        {verse && !loading && !error && (
          <div className="space-y-8">
            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {language === "hi"
                  ? `भगवद्गीता — अध्याय ${verse.chapter}, श्लोक ${verse.verse}`
                  : `Bhagavad Gita — Chapter ${verse.chapter}, Verse ${verse.verse}`}
              </h2>
            </div>

            {/* Verse Detail */}
            <VerseDetail verse={verse} language={language} />

            {/* AI Explanation */}
            <ExplanationPanel verseId={verse.id} language={language} />

            {/* Navigation */}
            <VerseNavigation
              currentId={verse.id}
              chapter={verse.chapter}
              verseNum={verse.verse}
              language={language}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function VerseNavigation({
  currentId,
  chapter,
  verseNum,
  language,
}: {
  currentId: string;
  chapter: number;
  verseNum: number;
  language: Language;
}) {
  const [siblings, setSiblings] = useState<Verse[]>([]);

  useEffect(() => {
    fetch(`/api/verses?chapter=${chapter}`)
      .then((r) => r.json())
      .then((data) => setSiblings(data.verses || []))
      .catch(() => {});
  }, [chapter]);

  const currentIdx = siblings.findIndex((v) => v.id === currentId);
  const prev = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const next =
    currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  if (siblings.length === 0) return null;

  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-100">
      {prev ? (
        <Link
          href={`/verse/${prev.id}`}
          className="text-sm text-orange-500 hover:text-orange-600 font-medium"
        >
          ← {language === "hi" ? `श्लोक ${prev.verse}` : `Verse ${prev.verse}`}
        </Link>
      ) : (
        <div />
      )}
      <span className="text-xs text-gray-400">
        {language === "hi"
          ? `अध्याय ${chapter}`
          : `Chapter ${chapter}`}{" "}
        · {verseNum}/{siblings.length}
      </span>
      {next ? (
        <Link
          href={`/verse/${next.id}`}
          className="text-sm text-orange-500 hover:text-orange-600 font-medium"
        >
          {language === "hi" ? `श्लोक ${next.verse}` : `Verse ${next.verse}`} →
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
