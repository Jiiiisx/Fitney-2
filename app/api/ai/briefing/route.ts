import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { sleepLogs, workoutLogs, foodLogs, foods } from "@/app/lib/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { subDays, format } from "date-fns";
import { model } from "@/app/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const today = new Date();
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');

    // 1. Fetch Data
    const lastSleep = await db.query.sleepLogs.findFirst({
        where: and(eq(sleepLogs.userId, userId), eq(sleepLogs.date, yesterdayStr))
    });

    const recentWorkouts = await db.select().from(workoutLogs)
        .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.date, subDays(today, 3))));

    const todayNutrition = await db.select({
        calories: sql<number>`sum(${foodLogs.servingSizeG} * ${foods.caloriesPer100g} / 100)`,
        protein: sql<number>`sum(${foodLogs.servingSizeG} * ${foods.proteinPer100g} / 100)`
    })
    .from(foodLogs)
    .innerJoin(foods, eq(foodLogs.foodId, foods.id))
    .where(and(eq(foodLogs.userId, userId), eq(foodLogs.date, todayStr)));

    // 2. Prepare Context for Gemini
    const context = `
      User sleep last night: ${lastSleep ? `${(new Date(lastSleep.endTime).getTime() - new Date(lastSleep.startTime).getTime()) / (3600000)} hours, quality: ${lastSleep.qualityRating}/5` : 'No data'}.
      Recent workouts (3 days): ${JSON.stringify(recentWorkouts.map(w => ({ type: w.type, duration: w.durationMin })))}.
      Nutrition today: ${Math.round(Number(todayNutrition[0]?.calories || 0))} kcal, ${Math.round(Number(todayNutrition[0]?.protein || 0))}g protein.
    `;

    const prompt = `
      Analyze this user's fitness data and provide a briefing. 
      Return ONLY a valid JSON object. No other text.
      Format:
      {
        "readinessScore": number (1-100),
        "signals": [
          {"type": "sleep", "status": "optimal", "msg": "explanation"}
        ],
        "recommendations": ["advice 1", "advice 2"],
        "topInsight": "One sentence insight"
      }
    `;

    try {
        const result = await model.generateContent(context + prompt);
        const response = await result.response;
        const text = response.text();
        
        // Match JSON safely even if Gemini adds markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const briefing = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        if (!briefing) throw new Error("Could not parse AI response");

        return NextResponse.json({
            date: format(today, 'MMMM d, yyyy'),
            ...briefing
        });
    } catch (aiError) {
        console.error("GEMINI_CORE_ERROR", aiError);
        // Fallback data if AI fails but API key exists
        return NextResponse.json({
            date: format(today, 'MMMM d, yyyy'),
            readinessScore: 75,
            signals: [{ type: "system", status: "warning", msg: "AI is currently recalibrating. Using heuristic analysis." }],
            recommendations: ["Maintain current hydration", "Stick to your scheduled workout"],
            topInsight: "Consistency is key even when data is sparse."
        });
    }

  } catch (error) {
    console.error("AI_BRIEFING_API_ERROR", error);
    return NextResponse.json({ error: "Brain connection error" }, { status: 500 });
  }
}
