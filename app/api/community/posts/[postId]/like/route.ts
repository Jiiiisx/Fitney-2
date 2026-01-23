import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { postLikes, posts } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { and, eq } from "drizzle-orm";
import { createNotification } from "@/app/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { postId } = await params;
    const postIdInt = parseInt(postId);

    if (isNaN(postIdInt)) {
      return NextResponse.json({ error: "Invalid Post ID" }, { status: 400 });
    }

    const userId = auth.user.userId;

    // Ambil info post untuk tau siapa pemiliknya
    const post = await db.query.posts.findFirst({
        where: eq(posts.id, postIdInt)
    });

    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Cek apakah user sudah like post ini
    const existingLike = await db
      .select()
      .from(postLikes)
      .where(
        and(
          eq(postLikes.postId, postIdInt),
          eq(postLikes.userId, userId)
        )
      );

    if (existingLike.length > 0) {
      // UNLIKE: Hapus like
      await db
        .delete(postLikes)
        .where(
          and(
            eq(postLikes.postId, postIdInt),
            eq(postLikes.userId, userId)
          )
        );

      return NextResponse.json({ 
        liked: false, 
        message: "Post unliked" 
      });
    } else {
      // LIKE: Tambah like
      await db.insert(postLikes).values({
        postId: postIdInt,
        userId: userId,
      });

      // KIRIM NOTIFIKASI
      if (post.userId !== userId) {
          await createNotification({
              recipientId: post.userId,
              senderId: userId,
              type: 'like',
              resourceId: postIdInt,
              message: "liked your post",
              linkUrl: `/community/posts/${postIdInt}`
          });
      }

      return NextResponse.json({ 
        liked: true, 
        message: "Post liked" 
      });
    }

  } catch (error) {
    console.error("TOGGLE_LIKE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}