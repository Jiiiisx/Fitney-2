import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { postComments, posts } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, and } from "drizzle-orm";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
    try {
        const auth = await verifyAuth(req);
        if (auth.error) return auth.error;

        const { postId, commentId } = await params;
        const postIdInt = parseInt(postId);
        const commentIdInt = parseInt(commentId);

        if (isNaN(postIdInt) || isNaN(commentIdInt)) {
            return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
        }

        // 1. Get the comment to know its author
        const comment = await db.query.postComments.findFirst({
            where: and(
                eq(postComments.id, commentIdInt),
                eq(postComments.postId, postIdInt)
            ),
        });

        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        // 2. Get the post to know the post owner
        const post = await db.query.posts.findFirst({
            where: eq(posts.id, postIdInt),
            columns: { userId: true }
        });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // 3. Permission Check
        // Allowed if: Requestor IS Comment Author OR Requestor IS Post Owner
        const isCommentAuthor = auth.user.userId === comment.userId;
        const isPostOwner = auth.user.userId === post.userId;

        if (!isCommentAuthor && !isPostOwner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // 4. Delete
        await db.delete(postComments).where(eq(postComments.id, commentIdInt));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("DELETE_COMMENT_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
