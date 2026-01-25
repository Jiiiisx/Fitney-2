import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { stories, followers, users, storyViews } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { desc, eq, gt, inArray, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (auth.error) return auth.error;

        const currentUserId = auth.user.userId;

        // 1. Get friends (following)
        const myFollowing = await db
            .select({ id: followers.userId })
            .from(followers)
            .where(eq(followers.followerId, currentUserId));

        const friendIds = myFollowing.map(f => f.id);
        friendIds.push(currentUserId); // Include self

        // 2. Calculate 24h ago
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // 3. Fetch active stories with manual joins for better stability
        const results = await db
            .select({
                id: stories.id,
                userId: stories.userId,
                mediaUrl: stories.mediaUrl,
                mediaType: stories.mediaType,
                createdAt: stories.createdAt,
                user: {
                    id: users.id,
                    username: users.username,
                    fullName: users.fullName,
                    imageUrl: users.imageUrl,
                },
                // Check if viewed by current user
                isViewed: sql<boolean>`EXISTS (
                    SELECT 1 FROM ${storyViews} 
                    WHERE ${storyViews.storyId} = ${stories.id} 
                    AND ${storyViews.userId} = ${currentUserId}
                )`
            })
            .from(stories)
            .innerJoin(users, eq(stories.userId, users.id))
            .where(and(
                inArray(stories.userId, friendIds),
                gt(stories.createdAt, oneDayAgo)
            ))
            .orderBy(desc(stories.createdAt));

        return NextResponse.json(results);

    } catch (error) {
        console.error("GET_STORIES_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (auth.error) return auth.error;

        const body = await req.json();
        const { mediaUrl, mediaType = 'image' } = body;

        if (!mediaUrl) {
            return NextResponse.json({ error: "Media is required" }, { status: 400 });
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const newStory = await db.insert(stories).values({
            userId: auth.user.userId,
            mediaUrl,
            mediaType,
            expiresAt
        }).returning();

        return NextResponse.json(newStory[0], { status: 201 });

    } catch (error) {
        console.error("CREATE_STORY_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}