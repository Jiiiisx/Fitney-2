import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { exercises, categories } from "@/app/lib/schema";
import { ilike, eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], hasMore: false });
    }

    // Cari latihan berdasarkan nama (case-insensitive)
    // Kita ambil limit + 1 untuk cek hasMore
    const results = await db
      .select({
        id: exercises.id,
        name: exercises.name,
        category: categories.name,
      })
      .from(exercises)
      .leftJoin(categories, eq(exercises.categoryId, categories.id))
      .where(ilike(exercises.name, `%${query}%`))
      .limit(limit + 1)
      .offset(offset);
    
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({
        results: data,
        hasMore: hasMore
    });

  } catch (error) {
    console.error("SEARCH_EXERCISE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
