import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users, posts, groups, workoutLogs } from "@/app/lib/schema";
import { verifyAdmin } from "@/app/lib/auth";
import { count, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // 1. Keamanan: Cek apakah benar-benar admin
    const auth = await verifyAdmin(req);
    if (auth.error) return auth.error;

    // 2. Ambil data statistik secara paralel
    const [userCount, postsCount, groupsCount, logsCount] = await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(posts),
      db.select({ value: count() }).from(groups),
      db.select({ value: count() }).from(workoutLogs),
    ]);

    // 3. Ambil data user terbaru (misal 5 orang)
    const recentUsers = await db.query.users.findMany({
        orderBy: (users, { desc }) => [desc(users.createdAt)],
        limit: 5,
        columns: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            role: true,
            createdAt: true,
        }
    });

    return NextResponse.json({
      stats: {
        totalUsers: userCount[0].value,
        totalPosts: postsCount[0].value,
        totalGroups: groupsCount[0].value,
        totalWorkouts: logsCount[0].value,
      },
      recentUsers
    });

  } catch (error) {
    console.error("ADMIN_STATS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
