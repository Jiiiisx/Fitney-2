import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { sleepLogs, workoutLogs, foodLogs, foods, userProfiles, userGoals, users, dailyBriefings } from "@/app/lib/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { subDays, format, differenceInDays } from "date-fns";
import { model, extractJSON, safeGenerateContent } from "@/app/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const today = new Date();
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');
    const sevenDaysAgo = subDays(today, 7);

    // 0. CACHE CHECK: Check if briefing already exists for today
    // This dramatically reduces API calls and avoids Rate Limits (429)
    const existingBriefing = await db.select().from(dailyBriefings)
      .where(and(eq(dailyBriefings.userId, userId), eq(dailyBriefings.date, todayStr)))
      .limit(1);

    if (existingBriefing.length > 0) {
      console.log("Serving briefing from CACHE (DB)");
      const cachedData = existingBriefing[0].content as any;
      return NextResponse.json({
        date: format(today, 'MMMM d, yyyy'),
        ...cachedData
      });
    }

    // 1. Fetch RICH Context Data
    const [userProfile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    const activeGoals = await db.select().from(userGoals).where(eq(userGoals.userId, userId));
    
    // Sleep Data (Last night vs 7 day avg)
    const recentSleep = await db.select().from(sleepLogs)
        .where(and(eq(sleepLogs.userId, userId), gte(sleepLogs.date, format(sevenDaysAgo, 'yyyy-MM-dd'))))
        .orderBy(desc(sleepLogs.date));
    
    const lastSleep = recentSleep.find(s => s.date === yesterdayStr);
    const avgSleepQuality = recentSleep.length > 0 
        ? recentSleep.reduce((acc, curr) => acc + (curr.qualityRating || 0), 0) / recentSleep.length 
        : 0;

    // Workout Data (Last 7 days)
    const recentWorkouts = await db.select({
        type: workoutLogs.type,
        duration: workoutLogs.durationMin,
        date: workoutLogs.date,
        name: workoutLogs.name
    }).from(workoutLogs)
    .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.date, sevenDaysAgo)));

    // Nutrition Today
    const todayNutrition = await db.select({
        calories: sql<number>`sum(${foodLogs.servingSizeG} * ${foods.caloriesPer100g} / 100)`,
        protein: sql<number>`sum(${foodLogs.servingSizeG} * ${foods.proteinPer100g} / 100)`
    })
    .from(foodLogs)
    .innerJoin(foods, eq(foodLogs.foodId, foods.id))
    .where(and(eq(foodLogs.userId, userId), eq(foodLogs.date, todayStr)));

    // 2. TOKEN-OPTIMIZED CONTEXT (Compact format)
    const context = `
      GOAL:${userProfile?.mainGoal || 'Fit'}|EXP:${userProfile?.experienceLevel || 'Beg'}
      GOALS:${activeGoals.map(g => `${g.title}:${g.targetValue}${g.metric}`).join(',') || 'None'}
      SLEEP:Last:${lastSleep?.qualityRating || 'X'}/5|Avg:${avgSleepQuality.toFixed(1)}|Trend:${lastSleep && lastSleep.qualityRating ? (lastSleep.qualityRating >= avgSleepQuality ? 'Up' : 'Down') : 'X'}
      WORKOUTS:${recentWorkouts.length} sessions|Details:${recentWorkouts.map(w => `${w.type.slice(0,3)}:${w.durationMin}m`).join('|')}
      NUTRI:Cal:${Math.round(Number(todayNutrition[0]?.calories || 0))}|Prot:${Math.round(Number(todayNutrition[0]?.protein || 0))}g
    `;

    const systemPrompt = `
      Act: Sport Scientist.
      Task: Analyze provided USER DATA and generate a Daily Readiness Briefing.
      
      Requirements:
      1. Reference specific user data in your messages.
      2. Calculate a Readiness Score (0-100) based on fatigue and recovery.
      3. Provide 3 specific tips for each category: nutrition, planner, and community.
    `;

    try {
        const text = await safeGenerateContent(systemPrompt + "\n\nUSER DATA:\n" + context);
        const briefing = extractJSON(text);

        if (!briefing || typeof briefing !== 'object') {
            throw new Error("Invalid briefing structure");
        }

        // 3. SAVE TO CACHE
        try {
          await db.insert(dailyBriefings).values({
            userId: userId,
            date: todayStr,
            content: briefing,
          }).onConflictDoNothing(); // Prevent race conditions
          console.log("Briefing saved to CACHE");
        } catch (dbError) {
          console.error("Failed to cache briefing:", dbError);
          // Non-blocking error, continue serving response
        }

        return NextResponse.json({
            date: format(today, 'MMMM d, yyyy'),
            readinessScore: briefing.readinessScore || 70,
            signals: briefing.signals || [],
            recommendations: briefing.recommendations || [],
            topInsight: briefing.topInsight || "Data analyzed successfully.",
            contextualTips: briefing.contextualTips || { nutrition: [], planner: [], community: [] }
        });
    } catch (aiError) {
        console.error("GEMINI_CORE_ERROR", aiError);
        return NextResponse.json({
            date: format(today, 'MMMM d, yyyy'),
            readinessScore: 80,
            signals: [{ type: "recovery", status: "warning", msg: "Brain connection unstable. Using estimated baseline." }],
            recommendations: ["Log your sleep for better accuracy", "Stay hydrated"],
            topInsight: "AI is recalibrating. Maintain your routine."
        });
    }

  } catch (error) {
    console.error("AI_BRIEFING_API_ERROR", error);
    return NextResponse.json({ error: "Brain connection error" }, { status: 500 });
  }
}