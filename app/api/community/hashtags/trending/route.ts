import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { hashtags, postHashtags } from "@/app/lib/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    // Query untuk menghitung jumlah penggunaan setiap hashtag
    // SELECT h.tag, COUNT(ph.post_id) as count 
    // FROM hashtags h 
    // JOIN post_hashtags ph ON h.id = ph.hashtag_id 
    // GROUP BY h.id 
    // ORDER BY count DESC 
    // LIMIT 10

    const trending = await db
      .select({
        tag: hashtags.tag,
        count: sql<number>`cast(count(${postHashtags.postId}) as int)`,
      })
      .from(hashtags)
      .leftJoin(postHashtags, eq(hashtags.id, postHashtags.hashtagId))
      .groupBy(hashtags.id)
      .orderBy(desc(sql`count(${postHashtags.postId})`))
      .limit(10);

    return NextResponse.json(trending);
  } catch (error) {
    console.error("GET_TRENDING_HASHTAGS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}