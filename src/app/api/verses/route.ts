import { NextRequest, NextResponse } from "next/server";
import { getAllVerses, getVerseById, getVersesByChapter } from "@/lib/search";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const chapter = request.nextUrl.searchParams.get("chapter");

  if (id) {
    const verse = await getVerseById(id);
    if (!verse) {
      return NextResponse.json({ error: "Verse not found" }, { status: 404 });
    }
    return NextResponse.json(verse);
  }

  if (chapter) {
    const chapterNum = parseInt(chapter, 10);
    if (isNaN(chapterNum)) {
      return NextResponse.json(
        { error: "Invalid chapter number" },
        { status: 400 }
      );
    }
    const verses = await getVersesByChapter(chapterNum);
    return NextResponse.json({ verses, count: verses.length });
  }

  const verses = await getAllVerses();
  return NextResponse.json({ verses, count: verses.length });
}
