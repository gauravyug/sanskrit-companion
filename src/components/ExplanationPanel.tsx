"use client";

import { useState } from "react";
import type { Language, ExplanationResponse, AIProvider } from "@/types";

interface ExplanationPanelProps {
  verseId: string;
  language: Language;
}

const AI_MODELS: { id: AIProvider; label: string; labelHi: string; icon: string }[] = [
  { id: "gemini", label: "Gemini Flash", labelHi: "Gemini Flash", icon: "✦" },
  { id: "groq", label: "Llama 3.1 (Groq)", labelHi: "Llama 3.1 (Groq)", icon: "🦙" },
  { id: "openai", label: "GPT-4o Mini", labelHi: "GPT-4o Mini", icon: "🤖" },
];

export default function ExplanationPanel({
  verseId,
  language,
}: ExplanationPanelProps) {
  const [mode, setMode] = useState<"standard" | "eli10">("standard");
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(
    null
  );
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchExplanation = async (customQuestion?: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verseId,
          mode,
          language,
          question: customQuestion,
          provider,
        }),
      });
      const data = await response.json();
      setExplanation(data);
    } catch {
      setExplanation({
        explanation:
          language === "hi"
            ? "व्याख्या लोड करने में त्रुटि हुई।"
            : "Error loading explanation.",
      });
    }
    setLoading(false);
  };

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      fetchExplanation(question.trim());
      setQuestion("");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wider">
        🧠 {language === "hi" ? "AI व्याख्या" : "AI Explanation"}
      </h3>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("standard")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            mode === "standard"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {language === "hi" ? "📚 विस्तृत" : "📚 Detailed"}
        </button>
        <button
          onClick={() => setMode("eli10")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            mode === "eli10"
              ? "bg-yellow-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {language === "hi"
            ? "👶 बच्चों जैसा समझाएं"
            : "👶 Explain Like I'm 10"}
        </button>
      </div>

      {/* AI Model Selector */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1.5 block">
          {language === "hi" ? "AI मॉडल चुनें" : "Choose AI Model"}
        </label>
        <div className="flex gap-2">
          {AI_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setProvider(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                provider === m.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {m.icon} {language === "hi" ? m.labelHi : m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={() => fetchExplanation()}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-green-300 disabled:to-emerald-300 text-white rounded-xl font-medium transition-all"
      >
        {loading
          ? language === "hi"
            ? "सोच रहा हूँ... 🤔"
            : "Thinking... 🤔"
          : language === "hi"
          ? "✨ व्याख्या प्राप्त करें"
          : "✨ Get Explanation"}
      </button>

      {/* Result */}
      {explanation && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {explanation.explanation}
            </p>
          </div>

          {/* Follow-up questions */}
          {explanation.followUp && explanation.followUp.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                {language === "hi" ? "और पूछें:" : "Ask more:"}
              </p>
              <div className="flex flex-col gap-2">
                {explanation.followUp.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => fetchExplanation(q)}
                    className="text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm transition-colors border border-blue-100"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Question */}
      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            language === "hi"
              ? "इस श्लोक के बारे में कुछ भी पूछें..."
              : "Ask anything about this verse..."
          }
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none text-sm"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl font-medium transition-colors text-sm"
        >
          {language === "hi" ? "पूछें" : "Ask"}
        </button>
      </form>
    </div>
  );
}
