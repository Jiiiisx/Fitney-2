import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { users, followers, posts, userProfiles, userAchievements, workoutLogs, userStreaks } from "@/app/lib/schema";
import { eq, count, desc, and, sum, gte } from "drizzle-orm";
import { subDays, startOfDay, format } from "date-fns";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const currentUserId = auth.user.userId;
    const { userId: identifier } = await params;

    // 1. Get User Basic Info (ID or Username)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    const user = await db.query.users.findFirst({
      where: isUUID ? eq(users.id, identifier) : eq(users.username, identifier),
      with: {
        userProfile: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetUserId = user.id;

    // 2. Get Stats
    const [followersCount] = await db
      .select({ count: count() })
      .from(followers)
      .where(eq(followers.followerId, targetUserId));

    const [followingCount] = await db
        .select({ count: count() })
        .from(followers)
        .where(eq(followers.userId, targetUserId));

    const [postsCount] = await db
        .select({ count: count() })
        .from(posts)
        .where(eq(posts.userId, targetUserId));

    const [workoutStats] = await db
        .select({ 
            count: count(),
            totalCalories: sum(workoutLogs.caloriesBurned)
        })
        .from(workoutLogs)
        .where(eq(workoutLogs.userId, targetUserId));

    const streakInfo = await db.query.userStreaks.findFirst({
        where: eq(userStreaks.userId, targetUserId)
    });

    const userAcc = await db.query.userAchievements.findMany({
        where: eq(userAchievements.userId, targetUserId),
        with: {
            achievement: true
        }
    });

    // 3. Get Heatmap Data (Last 28 days)
    const last28Days = subDays(startOfDay(new Date()), 27);
    const recentLogs = await db
        .select({
            date: workoutLogs.date,
        })
        .from(workoutLogs)
        .where(
            and(
                eq(workoutLogs.userId, targetUserId),
                gte(workoutLogs.date, last28Days)
            )
        );

    // Map logs to a simple date activity map
    const activityMap: Record<string, boolean> = {};
    recentLogs.forEach(log => {
        const dateKey = format(new Date(log.date), 'yyyy-MM-dd');
        activityMap[dateKey] = true;
    });

    const heatmap = [];
    for (let i = 0; i < 28; i++) {
        const d = subDays(new Date(), 27 - i);
        const dateKey = format(d, 'yyyy-MM-dd');
        heatmap.push({
            date: dateKey,
            active: !!activityMap[dateKey]
        });
    }

    // 4. Check if current user is following
    let isFollowing = false;
    if (currentUserId !== targetUserId) {
        const followCheck = await db.query.followers.findFirst({
            where: and(
                eq(followers.userId, currentUserId),
                eq(followers.followerId, targetUserId)
            )
        });
        isFollowing = !!followCheck;
    }

    // 5. Get recent posts
    const userPosts = await db.query.posts.findMany({
        where: eq(posts.userId, targetUserId),
        orderBy: [desc(posts.createdAt)],
        limit: 10,
        with: {
            likes: true,
            comments: true
        }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        level: user.level,
        xp: user.xp,
        role: user.role,
        bio: user.userProfile?.mainGoal || "Fitness Enthusiast",
        createdAt: user.createdAt,
      },
      stats: {
        followers: followersCount.count,
        following: followingCount.count,
        posts: postsCount.count,
        totalWorkouts: workoutStats.count || 0,
        totalCalories: Number(workoutStats.totalCalories) || 0,
        streak: streakInfo?.currentStreak || 0,
        achievements: userAcc.length,
        heatmap: heatmap
      },
      isFollowing,
      posts: userPosts,
      achievements: userAcc.map(ua => ua.achievement)
    });

  } catch (error) {
    console.error("GET_PROFILE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}