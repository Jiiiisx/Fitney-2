import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { foods } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    // Fetch 4 random healthy-ish foods
    // In a real app, you might want a more sophisticated recommendation engine
    // but for now, we'll just pick some items.
    const results = await db
      .select()
      .from(foods)
      .orderBy(sql`RANDOM()`)
      .limit(4);

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET_FOOD_RECOMMENDATIONS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
