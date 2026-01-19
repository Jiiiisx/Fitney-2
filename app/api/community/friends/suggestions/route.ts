import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users, userProfiles, followers } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, and, ne, notInArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const currentUserId = auth.user.userId;

    // 1. Ambil profil user saat ini untuk tahu goal-nya
    const currentUserProfile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, currentUserId),
        columns: { mainGoal: true }
    });

    if (!currentUserProfile || !currentUserProfile.mainGoal) {
        // Fallback: Kembalikan random users jika user belum set goal
        const randomUsers = await db.query.users.findMany({
            where: ne(users.id, currentUserId),
            limit: 3,
            columns: { id: true, fullName: true, imageUrl: true, username: true }
        });
        return NextResponse.json(randomUsers.map(u => ({...u, reason: "New member"})));
    }

    const targetGoal = currentUserProfile.mainGoal;

    // 2. Ambil user yang sudah difollow (untuk di-exclude)
    const following = await db.query.followers.findMany({
        where: eq(followers.userId, currentUserId),
        columns: { followerId: true }
    });
    const followingIds = following.map(f => f.followerId);
    followingIds.push(currentUserId); // Exclude diri sendiri

    // 3. Cari user dengan goal yang sama
    const suggestions = await db.select({
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        imageUrl: users.imageUrl,
        goal: userProfiles.mainGoal
    })
    .from(users)
    .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(and(
        eq(userProfiles.mainGoal, targetGoal),
        notInArray(users.id, followingIds)
    ))
    .limit(5);

    return NextResponse.json(suggestions.map(u => ({
        ...u,
        reason: `Also interested in ${u.goal?.replace('_', ' ')}`
    })));

  } catch (error) {
    console.error("GET_FRIEND_SUGGESTIONS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
