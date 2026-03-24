"use client";

import type { Verse, Language } from "@/types";

interface VerseDetailProps {
  verse: Verse;
  language: Language;
}

export default function VerseDetail({ verse, language }: VerseDetailProps) {
  const translation =
    language === "hi" ? verse.translationHi : verse.translationEn;
  const context = language === "hi" ? verse.contextHindi : verse.context;

  return (
    <div className="space-y-6">
      {/* Sanskrit */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
        <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-3">
          {language === "hi" ? "संस्कृत" : "Sanskrit"}
        </h3>
        <p className="font-sanskrit text-2xl text-gray-900 leading-loose whitespace-pre-line">
          {verse.sanskrit}
        </p>
      </div>

      {/* Transliteration */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {language === "hi" ? "लिप्यन्तरण" : "Transliteration"}
        </h3>
        <p className="text-lg text-gray-700 italic leading-relaxed whitespace-pre-line">
          {verse.transliteration}
        </p>
      </div>

      {/* Translation */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
          {language === "hi" ? "अनुवाद" : "Translation"}
        </h3>
        <p className="text-lg text-gray-800 leading-relaxed">{translation}</p>
      </div>

      {/* Word-by-Word */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wider mb-4">
          {language === "hi" ? "शब्दार्थ" : "Word-by-Word Meaning"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {verse.wordMeanings.map((wm, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-purple-50/50 rounded-xl"
            >
              <span className="font-sanskrit text-purple-800 font-semibold shrink-0">
                {wm.word}
              </span>
              <span className="text-gray-600 text-sm">
                {language === "hi" ? wm.meaningHindi : wm.meaning}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Context */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
        <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3">
          📖 {language === "hi" ? "सन्दर्भ" : "Context & Story"}
        </h3>
        <p className="text-gray-700 leading-relaxed">{context}</p>
      </div>
    </div>
  );
}
