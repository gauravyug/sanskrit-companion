"use client";

import Link from "next/link";
import type { Language } from "@/types";

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="text-3xl">🙏</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {language === "hi" ? "शास्त्र साथी" : "Scripture Companion"}
            </h1>
            <p className="text-orange-100 text-xs">
              {language === "hi"
                ? "संस्कृत शास्त्रों को समझें"
                : "Understand Sanskrit Scriptures"}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onLanguageChange(language === "en" ? "hi" : "en")}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors backdrop-blur-sm"
          >
            {language === "en" ? "हिन्दी" : "English"}
          </button>
        </div>
      </div>
    </header>
  );
}
