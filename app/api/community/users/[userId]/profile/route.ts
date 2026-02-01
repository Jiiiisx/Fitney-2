import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { users, followers, posts, userProfiles, userAchievements, workoutLogs } from "@/app/lib/schema";
import { eq, count, desc, and, or } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const currentUserId = auth.user.userId;
    const { userId: identifier } = await params;

    // 1. Get User Basic Info (ID or Username)
    // UUID format regex (relaxed to support any version)
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

    // 2. Get Stats (Followers, Following, Posts, Workouts, Achievements)
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

    const [workoutCount] = await db
        .select({ value: count() })
        .from(workoutLogs)
        .where(eq(workoutLogs.userId, targetUserId));

    const userAcc = await db.query.userAchievements.findMany({
        where: eq(userAchievements.userId, targetUserId),
        with: {
            achievement: true
        }
    });

    // 3. Check if current user is following this user
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

    // 4. Get recent posts
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
        totalWorkouts: workoutCount.value,
        achievements: userAcc.length
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
