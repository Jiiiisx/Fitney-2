import { db } from "@/app/lib/db";
import { users, followers, hashtags, postHashtags } from "@/app/lib/schema";
import { eq, sql, desc, inArray } from "drizzle-orm";
import { cache } from 'react';

// Cache the results for valid RSC re-use if called multiple times, 
// though for this specific case it's per request.
export const getSuggestions = cache(async (currentUserId: string) => {
    // 1. Ambil daftar ID user yang sudah difollow
    const following = await db
        .select({ id: followers.userId })
        .from(followers)
        .where(eq(followers.followerId, currentUserId));

    const followingIds = following.map((f) => f.id);

    // Tambahkan ID user sendiri agar tidak muncul di saran
    followingIds.push(currentUserId);

    // 2. Ambil user yang TIDAK ada di daftar followingIds
    const suggestions = await db.query.users.findMany({
        where: (users, { notInArray }) => notInArray(users.id, followingIds),
        limit: 5,
        columns: {
            id: true,
            username: true,
            fullName: true,
            imageUrl: true,
            level: true,
        },
    });

    return suggestions.map(user => ({
        ...user,
        isFollowing: false
    }));
});

export const getTrendingHashtags = cache(async () => {
    const trending = await db
        .select({
            tag: hashtags.tag,
            count: sql<number>`cast(count(${postHashtags.postId}) as int)`,
        })
        .from(hashtags)
        .leftJoin(postHashtags, eq(hashtags.id, postHashtags.hashtagId))
        .groupBy(hashtags.id)
        .orderBy(desc(sql`count(${postHashtags.postId})`))
        .limit(10);

    return trending;
});

// Mock logic for achievers based on the API behavior or placeholder
export const getTopAchievers = cache(async (currentUserId: string) => {
    // Logic untuk ranking teman berdasarkan XP/Level.
    // 1. Get friend IDs
    const friendsStart = await db.select({ id: followers.userId }).from(followers).where(eq(followers.followerId, currentUserId));
    const friendIds = friendsStart.map(f => f.id);
    friendIds.push(currentUserId); // Add self

    // 2. Fetch users sorted by Level/XP
    const topUsers = await db.query.users.findMany({
        where: (users, { inArray }) => inArray(users.id, friendIds),
        orderBy: (users, { desc }) => [desc(users.level), desc(users.xp)],
        limit: 5,
        columns: {
            id: true,
            username: true,
            fullName: true,
            level: true,
            xp: true,
        }
    });

    // 3. Transform
    return topUsers.map((u, index) => ({
        id: u.id,
        rank: index + 1,
        name: u.fullName || u.username,
        isMe: u.id === currentUserId,
        stat: `Lvl ${u.level} • ${u.xp} XP`
    }));
});
