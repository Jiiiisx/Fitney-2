import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { 
    workoutLogs, 
    userStreaks, 
    userPlans, 
    userPlanDays, 
    waterLogs, 
    users, 
    bodyMeasurements, 
    foodLogs, 
    foods 
} from "@/app/lib/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { updateUserStreak } from "@/app/lib/streaks";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { role: true }
    });
    const isPremium = user?.role === 'premium' || user?.role === 'admin';

    const todayStart = startOfDay(new Date());
    const sevenDaysAgo = subDays(todayStart, 6);
    const fourteenDaysAgo = subDays(todayStart, 13);
    const fiftyDaysAgo = subDays(todayStart, 50);
    const thirtyDaysAgo = subDays(todayStart, 30);
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // 0. Today's Plan
    const planQuery = await db
      .select({
        planName: userPlanDays.name,
        description: userPlanDays.description,
        programName: userPlans.sourceProgramId, 
      })
      .from(userPlanDays)
      .innerJoin(userPlans, eq(userPlanDays.userPlanId, userPlans.id))
      .where(and(eq(userPlans.userId, userId), eq(userPlans.isActive, true), eq(userPlanDays.date, todayStr)))
      .limit(1);
    const todaysPlan = planQuery.length > 0 ? planQuery[0] : null;

    // 1. Today's Workout Stats
    const todayLogs = await db.select().from(workoutLogs).where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.date, todayStart)));
    
    let totalSteps = 0;
    todayLogs.forEach(log => {
        if (log.distance && Number(log.distance) > 0) {
            totalSteps += Math.floor(Number(log.distance) * 1250);
        } else {
            const duration = log.durationMin || 0;
            totalSteps += log.type === 'Cardio' ? duration * 100 : duration * 30;
        }
    });

    const todayWater = await db.select({ amount: waterLogs.amountMl }).from(waterLogs).where(and(eq(waterLogs.userId, userId), eq(waterLogs.date, todayStr)));
    const totalWater = todayWater.reduce((acc, log) => acc + log.amount, 0);

    const todayStats = {
      duration: todayLogs.reduce((acc, log) => acc + (log.durationMin || 0), 0),
      calories: todayLogs.reduce((acc, log) => acc + (log.caloriesBurned || 0), 0),
      workouts: todayLogs.length,
      water: totalWater,
      steps: totalSteps
    };

    // 2. Weekly Activity & Insights
    const weeklyLogs = await db.select().from(workoutLogs).where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.date, sevenDaysAgo)));
    const activityMap = new Map();
    weeklyLogs.forEach(log => {
        const dayStr = format(new Date(log.date), 'EEE');
        activityMap.set(dayStr, (activityMap.get(dayStr) || 0) + (log.durationMin || 0));
    });
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const s = format(d, 'EEE');
        weeklyActivity.push({ name: s, value: activityMap.get(s) || 0 });
    }

    // 3. Streak & Heatmap
    const streakData = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1);
    let currentStreak = streakData[0]?.currentStreak || 0;

    const heatmapLogs = await db.select({ date: workoutLogs.date }).from(workoutLogs).where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.date, fiftyDaysAgo)));
    const heatmapData = [];
    for (let i = 49; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = d.toISOString().split("T")[0];
      const count = heatmapLogs.filter(l => l.date.toISOString().split("T")[0] === key).length;
      heatmapData.push({ date: key, count });
    }

    // 4. PREMUM: Fitness Radar
    const monthlyLogs = await db.select().from(workoutLogs).where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.date, thirtyDaysAgo)));
    const consistency = Math.min(100, Math.round((monthlyLogs.length / 15) * 100)) || 5;
    const strength = Math.round((monthlyLogs.filter(l => l.type === 'Strength').length / (monthlyLogs.length || 1)) * 100) || 10;
    const cardio = Math.round((monthlyLogs.filter(l => l.type === 'Cardio').length / (monthlyLogs.length || 1)) * 100) || 10;
    const fitnessRadar = [
        { subject: 'Consistency', A: consistency },
        { subject: 'Strength', A: strength },
        { subject: 'Cardio', A: cardio },
        { subject: 'Variety', A: Math.min(100, new Set(monthlyLogs.map(l => l.type)).size * 20) },
        { subject: 'Intensity', A: Math.min(100, Math.round((monthlyLogs.reduce((a, b) => a + (b.durationMin || 0), 0) / (monthlyLogs.length || 1)) / 60 * 100)) },
    ];

    // 5. PREMIUM: Trend Correlation (Weight vs Calories)
    const weightLogs = await db.select().from(bodyMeasurements).where(and(eq(bodyMeasurements.userId, userId), gte(bodyMeasurements.date, thirtyDaysAgo))).orderBy(bodyMeasurements.date);
    const calorieLogs = await db.select({ date: foodLogs.date, cals: sql<number>`sum(${foodLogs.servingSizeG} * ${foods.caloriesPer100g} / 100)` }).from(foodLogs).innerJoin(foods, eq(foodLogs.foodId, foods.id)).where(and(eq(foodLogs.userId, userId), gte(foodLogs.date, thirtyDaysAgo))).groupBy(foodLogs.date);

    const trendData = [];
    for (let i = 29; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dStr = format(d, 'yyyy-MM-dd');
        const w = weightLogs.find(wl => wl.date === dStr);
        const c = calorieLogs.find(cl => cl.date === dStr);
        trendData.push({
            date: format(d, 'MMM d'),
            weight: w ? parseFloat(w.weightKg || "0") : null,
            calories: c ? Math.round(Number(c.cals)) : null
        });
    }

    return NextResponse.json({
        isPremium,
        today: todayStats,
        todaysPlan,
        weekly: weeklyActivity,
        recent: await db.select().from(workoutLogs).where(eq(workoutLogs.userId, userId)).orderBy(desc(workoutLogs.date)).limit(3),
        streak: currentStreak,
        insight: "Keep it up!",
        breakdown: { mostFrequent: "N/A", avgDuration: 0, heatmap: heatmapData },
        fitnessRadar,
        trendData
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}