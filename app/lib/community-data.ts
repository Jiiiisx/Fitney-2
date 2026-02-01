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

    // 2. Ambil user yang TIDAK ada di daftar followingIds dan bukan admin
    const suggestions = await db.query.users.findMany({
        where: (users, { notInArray, ne, and }) => and(
            notInArray(users.id, followingIds),
            ne(users.role, "admin")
        ),
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
            isFeatured: hashtags.isFeatured,
        })
        .from(hashtags)
        .leftJoin(postHashtags, eq(hashtags.id, postHashtags.hashtagId))
        .groupBy(hashtags.id)
        .orderBy(desc(hashtags.isFeatured), desc(sql`count(${postHashtags.postId})`))
        .limit(10);

    return trending;
});

// Global Leaderboard logic
export const getTopAchievers = cache(async (currentUserId: string) => {
    // Fetch all users sorted by Level/XP for a Global Leaderboard, excluding admins
    const topUsers = await db.query.users.findMany({
        where: (users, { ne }) => ne(users.role, "admin"),
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

    // Transform
    return topUsers.map((u, index) => ({
        id: u.id,
        rank: index + 1,
        name: u.fullName || u.username,
        isMe: u.id === currentUserId,
        stat: `Lvl ${u.level} • ${u.xp} XP`
    }));
});
