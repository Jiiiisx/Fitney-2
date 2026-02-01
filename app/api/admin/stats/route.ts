import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users, posts, groups, workoutLogs } from "@/app/lib/schema";
import { sql, count, desc, gte } from "drizzle-orm";
import { verifyAdmin } from "@/app/lib/auth";
import { subDays, format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req);
    if (auth.error) return auth.error;

    // 1. Total Counters
    const [userCount] = await db.select({ value: count() }).from(users);
    const [postCount] = await db.select({ value: count() }).from(posts);
    const [groupCount] = await db.select({ value: count() }).from(groups);
    const [workoutCount] = await db.select({ value: count() }).from(workoutLogs);

    // 2. Growth Data (Last 7 days)
    const sevenDaysAgo = subDays(new Date(), 7);
    const growth = await db.select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count()
    })
    .from(users)
    .where(gte(users.createdAt, sevenDaysAgo))
    .groupBy(sql`DATE(${users.createdAt})`)
    .orderBy(sql`DATE(${users.createdAt})`);

    // 3. Recent Users
    const recentUsers = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
        limit: 5
    });

    // 4. Content Distribution (Mock data for pie chart if not enough actual variety)
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
            totalWorkouts: workoutCount.value
        },
        growthData: growth,
        recentUsers,
        contentStats
    });

  } catch (error) {
    console.error("ADMIN_STATS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
