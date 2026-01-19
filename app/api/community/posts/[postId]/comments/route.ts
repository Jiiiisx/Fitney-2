import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { postComments, posts, notifications, users } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, desc, asc } from "drizzle-orm";

// GET Comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const auth = await verifyAuth(req);
        if (auth.error) return auth.error;

        const resolvedParams = await params;
        const postId = parseInt(resolvedParams.postId);
        
        const comments = await db.query.postComments.findMany({
            where: eq(postComments.postId, postId),
            orderBy: [asc(postComments.createdAt)], // Komentar lama di atas
            with: {
                user: {
                    columns: {
                        username: true,
                        fullName: true,
                        imageUrl: true
                    }
                }
            }
        });

        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// POST Comment
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
    const body = await req.json();
    const { content } = body;

    if (!content) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
        // 1. Insert Comment
        await tx.insert(postComments).values({
            userId,
            postId,
            content
        });

        // 2. Notifikasi
        const post = await tx.query.posts.findFirst({
            where: eq(posts.id, postId),
            columns: { userId: true, content: true }
        });

        if (post && post.userId !== userId) {
            await tx.insert(notifications).values({
                userId: post.userId,
                type: 'comment',
                message: `${auth.user.name || 'Someone'} commented on your post: "${content.substring(0, 20)}..."`,
                linkUrl: `/community`,
                isRead: false
            });
        }
    });

    return NextResponse.json({ message: "Comment added" }, { status: 201 });

  } catch (error) {
    console.error("COMMENT_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
