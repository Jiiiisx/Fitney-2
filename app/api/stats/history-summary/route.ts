import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { workoutLogs } from "@/app/lib/schema";
import { eq, sql, gte, and } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { startOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const firstDayOfMonth = startOfMonth(new Date());

    const [generalStats] = await db.select({
      totalWorkouts: sql<number>`count(${workoutLogs.id})`,
      totalCalories: sql<number>`sum(${workoutLogs.caloriesBurned})`,
      avgDuration: sql<number>`avg(${workoutLogs.durationMin})`
    }).from(workoutLogs).where(eq(workoutLogs.userId, userId));

    const [monthlyStats] = await db.select({
      count: sql<number>`count(${workoutLogs.id})`
    }).from(workoutLogs).where(
        and(
            eq(workoutLogs.userId, userId),
            gte(workoutLogs.date, firstDayOfMonth)
        )
    );

    return NextResponse.json({
      totalWorkouts: Number(generalStats?.totalWorkouts || 0),
      totalCalories: Number(generalStats?.totalCalories || 0),
      avgDuration: Number(generalStats?.avgDuration || 0),
      thisMonthCount: Number(monthlyStats?.count || 0)
    });

  } catch (error) {
    console.error("HISTORY_SUMMARY_ERROR", error);
    return NextResponse.json({ error: "Failed to load summary" }, { status: 500 });
  }
}
