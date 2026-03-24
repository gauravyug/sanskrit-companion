"use client";

import type { Chapter, Language } from "@/types";

interface ChapterListProps {
  chapters: Chapter[];
  language: Language;
  onChapterSelect?: (chapter: number) => void;
}

export default function ChapterList({ chapters, language, onChapterSelect }: ChapterListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {chapters.map((ch) => (
        <button
          key={ch.chapter}
          onClick={() => onChapterSelect?.(ch.chapter)}
          className="block text-left bg-white rounded-2xl border border-orange-100 hover:border-orange-300 hover:shadow-lg transition-all p-5 group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 text-white flex items-center justify-center font-bold text-sm">
              {ch.chapter}
            </span>
            <div>
              <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                {language === "hi" ? ch.nameHindi : ch.name}
              </h3>
              <p className="text-xs text-gray-500">
                {ch.verseCount} {language === "hi" ? "श्लोक" : "verses"}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {language === "hi" ? ch.nameMeaning : ch.nameMeaning}
          </p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {ch.summary}
          </p>
        </button>
      ))}
    </div>
  );
}
