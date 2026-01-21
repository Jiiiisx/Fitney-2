import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { followers } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { and, eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { userId: targetUserId } = await params;
    const currentUserId = auth.user.userId;

    if (targetUserId === currentUserId) {
        return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    // Cek apakah sudah follow
    // Schema: userId (yang difollow), followerId (yang memfollow)
    const existingFollow = await db
      .select()
      .from(followers)
      .where(
        and(
          eq(followers.userId, targetUserId),
          eq(followers.followerId, currentUserId)
        )
      );

    if (existingFollow.length > 0) {
      // UNFOLLOW
      await db
        .delete(followers)
        .where(
          and(
            eq(followers.userId, targetUserId),
            eq(followers.followerId, currentUserId)
          )
        );

      return NextResponse.json({ 
        following: false, 
        message: "Unfollowed successfully" 
      });
    } else {
      // FOLLOW
      await db.insert(followers).values({
        userId: targetUserId,
        followerId: currentUserId,
      });

      return NextResponse.json({ 
        following: true, 
        message: "Followed successfully" 
      });
    }

  } catch (error) {
    console.error("TOGGLE_FOLLOW_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
