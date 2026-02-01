import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { workoutLogs, exercises, categories, aiAudits } from "@/app/lib/schema";
import { eq, and, gte } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { subDays, format } from "date-fns";
import { safeGenerateContent, extractJSON } from "@/app/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // 0. CHECK CACHE
    const cached = await db.select().from(aiAudits)
      .where(and(eq(aiAudits.userId, userId), eq(aiAudits.date, todayStr)))
      .limit(1);

    if (cached.length > 0) {
      console.log("Serving AUDITOR from cache");
      return NextResponse.json(cached[0].content);
    }

    // Fetch workouts with a bit more history for better balance analysis (14 days)
    const recentWorkouts = await db.select().from(workoutLogs)
        .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.date, subDays(new Date(), 14))));

    if (recentWorkouts.length === 0) {
        return NextResponse.json({
            score: 0,
            status: "No Data",
            analysis: "No workout data found for the last 14 days. Start logging to get an audit!",
            suggestion: "Log your first workout today!",
            muscleBalance: []
        });
    }

    const prompt = `
      As a Biomechanics Expert, audit this user's training variety from the last 14 days:
      ${recentWorkouts.map(w => `- ${w.name} (${w.type})`).join("\n")}
      
      Analyze which muscle groups are being trained based on exercise names and types.
      
      Return ONLY a JSON object:
      {
        "score": number (1-100),
        "status": "Balanced" | "Highly Imbalanced" | "Slightly Imbalanced",
        "analysis": "A deep analysis of their volume and variety.",
        "suggestion": "Specific exercise or muscle group to target next.",
        "muscleBalance": [
          {"muscle": "Chest", "score": number (1-100)},
          {"muscle": "Back", "score": number (1-100)},
          {"muscle": "Legs", "score": number (1-100)},
          {"muscle": "Shoulders", "score": number (1-100)},
          {"muscle": "Arms", "score": number (1-100)},
          {"muscle": "Core", "score": number (1-100)}
        ]
      }
    `;

    const aiText = await safeGenerateContent(prompt);
    const data = extractJSON(aiText);

    if (!data) throw new Error("AI output failed");

    // 3. SAVE TO CACHE
    await db.insert(aiAudits).values({
      userId,
      date: todayStr,
      content: data
    }).onConflictDoNothing();

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("AUDITOR_ERROR", error);
    return NextResponse.json({
        score: 50, 
        status: "Calibration Required", 
        analysis: "AI is currently busy. Please try again in 10 seconds.",
        suggestion: "Retry Audit",
        muscleBalance: []
    });
  }
}
