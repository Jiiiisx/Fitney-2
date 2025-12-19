import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { exercises, categories } from "@/app/lib/schema";
import { ilike, eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Cari latihan berdasarkan nama (case-insensitive)
    const results = await db
      .select({
        id: exercises.id,
        name: exercises.name,
        category: categories.name,
      })
      .from(exercises)
      .leftJoin(categories, eq(exercises.categoryId, categories.id))
      .where(ilike(exercises.name, `%${query}%`))
      .limit(20);

    return NextResponse.json(results);

  } catch (error) {
    console.error("SEARCH_EXERCISE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
