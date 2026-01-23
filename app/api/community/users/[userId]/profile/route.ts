import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { users, followers, posts, userProfiles } from "@/app/lib/schema";
import { eq, count, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const currentUserId = auth.user.userId;
    const { userId } = await params;

    // 1. Get User Basic Info
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        userProfile: true, // Join extra profile details
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Get Stats (Followers, Following, Posts)
    const followersCount = await db
      .select({ count: count() })
      .from(followers)
      .where(eq(followers.followerId, userId));

    const followingCount = await db
        .select({ count: count() })
        .from(followers)
        .where(eq(followers.userId, userId));

    const postsCount = await db
        .select({ count: count() })
        .from(posts)
        .where(eq(posts.userId, userId));

    // 3. Check if current user is following this user
    let isFollowing = false;
    if (currentUserId !== userId) {
        const followCheck = await db.query.followers.findFirst({
            where: and(
                eq(followers.userId, currentUserId),
                eq(followers.followerId, userId)
            )
        });
        isFollowing = !!followCheck;
    }

    // 4. Get recent posts (limit 5 for preview, or pagination logic can be added later)
    const userPosts = await db.query.posts.findMany({
        where: eq(posts.userId, userId),
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
        bio: user.userProfile?.mainGoal || "Fitness Enthusiast", // Fallback bio
        joinDate: user.createdAt,
      },
      stats: {
        followers: followersCount[0].count,
        following: followingCount[0].count,
        posts: postsCount[0].count,
      },
      isFollowing,
      posts: userPosts
    });

  } catch (error) {
    console.error("GET_PROFILE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
