import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { workoutLogs, userStreaks, userPlans, userPlanDays, waterLogs } from "@/app/lib/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { updateUserStreak } from "@/app/lib/streaks";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const todayStart = startOfDay(new Date());
    const sevenDaysAgo = subDays(todayStart, 6);
    const fourteenDaysAgo = subDays(todayStart, 13);
    const fiftyDaysAgo = subDays(todayStart, 50);
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // 0. Get Today's Plan
    const planQuery = await db
      .select({
        planName: userPlanDays.name,
        description: userPlanDays.description,
        programName: userPlans.sourceProgramId, 
      })
      .from(userPlanDays)
      .innerJoin(userPlans, eq(userPlanDays.userPlanId, userPlans.id))
      .where(
        and(
          eq(userPlans.userId, userId),
          eq(userPlans.isActive, true),
          eq(userPlanDays.date, todayStr)
        )
      )
      .limit(1);
    
    const todaysPlan = planQuery.length > 0 ? planQuery[0] : null;

    // 1. Get Today's Stats (Workouts)
    const todayLogs = await db
      .select({
        type: workoutLogs.type,
        duration: workoutLogs.durationMin,
        calories: workoutLogs.caloriesBurned,
        distance: workoutLogs.distanceKm,
      })
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, userId),
          gte(workoutLogs.date, todayStart)
        )
      );

    // Calculate Steps (Estimation)
    let totalSteps = 0;
    todayLogs.forEach(log => {
        // If it's a running/walking activity (has distance), prioritize distance
        if (log.distance && Number(log.distance) > 0) {
            // Approx 1250 steps per km
            totalSteps += Math.floor(Number(log.distance) * 1250);
        } else {
            // Fallback to duration-based estimation
            const duration = log.duration || 0;
            if (log.type === 'Cardio' || log.type?.toLowerCase().includes('run') || log.type?.toLowerCase().includes('walk')) {
                // Cardio: approx 100 steps per min
                totalSteps += duration * 100;
            } else if (log.type === 'Strength' || log.type === 'Weightlifting') {
                // Strength: approx 30 steps per min (resting, moving weights)
                totalSteps += duration * 30;
            } else {
                // Yoga/Other: low step count
                totalSteps += duration * 10;
            }
        }
    });

    // 1b. Get Today's Water
    const todayWaterLogs = await db
      .select({
        amount: waterLogs.amountMl
      })
      .from(waterLogs)
      .where(
        and(
          eq(waterLogs.userId, userId),
          eq(waterLogs.date, todayStr) // waterLogs pakai column 'date' (YYYY-MM-DD string di Drizzle schema 'date') atau date object? Schema says 'date'. 
          // Di schema: date: date('date').notNull() -> string YYYY-MM-DD
        )
      );
    
    const totalWater = todayWaterLogs.reduce((acc, log) => acc + log.amount, 0);

    const todayStats = {
      duration: todayLogs.reduce((acc, log) => acc + (log.duration || 0), 0),
      calories: todayLogs.reduce((acc, log) => acc + (log.calories || 0), 0),
      workouts: todayLogs.length,
      water: totalWater,
      steps: totalSteps // Add calculated steps
    };

    // 2. Get Weekly Activity (Grafik & Insight)
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

    // Calculate Insight
    // Last week count (7 days ago to today) vs Previous week (14 days ago to 7 days ago)
    const currentWeekCount = weeklyLogs.length;
    
    const previousWeekLogs = await db
      .select({ count: sql<number>`count(*)` })
      .from(workoutLogs)
      .where(
        and(
            eq(workoutLogs.userId, userId),
            gte(workoutLogs.date, fourteenDaysAgo),
            lte(workoutLogs.date, sevenDaysAgo)
        )
      );
    const prevWeekCount = Number(previousWeekLogs[0].count);

    let insight = "Keep pushing! Every workout counts towards your goal.";
    if (currentWeekCount > prevWeekCount) {
        const diff = currentWeekCount - prevWeekCount;
        insight = `Good job! You did ${diff} more workout${diff > 1 ? 's' : ''} this week compared to last week.`;
    } else if (currentWeekCount === prevWeekCount && currentWeekCount > 0) {
        insight = "Consistent! You're matching your workout pace from last week.";
    } else if (currentWeekCount < prevWeekCount) {
        insight = "Don't give up! Try to beat your record from last week.";
    } else if (currentWeekCount === 0 && prevWeekCount === 0) {
        insight = "Start small! Log your first workout this week to build momentum.";
    }

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

    let streakData = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1);

    // If no streak record exists, or it's 0 (potential stale default), force a recalculation
    if (streakData.length === 0 || (streakData[0].currentStreak || 0) === 0) {
       await updateUserStreak(userId);
       // Re-fetch
       streakData = await db
        .select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId))
        .limit(1);
    }

    let current_streak = 0;
    if (streakData.length > 0) {
        current_streak = streakData[0].currentStreak || 0;
        const lastActivityDate = streakData[0].lastActivityDate;
        
        if (current_streak > 0 && lastActivityDate) {
             const lastDate = new Date(lastActivityDate);
             const today = startOfDay(new Date());
             const yesterday = subDays(today, 1);
             
             const lastStr = format(lastDate, 'yyyy-MM-dd');
             const todayStr = format(today, 'yyyy-MM-dd');
             const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

             if (lastStr !== todayStr && lastStr !== yesterdayStr) {
                current_streak = 0;
             }
        }
    }

    const freqQuery = await db
      .select({ type: workoutLogs.type, count: sql<number>`count(*)` })
      .from(workoutLogs)
      .where(eq(workoutLogs.userId, userId))
      .groupBy(workoutLogs.type)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    const mostFrequent = freqQuery.length > 0 ? freqQuery[0].type : "N/A";

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
        todaysPlan,
        weekly: weeklyActivity,
        recent: recentLogs,
        streak: current_streak,
        insight, // NEW FIELD
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
