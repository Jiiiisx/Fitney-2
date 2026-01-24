import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { posts, users } from "@/app/lib/schema";
import { verifyAdmin } from "@/app/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req);
    if (auth.error) return auth.error;

    const allPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        authorName: users.fullName,
        authorUsername: users.username,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(200);

    return NextResponse.json(allPosts);
  } catch (error) {
    console.error("ADMIN_GET_POSTS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    try {
      const auth = await verifyAdmin(req);
      if (auth.error) return auth.error;
  
      const { searchParams } = new URL(req.url);
      const postId = searchParams.get("id");
  
      if (!postId) return NextResponse.json({ error: "Post ID required" }, { status: 400 });
  
      await db.delete(posts).where(eq(posts.id, parseInt(postId)));
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("ADMIN_DELETE_POST_ERROR", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
