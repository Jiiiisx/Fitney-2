import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { stories, followers } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { desc, eq, gt, inArray, or, and } from "drizzle-orm";

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

        // 3. Fetch active stories
        const activeStories = await db.query.stories.findMany({
            where: and(
                inArray(stories.userId, friendIds),
                gt(stories.createdAt, oneDayAgo)
            ),
            orderBy: [desc(stories.createdAt)],
            with: {
                user: {
                    columns: {
                        id: true,
                        username: true,
                        fullName: true,
                        imageUrl: true,
                    }
                }
            }
        });

        return NextResponse.json(activeStories);

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

        // Set expiry explicitly (though logic handles it by query)
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
