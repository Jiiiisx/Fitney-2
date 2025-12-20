import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { workoutLogs, userStreaks } from "@/app/lib/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const todayStart = startOfDay(new Date());
    const sevenDaysAgo = subDays(todayStart, 6);
    const fiftyDaysAgo = subDays(todayStart, 50);

    // 1. Get Today's Stats
    const todayLogs = await db
      .select({
        duration: workoutLogs.durationMin,
        calories: workoutLogs.caloriesBurned,
      })
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, userId),
          gte(workoutLogs.date, todayStart)
        )
      );

    const todayStats = {
      duration: todayLogs.reduce((acc, log) => acc + (log.duration || 0), 0),
      calories: todayLogs.reduce((acc, log) => acc + (log.calories || 0), 0),
      workouts: todayLogs.length
    };

    // 2. Get Weekly Activity (Grafik)
    const weeklyLogs = await db
      .select({
        date: workoutLogs.date,
        duration: workoutLogs.durationMin,
      })
      .from(workoutLogs)
      .where(
        and(
            eq(workoutLogs.userId, userId),
            gte(workoutLogs.date, sevenDaysAgo)
        )
      );

    const activityMap = new Map<string, number>();
    
    // Process logs
    weeklyLogs.forEach(log => {
        const dayStr = format(new Date(log.date), 'EEE'); // "Mon"
        const currentVal = activityMap.get(dayStr) || 0;
        activityMap.set(dayStr, currentVal + (log.duration || 0));
    });

    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
        const dateObj = subDays(new Date(), i);
        const dayStr = format(dateObj, 'EEE');
        weeklyActivity.push({
            name: dayStr,
            value: activityMap.get(dayStr) || 0
        });
    }

    // 3. Recent Activity (3 Terakhir)
    const recentLogs = await db
        .select()
        .from(workoutLogs)
        .where(eq(workoutLogs.userId, userId))
        .orderBy(desc(workoutLogs.date))
        .limit(3);

    const streakData = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1);

    const current_streak = streakData.length > 0 ? streakData[0].currentStreak: 0;

    const freqQuery = await db
      .select({ type: workoutLogs.type, count: sql<number>`count(*)` })
      .from(workoutLogs)
      .where(eq(workoutLogs.userId, userId))
      .groupBy(workoutLogs.type)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    const mostFrequent = freqQuery.length > 0 ? freqQuery[0].type : "No Data";

    const avgQuery = await db
      .select({ avg: sql<string>`avg(${workoutLogs.durationMin})` })
      .from(workoutLogs)
      .where(eq(workoutLogs.userId, userId));

    const avgDuration = avgQuery[0]?.avg ? Math.round(parseFloat(avgQuery[0].avg)) : 0;

    const heatmapLogs = await db
      .select({ date: workoutLogs.date })
      .from(workoutLogs)
      .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.date, fiftyDaysAgo)));

    const heatmapMap = new Map<string, number>();
    heatmapLogs.forEach(log => {
      const dateKey = log.date.toISOString().split("T")[0];
      heatmapMap.set(dateKey, (heatmapMap.get(dateKey) || 0) + 1);
    });

    const heatmapData = [];
    for (let i = 49; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateKey = d.toISOString().split("T")[0];
      heatmapData.push({
        date: dateKey,
        count: heatmapMap.get(dateKey) || 0
      });
    }

    return NextResponse.json({
        today: todayStats,
        weekly: weeklyActivity,
        recent: recentLogs,
        streak: current_streak,
        breakdown: {
          mostFrequent,
          avgDuration,
          heatmap: heatmapData
        }
    });

  } catch (error) {
    console.error("DASHBOARD_STATS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
