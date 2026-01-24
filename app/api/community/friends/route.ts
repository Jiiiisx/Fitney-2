import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { users, followers } from "@/app/lib/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (auth.error) return auth.error;
        const currentUserId = auth.user.userId;

        // 1. Get users I follow
        const myFollowing = await db
            .select({ id: followers.userId }) // The user being followed
            .from(followers)
            .where(eq(followers.followerId, currentUserId));

        const myFollowingIds = myFollowing.map(f => f.id);

        if (myFollowingIds.length === 0) {
            return NextResponse.json([]);
        }

        // 2. Get users following me WHO ARE ALSO in myFollowingIds (Mutual)
        // "Friends" = Someone I follow AND they follow me back
        const mutualFriends = await db
            .select({
                id: users.id,
                username: users.username,
                fullName: users.fullName,
                imageUrl: users.imageUrl,
                level: users.level
            })
            .from(followers)
            .innerJoin(users, eq(followers.followerId, users.id)) // Get the person following me
            .where(
                and(
                    eq(followers.userId, currentUserId), // They are following me
                    inArray(followers.followerId, myFollowingIds) // AND they are in the list of people I follow
                )
            );

        return NextResponse.json(mutualFriends);

    } catch (error) {
        console.error("GET_FRIENDS_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
