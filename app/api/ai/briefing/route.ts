import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { sleepLogs, workoutLogs, foodLogs, foods, userProfiles, userGoals, users } from "@/app/lib/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { subDays, format, differenceInDays } from "date-fns";
import { model, extractJSON } from "@/app/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const today = new Date();
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');
    const sevenDaysAgo = subDays(today, 7);

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

    // 2. Construct Sophisticated Context
    const context = `
      USER PROFILE:
      - Main Goal: ${userProfile?.mainGoal || 'General Fitness'}
      - Experience: ${userProfile?.experienceLevel || 'Beginner'}
      - Active Goals: ${activeGoals.map(g => `${g.title} (Target: ${g.targetValue} ${g.metric})`).join(', ') || 'None set'}

      SLEEP METRICS:
      - Last Night: ${lastSleep ? `${lastSleep.qualityRating}/5 Rating` : 'No data recorded'}
      - 7-Day Avg Quality: ${avgSleepQuality.toFixed(1)}/5
      - Trend: ${lastSleep && lastSleep.qualityRating ? (lastSleep.qualityRating >= avgSleepQuality ? 'Improving' : 'Declining') : 'Unknown'}

      WORKOUT ACTIVITY (Last 7 Days):
      - Frequency: ${recentWorkouts.length} sessions
      - Details: ${recentWorkouts.map(w => `${w.type} (${w.durationMin}m)`).join(', ')}

      NUTRITION TODAY:
      - Calories: ${Math.round(Number(todayNutrition[0]?.calories || 0))} kcal
      - Protein: ${Math.round(Number(todayNutrition[0]?.protein || 0))}g
    `;

    const systemPrompt = `
      You are an elite Sport Scientist and AI Performance Coach.
      Analyze the user's data to generate a "Daily Readiness Briefing".
      
      CRITICAL RULES:
      1. Be specific. Reference their actual data (e.g., "Your sleep dropped to 3/5...").
      2. If data is missing (like sleep), gently remind them that data improves accuracy, but give general advice based on their Goal.
      3. Calculate a "Readiness Score" (0-100) based on sleep quality, recent workout volume (fatigue), and nutrition.
      4. Output strict JSON.

      JSON Format:
      {
        "readinessScore": number,
        "signals": [
          {"type": "sleep" | "recovery" | "nutrition", "status": "optimal" | "warning" | "critical", "msg": "Detailed observation"}
        ],
        "recommendations": ["Actionable advice 1", "Actionable advice 2"],
        "topInsight": "A high-level synthesis of their current state (1 sentence)."
      }
    `;

    try {
        const result = await model.generateContent(systemPrompt + "\n\nUSER DATA:\n" + context);
        const response = await result.response;
        const text = response.text();
        
        const briefing = extractJSON(text);

        if (!briefing) throw new Error("Failed to parse AI response");

        return NextResponse.json({
            date: format(today, 'MMMM d, yyyy'),
            ...briefing
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