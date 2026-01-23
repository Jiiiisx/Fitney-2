import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { users, followers } from "@/app/lib/schema";
import { eq, and, inArray, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const currentUserId = auth.user.userId;

    // 1. Get my following
    const myFollowing = await db
        .select({ id: followers.userId }) 
        .from(followers)
        .where(eq(followers.followerId, currentUserId));
    
    const targetIds = myFollowing.map(f => f.id);

    // Add myself to the leaderboard too!
    targetIds.push(currentUserId);

    // 3. Get User Stats (Level based for now)
    const topAchievers = await db
        .select({
            id: users.id,
            username: users.username,
            fullName: users.fullName,
            level: users.level,
            xp: users.xp,
            imageUrl: users.imageUrl
        })
        .from(users)
        .where(inArray(users.id, targetIds))
        .orderBy(desc(users.level), desc(users.xp))
        .limit(5);

    // Format for UI
    const formatted = topAchievers.map((user, index) => ({
        id: user.id,
        name: user.fullName || user.username,
        stat: `Level ${user.level}`,
        rank: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`,
        isMe: user.id === currentUserId
    }));

    return NextResponse.json(formatted);

  } catch (error) {
    console.error("ACHIEVERS_STATS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
