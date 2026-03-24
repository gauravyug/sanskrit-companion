# 🙏 Scripture Companion (शास्त्र साथी)

A web app to explore and understand Sanskrit scriptures — starting with the **Bhagavad Gita**.

## Features (MVP)

- **Search verses** — by reference (e.g. `2.47`), keyword (`karma`, `soul`, `dharma`), or Sanskrit text
- **Sanskrit display** — original text with IAST transliteration
- **Word-by-word meanings** — each Sanskrit word broken down
- **Translation** — in English and Hindi
- **Context & Story** — narrative background for each verse
- **AI Explanation** — powered by OpenAI (or works offline with curated fallbacks)
- **"Explain Like I'm 10"** — simplified explanations for anyone
- **Language toggle** — switch between English and Hindi instantly
- **Ask anything** — type a custom question about any verse

## Getting Started

```bash
# Install dependencies
npm install

# (Optional) Add your OpenAI key for AI-powered explanations
cp .env.example .env.local
# Edit .env.local and set OPENAI_API_KEY

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The app works fully without an API key — it uses curated fallback explanations from the scripture data.

## Tech Stack

| Layer      | Choice              |
|-----------|---------------------|
| Framework | Next.js 14 (App Router) |
| Styling   | Tailwind CSS        |
| Language  | TypeScript          |
| AI        | OpenAI GPT-4o-mini (optional) |
| Data      | JSON (Bhagavad Gita verses) |

## Data

Currently includes **18 iconic verses** from the Bhagavad Gita with:
- Sanskrit text
- IAST transliteration
- Word-by-word meanings (English + Hindi)
- Translations (English + Hindi)
- Historical/narrative context

Metadata for all **18 chapters** is included.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page (search, chapters, featured)
│   ├── verse/[id]/page.tsx   # Verse detail page
│   ├── api/
│   │   ├── search/route.ts   # Search API
│   │   ├── verses/route.ts   # Verse data API
│   │   └── explain/route.ts  # AI explanation API
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── SearchBar.tsx
│   ├── VerseCard.tsx
│   ├── VerseDetail.tsx
│   ├── ExplanationPanel.tsx
│   └── ChapterList.tsx
├── data/
│   ├── bhagavad-gita-meta.json  # Chapter metadata
│   └── verses.json              # Verse data
├── lib/
│   ├── ai.ts                    # AI integration
│   └── search.ts                # Search logic
└── types/
    └── index.ts
```

## Extending

To add more verses, add entries to `src/data/verses.json` following the existing format.

To add more scriptures (Ramayana, Upanishads), create new data files and update the search/API layer.
