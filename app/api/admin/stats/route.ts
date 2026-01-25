import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users, posts, groups, workoutLogs } from "@/app/lib/schema";
import { count, sql, desc, gte } from "drizzle-orm";
import { verifyAdmin } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  try {
    // 1. Basic Stats
    const [userCount] = await db.select({ value: count() }).from(users);
    const [postCount] = await db.select({ value: count() }).from(posts);
    const [groupCount] = await db.select({ value: count() }).from(groups);
    const [workoutCount] = await db.select({ value: count() }).from(workoutLogs);

    // 2. Recent Users
    const recentUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(5);

    // 3. Growth Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const growthData = await db.select({
      date: sql<string>`TO_CHAR(${users.createdAt}, 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(users)
    .where(gte(users.createdAt, sevenDaysAgo))
    .groupBy(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM-DD')`);

    // 4. Content Distribution (Simplified)
    const contentStats = [
      { name: 'Posts', value: postCount.value },
      { name: 'Groups', value: groupCount.value },
      { name: 'Workouts', value: workoutCount.value },
    ];

    return NextResponse.json({
      stats: {
        totalUsers: userCount.value,
        totalPosts: postCount.value,
        totalGroups: groupCount.value,
        totalWorkouts: workoutCount.value,
      },
      recentUsers,
      growthData,
      contentStats
    });
  } catch (error) {
    console.error("ADMIN_STATS_ERROR", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}