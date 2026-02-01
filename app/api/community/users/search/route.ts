import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { users, followers } from "@/app/lib/schema";
import { ilike, or, eq, and, ne } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const currentUserId = auth.user.userId;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const results = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        imageUrl: users.imageUrl,
        level: users.level,
        role: users.role,
      })
      .from(users)
      .where(
        and(
            ne(users.role, 'admin'),
            or(
                ilike(users.username, `%${query}%`),
                ilike(users.fullName, `%${query}%`)
            )
        )
      )
      .limit(10);

    // Check friendship status
    const formattedResults = await Promise.all(results.map(async (user) => {
        const isFollowing = await db.query.followers.findFirst({
            where: and(
                eq(followers.userId, currentUserId),
                eq(followers.followerId, user.id)
            )
        });
        
        return {
            ...user,
            isFollowing: !!isFollowing,
            isMe: user.id === currentUserId
        };
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("SEARCH_USERS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
