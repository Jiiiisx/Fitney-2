import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users, workoutLogs, foodLogs, foods, userProfiles, userGoals } from "@/app/lib/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { safeGenerateContent } from "@/app/lib/gemini";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    // Expect 'messages' array (history) instead of single 'message'
    const { message, messages } = await req.json();
    
    // Fallback if frontend sends old format
    const chatHistory = messages || [{ role: 'user', content: message }];
    const lastUserMessage = chatHistory[chatHistory.length - 1].content;

    // 1. Fetch User Context
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    const profile = await db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, userId) });
    const goals = await db.select().from(userGoals).where(eq(userGoals.userId, userId));

    // 2. Fetch Recent Activity
    const recentWorkouts = await db.select().from(workoutLogs)
        .where(eq(workoutLogs.userId, userId))
        .orderBy(desc(workoutLogs.date))
        .limit(3);
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayNutrition = await db.select({
        name: foods.name,
        calories: sql<number>`${foodLogs.servingSizeG} * ${foods.caloriesPer100g} / 100`
    })
    .from(foodLogs)
    .innerJoin(foods, eq(foodLogs.foodId, foods.id))
    .where(and(eq(foodLogs.userId, userId), eq(foodLogs.date, todayStr)));

    // 3. Build System Context
    const systemContext = `
      You are Fitney AI, an advanced fitness coach.
      
      USER PROFILE:
      - Name: ${user?.fullName || user?.username}
      - Level: ${user?.level}
      - Goal: ${profile?.mainGoal || "General Fitness"}
      - Experience: ${profile?.experienceLevel || "Intermediate"}
      - Active Targets: ${goals.map(g => g.title).join(", ") || "None"}

      RECENT DATA:
      - Last Workouts: ${recentWorkouts.map(w => `${w.name} (${w.durationMin}m)`).join(", ")}
      - Nutrition Today: ${todayNutrition.length > 0 ? todayNutrition.map(n => n.name).join(", ") : "No food logged yet"}

      INSTRUCTIONS:
      - Be concise (max 3-4 sentences) unless asked for a detailed plan.
      - Use a motivating, professional, yet friendly tone.
      - If asked about workouts, refer to their recent history or goals.
      - Do not hallucinate data. If you don't know something, ask.
    `;

    // 4. Format Chat History for Gemini
    // Convert: [{role: 'user', content: 'hi'}, {role: 'bot', content: 'hello'}]
    // To: "User: hi\nAI: hello\n..."
    const historyText = chatHistory.map((m: any) => 
        `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`
    ).join("\n");

    const fullPrompt = `${systemContext}\n\nCONVERSATION HISTORY:\n${historyText}\n\nAI Response:`

    const reply = await safeGenerateContent(fullPrompt);

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("AI_CHAT_ERROR", error);
    return NextResponse.json({ reply: "My neural link is flickering. Please try again in a few seconds!" });
  }
}