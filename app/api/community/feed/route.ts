import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { posts, users, postLikes, postComments } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { desc, eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    // Kita izinkan feed diakses publik atau minimal login
    if (auth.error) return auth.error;
    
    // Ambil posts dengan user info dan counts
    // Karena Drizzle query builder untuk counts + join agak kompleks,
    // kita fetch posts dulu lalu enrich atau gunakan raw SQL/helpers.
    // Di sini kita gunakan approach: Fetch posts with relations
    
    const feed = await db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      limit: 20, // Pagination limit
      with: {
        user: {
          columns: {
            username: true,
            fullName: true,
            imageUrl: true,
          }
        },
        likes: true, // Ambil semua likes (bisa berat kalau banyak, ideally count only)
        comments: true,
      }
    });

    // Format data untuk frontend
    const formattedFeed = feed.map(post => ({
      id: post.id,
      userId: post.userId, // Tambahkan ini
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      user: {
        name: post.user.fullName || post.user.username,
        avatar: post.user.imageUrl,
        username: post.user.username
      },
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLiked: post.likes.some(like => like.userId === auth.user.userId)
    }));

    return NextResponse.json(formattedFeed);

  } catch (error) {
    console.error("GET_FEED_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
