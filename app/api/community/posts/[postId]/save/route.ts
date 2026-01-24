import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { savedPosts } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { and, eq } from "drizzle-orm";

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

        // Check if already saved
        const existingSave = await db
            .select()
            .from(savedPosts)
            .where(
                and(
                    eq(savedPosts.postId, postIdInt),
                    eq(savedPosts.userId, userId)
                )
            );

        if (existingSave.length > 0) {
            // UNSAVE: Remove from saved
            await db
                .delete(savedPosts)
                .where(
                    and(
                        eq(savedPosts.postId, postIdInt),
                        eq(savedPosts.userId, userId)
                    )
                );

            return NextResponse.json({
                saved: false,
                message: "Post removed from saved"
            });
        } else {
            // SAVE: Add to saved
            await db.insert(savedPosts).values({
                postId: postIdInt,
                userId: userId,
            });

            return NextResponse.json({
                saved: true,
                message: "Post saved"
            });
        }

    } catch (error) {
        console.error("TOGGLE_SAVE_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
