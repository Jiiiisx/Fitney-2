import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { users, followers } from "@/app/lib/schema";
import { eq, not, and, notInArray, sql, ne } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const currentUserId = auth.user.userId;

    // 1. Get list of user IDs that current user is already following
    const followingList = await db
      .select({ id: followers.followerId })
      .from(followers)
      .where(eq(followers.userId, currentUserId));

    const followingIds = followingList.map((f) => f.id);
    
    // Add current user to exclusion list
    const excludedIds = [...followingIds, currentUserId];

    // 2. Fetch random users NOT in the excluded list AND not admins
    // Using simple RANDOM() ordering for recommendations
    const recommendations = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        imageUrl: users.imageUrl,
        level: users.level,
      })
      .from(users)
      .where(
        and(
            notInArray(users.id, excludedIds),
            ne(users.role, 'admin')
        )
      )
      .orderBy(sql`RANDOM()`)
      .limit(4);

    // Format consistent with search results (isFollowing is always false here)
    const formattedResults = recommendations.map(user => ({
        ...user,
        isFollowing: false,
        isMe: false
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("RECOMMENDATIONS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
