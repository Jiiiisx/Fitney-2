import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { posts } from "@/app/lib/schema";
import { verifyAdmin } from "@/app/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req);
    if (auth.error) return auth.error;

    // Menggunakan db.query agar konsisten dengan API Feed utama
    const allPosts = await db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      limit: 200,
      with: {
        user: {
          columns: {
            username: true,
            fullName: true,
          }
        }
      }
    });

    // Format agar sesuai dengan yang diharapkan frontend
    const formattedPosts = allPosts.map(post => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      authorName: post.user?.fullName,
      authorUsername: post.user?.username,
    }));

    console.log(`Admin API: Fetched ${formattedPosts.length} posts`);
    return NextResponse.json(formattedPosts);
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