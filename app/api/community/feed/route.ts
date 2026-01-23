import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { posts, followers } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { desc, eq, inArray, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const currentUserId = auth.user.userId;

    // Ambil parameter filter dari URL
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");

    // Tentukan kondisi WHERE
    let whereCondition = undefined;
    
    if (filter === "mine") {
      // Jika filter 'mine', hanya ambil post milik user yang login
      whereCondition = eq(posts.userId, currentUserId);
    } else if (filter === "friends") {
      // 1. Get users I follow
      const myFollowing = await db
        .select({ id: followers.userId }) // The user being followed
        .from(followers)
        .where(eq(followers.followerId, currentUserId));
      
      const myFollowingIds = myFollowing.map(f => f.id);

      if (myFollowingIds.length === 0) {
        return NextResponse.json([]); // No friends/following, empty feed
      }

      // 2. Get users following me (from the list I already follow - intersection)
      const mutualFriends = await db
        .select({ id: followers.followerId }) // The follower (them)
        .from(followers)
        .where(
          and(
            eq(followers.userId, currentUserId), // They are following me
            inArray(followers.followerId, myFollowingIds) // AND I am following them
          )
        );

      const mutualFriendIds = mutualFriends.map(f => f.id);

      // Include my own posts in "friends" feed or strict only friends? 
      // Usually "Friends Feed" includes self. Let's add self.
      mutualFriendIds.push(currentUserId);

      if (mutualFriendIds.length === 0) {
         return NextResponse.json([]);
      }

      whereCondition = inArray(posts.userId, mutualFriendIds);
    }

    const feed = await db.query.posts.findMany({
      where: whereCondition, // Terapkan filter di sini
      orderBy: [desc(posts.createdAt)],
      limit: 20, 
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
      }
    });

    const formattedFeed = feed.map(post => ({
      id: post.id,
      userId: post.userId,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      user: {
        name: post.user.fullName || post.user.username,
        avatar: post.user.imageUrl,
        username: post.user.username
      },
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLiked: post.likes.some(like => like.userId === currentUserId)
    }));

    return NextResponse.json(formattedFeed);

  } catch (error) {
    console.error("GET_FEED_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}