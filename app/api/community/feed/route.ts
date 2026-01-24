import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { posts, followers } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { desc, eq, inArray, and, lt, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const currentUserId = auth.user.userId;

    // URL params for infinite scroll
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");
    const cursor = searchParams.get("cursor"); // Date string ISO

    // Tentukan kondisi WHERE
    let whereCondition: any = undefined;
    const conditions = [];

    // Pagination specific
    if (cursor) {
      conditions.push(lt(posts.createdAt, new Date(cursor)));
    }

    if (filter === "mine") {
      conditions.push(eq(posts.userId, currentUserId));
    } else if (filter === "friends") {
      // 1. Get users I follow
      const myFollowing = await db
        .select({ id: followers.userId }) // The user being followed
        .from(followers)
        .where(eq(followers.followerId, currentUserId));

      const myFollowingIds = myFollowing.map(f => f.id);
      myFollowingIds.push(currentUserId); // Include my own posts

      if (myFollowingIds.length === 0) {
        return NextResponse.json({ posts: [], nextCursor: null });
      }

      // Simplified: Show posts from anyone I follow (Instagram style)
      conditions.push(inArray(posts.userId, myFollowingIds));
    }

    if (conditions.length > 0) {
      whereCondition = and(...conditions);
    }

    const limit = 10;
    const feed = await db.query.posts.findMany({
      where: whereCondition,
      orderBy: [desc(posts.createdAt)],
      limit: limit + 1, // Fetch +1 to check if next page exists
      with: {
        user: {
          columns: {
            username: true,
            fullName: true,
            imageUrl: true,
          }
        },
        likes: true,
        comments: true,
        savedBy: {
          where: (savedPosts, { eq }) => eq(savedPosts.userId, currentUserId),
        }
      }
    });

    let nextCursor = null;
    if (feed.length > limit) {
      const nextItem = feed.pop(); // Remove the extra item
      if (nextItem && nextItem.createdAt) { // Check if nextItem and createdAt are defined
        nextCursor = nextItem.createdAt.toISOString();
      }
    }

    const formattedFeed = feed.map(post => ({
      id: post.id,
      userId: post.userId,
      content: post.content,
      images: post.images || [], // Handle JSON
      // Backward compat if needed, but we removed imageUrl column
      createdAt: post.createdAt,
      user: {
        name: post.user.fullName || post.user.username,
        avatar: post.user.imageUrl,
        username: post.user.username
      },
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLiked: post.likes.some(like => like.userId === currentUserId),
      isSaved: post.savedBy && post.savedBy.length > 0,
    }));

    return NextResponse.json({
      posts: formattedFeed,
      nextCursor
    });

  } catch (error) {
    console.error("GET_FEED_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}