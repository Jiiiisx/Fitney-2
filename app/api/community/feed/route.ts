import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { posts } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    // Ambil parameter filter dari URL
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");

    // Tentukan kondisi WHERE
    let whereCondition = undefined;
    
    if (filter === "mine") {
      // Jika filter 'mine', hanya ambil post milik user yang login
      whereCondition = eq(posts.userId, auth.user.userId);
    }

    const feed = await db.query.posts.findMany({
      where: whereCondition, // Terapkan filter di sini
      orderBy: [desc(posts.createdAt)],
      limit: 20, 
      with: {
        user: {
          columns: {
            username: true,
            fullName: true,
            imageUrl: true,
          }
        },
        likes: true, 
        comments: true,
      }
    });

    const formattedFeed = feed.map(post => ({
      id: post.id,
      userId: post.userId,
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