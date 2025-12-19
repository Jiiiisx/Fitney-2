import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { exercises } from "@/app/lib/schema";
import { ilike, sql } from 'drizzle-orm';
import { verifyAuth } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 15;
    const offset = (page - 1) * limit;

    if (!query) {
      return NextResponse.json({ result: [], hasMore: false });
    }

    const relevanceSort = sql`
    CASE
      WHEN ${exercises.name} ILIKE ${`${query}%`} THEN 1
      ELSE 2
    END`;

    const result = await db
      .select({
        id: exercises.id,
        name: exercises.name,
      })
      .from(exercises)
      .where(ilike(exercises.name, `%${query}%`))
      .orderBy(relevanceSort, exercises.name)
      .limit(limit + 1)
      .offset(offset);

    const hasMore = result.length > limit;
    const finalResult = result.slice(0, limit);

    return NextResponse.json({ result: finalResult, hasMore });
  } catch (error) {
    console.error('Error searching exercises:', error);
    return NextResponse.json({ error: 'Internal Server Error'}, { status: 500 });
  }
}