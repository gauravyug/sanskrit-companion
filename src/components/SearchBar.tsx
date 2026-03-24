"use client";

import { useState } from "react";
import type { Language } from "@/types";

interface SearchBarProps {
  language: Language;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({
  language,
  onSearch,
  isLoading,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const placeholder =
    language === "hi"
      ? 'श्लोक खोजें — जैसे "2.47", "karma", "आत्मा"...'
      : 'Search verses — "2.47", "karma", "soul", "dharma"...';

  const suggestions =
    language === "hi"
      ? ["कर्मण्येवाधिकारस्ते", "आत्मा", "धर्म", "2.47", "4.7"]
      : ["soul", "duty", "karma", "2.47", "4.7", "surrender"];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-5 py-4 pr-24 text-lg rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all bg-white shadow-sm placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl font-medium transition-colors"
        >
          {isLoading
            ? "..."
            : language === "hi"
            ? "खोजें"
            : "Search"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => {
              setQuery(s);
              onSearch(s);
            }}
            className="px-3 py-1 text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-full border border-orange-200 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
