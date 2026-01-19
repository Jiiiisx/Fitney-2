import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { posts } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { and, eq } from "drizzle-orm";

// DELETE Post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    
    const resolvedParams = await params;
    const postId = parseInt(resolvedParams.postId);
    const userId = auth.user.userId;

    if (isNaN(postId)) {
        return NextResponse.json({ error: "Invalid Post ID" }, { status: 400 });
    }

    // Hapus post HANYA JIKA userId cocok (Security Check)
    const deletedPost = await db.delete(posts)
        .where(and(
            eq(posts.id, postId),
            eq(posts.userId, userId)
        ))
        .returning();

    if (deletedPost.length === 0) {
        return NextResponse.json({ error: "Post not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Post deleted successfully" });

  } catch (error) {
    console.error("DELETE_POST_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
