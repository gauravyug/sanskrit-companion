"use client";

import Link from "next/link";
import type { Verse, Language } from "@/types";

interface VerseCardProps {
  verse: Verse;
  language: Language;
}

export default function VerseCard({ verse, language }: VerseCardProps) {
  const translation =
    language === "hi" ? verse.translationHi : verse.translationEn;

  return (
    <Link
      href={`/verse/${verse.id}`}
      className="block bg-white rounded-2xl border border-orange-100 hover:border-orange-300 hover:shadow-lg transition-all p-6 group"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
          {language === "hi"
            ? `अध्याय ${verse.chapter}`
            : `Ch. ${verse.chapter}`}
        </span>
        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
          {language === "hi"
            ? `श्लोक ${verse.verse}`
            : `Verse ${verse.verse}`}
        </span>
      </div>

      <p className="font-sanskrit text-lg text-gray-800 leading-relaxed mb-3 line-clamp-2">
        {verse.sanskrit.split("\n")[0]}
        {verse.sanskrit.split("\n").length > 1 && "..."}
      </p>

      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
        {translation}
      </p>

      <div className="mt-4 text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        {language === "hi" ? "विस्तार से पढ़ें →" : "Read more →"}
      </div>
    </Link>
  );
}
