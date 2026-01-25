import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users, workoutLogs, foodLogs, foods } from "@/app/lib/schema";
import { eq, desc, gte, sql, and } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { model } from "@/app/lib/gemini";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const { message } = await req.json();

    // 1. Gather User Context (The "Brain")
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    const recentWorkouts = await db.select().from(workoutLogs)
        .where(eq(workoutLogs.userId, userId))
        .orderBy(desc(workoutLogs.date))
        .limit(5);
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayNutrition = await db.select({
        name: foods.name,
        calories: sql<number>`${foodLogs.servingSizeG} * ${foods.caloriesPer100g} / 100`
    })
    .from(foodLogs)
    .innerJoin(foods, eq(foodLogs.foodId, foods.id))
    .where(and(eq(foodLogs.userId, userId), eq(foodLogs.date, todayStr)));

    const context = `
      User Name: ${user?.fullName || user?.username}
      User Level: ${user?.level}
      Recent Workouts: ${recentWorkouts.map(w => `${w.date.toDateString()}: ${w.name} (${w.durationMin}m)`).join(", ")}
      Food Eaten Today: ${todayNutrition.map(n => `${n.name} (${Math.round(n.calories)}kcal)`).join(", ")}
    `;

    const systemPrompt = `
      You are Fitney AI Coach. Use the context above to answer the user's question.
      Keep it professional, empathetic, and science-based.
      Maximum 3-4 sentences.
    `;

    const result = await model.generateContent(systemPrompt + context + "\nUser Question: " + message);
    const response = await result.response;

    return NextResponse.json({ reply: response.text() });

  } catch (error) {
    console.error("AI_CHAT_ERROR", error);
    return NextResponse.json({ error: "Brain offline" }, { status: 500 });
  }
}