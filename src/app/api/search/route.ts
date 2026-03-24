import { NextRequest, NextResponse } from "next/server";
import { searchVerses } from "@/lib/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchVerses(query);
  return NextResponse.json({ results, count: results.length });
}
