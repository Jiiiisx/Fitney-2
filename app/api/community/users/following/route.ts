import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { users, followers } from "@/app/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const currentUserId = auth.user.userId;

    // Ambil daftar user yang diikuti oleh currentUserId
    // followers table: userId (yang difollow), followerId (yang memfollow/saya)
    const followingList = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        imageUrl: users.imageUrl,
        level: users.level,
        followedAt: followers.createdAt
      })
      .from(followers)
      .innerJoin(users, eq(followers.userId, users.id))
      .where(eq(followers.followerId, currentUserId))
      .orderBy(desc(followers.createdAt));

    const formattedList = followingList.map(user => ({
        ...user,
        isFollowing: true, // Pasti true karena ini list following
        isMe: false
    }));

    return NextResponse.json(formattedList);
  } catch (error) {
    console.error("GET_FOLLOWING_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
