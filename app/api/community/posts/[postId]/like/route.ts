import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { postLikes, posts, notifications } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { and, eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    
    const resolvedParams = await params;
    const userId = auth.user.userId;
    const postId = parseInt(resolvedParams.postId);

    if (isNaN(postId)) {
        return NextResponse.json({ error: "Invalid Post ID" }, { status: 400 });
    }

    // Cek apakah sudah like
    const existingLike = await db.query.postLikes.findFirst({
        where: and(
            eq(postLikes.userId, userId),
            eq(postLikes.postId, postId)
        )
    });

    if (existingLike) {
        // UNLIKE
        await db.delete(postLikes)
            .where(and(
                eq(postLikes.userId, userId),
                eq(postLikes.postId, postId)
            ));
        
        return NextResponse.json({ message: "Unliked", isLiked: false });
    } else {
        // LIKE
        await db.transaction(async (tx) => {
            // 1. Insert Like
            await tx.insert(postLikes).values({
                userId,
                postId
            });

            // 2. Ambil pemilik post untuk notifikasi
            const post = await tx.query.posts.findFirst({
                where: eq(posts.id, postId),
                columns: { userId: true, content: true } // Ambil content untuk preview
            });

            // Jangan kirim notifikasi jika like post sendiri
            if (post && post.userId !== userId) {
                await tx.insert(notifications).values({
                    userId: post.userId,
                    type: 'like',
                    message: `${auth.user.name || 'Someone'} liked your post: "${post.content?.substring(0, 20)}..."`,
                    linkUrl: `/community`, // Bisa diarahkan ke detail post jika ada
                    isRead: false
                });
            }
        });

        return NextResponse.json({ message: "Liked", isLiked: true });
    }

  } catch (error) {
    console.error("LIKE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
