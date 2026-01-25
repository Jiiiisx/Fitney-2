import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users, workoutLogs, foodLogs, foods, userProfiles, userGoals, sleepLogs } from "@/app/lib/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { safeGenerateContent } from "@/app/lib/gemini";
import { format, subDays } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    // Receive 'mode' to determine the Persona
    const { message, messages, mode = 'briefing' } = await req.json();
    
    // Fallback logic
    const chatHistory = messages || [{ role: 'user', content: message }];

    // 1. FETCH SHARED MEMORY (The Core Context)
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    const profile = await db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, userId) });
    const goals = await db.select().from(userGoals).where(eq(userGoals.userId, userId));

    // Recent Activity (Critical for all modes)
    const recentWorkouts = await db.select().from(workoutLogs)
        .where(eq(workoutLogs.userId, userId))
        .orderBy(desc(workoutLogs.date))
        .limit(5); // Increased to 5 for better Auditor context
    
    // Nutrition Today
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayNutrition = await db.select({
        name: foods.name,
        calories: sql<number>`${foodLogs.servingSizeG} * ${foods.caloriesPer100g} / 100`,
        protein: sql<number>`${foodLogs.servingSizeG} * ${foods.proteinPer100g} / 100`
    })
    .from(foodLogs)
    .innerJoin(foods, eq(foodLogs.foodId, foods.id))
    .where(and(eq(foodLogs.userId, userId), eq(foodLogs.date, todayStr)));

    const totalCals = todayNutrition.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
    const totalProtein = todayNutrition.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);

    // Sleep (Critical for Recovery mode)
    const lastSleep = await db.query.sleepLogs.findFirst({
        where: eq(sleepLogs.userId, userId),
        orderBy: desc(sleepLogs.date)
    });

    // 2. DEFINE PERSONAS (The "Hats")
    const getPersonaInstruction = (currentMode: string) => {
        const baseIdentity = `You are Fitney AI. User: ${user?.fullName}. Level: ${user?.level}. Goal: ${profile?.mainGoal}.`;
        
        switch (currentMode) {
            case 'fridge':
                return `
                ${baseIdentity}
                ROLE: Michelin Dietitian & Nutritionist.
                FOCUS: Creating recipes, managing macros, food alternatives.
                TONE: Creative, Practical, Encouraging.
                CONTEXT: User ate ${Math.round(totalCals)}kcal / ${Math.round(totalProtein)}g protein today.
                INSTRUCTION: If user lists ingredients, suggest a recipe that fits their remaining calorie needs.
                `;
            
            case 'auditor':
                return `
                ${baseIdentity}
                ROLE: Elite Strength Coach & Biomechanics Expert.
                FOCUS: Training volume, muscle balance, form correction, progressive overload.
                TONE: Technical, Analytical, Strict but fair.
                CONTEXT: Recent workouts: ${recentWorkouts.map(w => w.name).join(', ')}.
                INSTRUCTION: Analyze their workout frequency. Point out if they are skipping leg day or overtraining chest. Suggest substitutions if asked.
                `;

            case 'recovery':
                return `
                ${baseIdentity}
                ROLE: Physiotherapist & Recovery Specialist.
                FOCUS: Sleep, injury prevention, stress management, mobility.
                TONE: Empathetic, Cautious, Soothing.
                CONTEXT: Last sleep: ${lastSleep ? lastSleep.qualityRating + '/5' : 'No data'}. Workout strain is relevant.
                INSTRUCTION: If user reports pain, suggest specific stretches or rest. Do NOT give medical prescriptions, but advise seeing a doctor for severe pain.
                `;

            case 'briefing':
            default:
                return `
                ${baseIdentity}
                ROLE: Chief of Staff / Head Coach.
                FOCUS: Big picture, daily strategy, motivation.
                TONE: Direct, Inspiring, Clear.
                INSTRUCTION: Synthesize data from all areas. Give high-level direction for the day.
                `;
        }
    };

    // 3. COMPILE PROMPT
    const historyText = chatHistory.map((m: any) => 
        `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`
    ).join("\n");

    const fullPrompt = `
    SYSTEM INSTRUCTIONS:
    ${getPersonaInstruction(mode)}

    USER CURRENT DATA (SHARED MEMORY):
    - Active Goals: ${goals.map(g => g.title).join(", ") || "None"}
    - Last Workout: ${recentWorkouts[0]?.name || "None"} (${recentWorkouts[0]?.date ? format(new Date(recentWorkouts[0].date), 'MMM d') : '- -'})
    
    CONVERSATION HISTORY:
    ${historyText}
    
    AI Response (Keep it under 4 sentences unless asked for a list):
    `;

    const reply = await safeGenerateContent(fullPrompt);

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("AI_CHAT_ERROR", error);
    return NextResponse.json({ reply: "My neural link is flickering. Please try again in a few seconds!" });
  }
}
