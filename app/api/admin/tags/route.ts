import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { hashtags, postHashtags } from "@/app/lib/schema";
import { eq, ilike, sql, desc } from "drizzle-orm";
import { verifyAdmin } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    // Fetch tags with post count
    const results = await db
      .select({
        id: hashtags.id,
        tag: hashtags.tag,
        isFeatured: hashtags.isFeatured,
        createdAt: hashtags.createdAt,
        postCount: sql<number>`count(${postHashtags.postId})`
      })
      .from(hashtags)
      .leftJoin(postHashtags, eq(hashtags.id, postHashtags.hashtagId))
      .where(ilike(hashtags.tag, `%${query}%`))
      .groupBy(hashtags.id)
      .orderBy(desc(hashtags.isFeatured), desc(sql`count(${postHashtags.postId})`)) // Featured first, then most popular
      .limit(limit)
      .offset(offset);

    const totalRes = await db.select({ count: sql<number>`count(*)` }).from(hashtags);
    const total = totalRes[0].count;

    return NextResponse.json({ data: results, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  try {
    const { id, isFeatured } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await db.update(hashtags)
      .set({ isFeatured })
      .where(eq(hashtags.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    const auth = await verifyAdmin(req);
    if (auth.error) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if(!id) return NextResponse.json({error: "ID Required"}, {status: 400});
        
        await db.delete(hashtags).where(eq(hashtags.id, parseInt(id)));
        return NextResponse.json({success: true});
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
