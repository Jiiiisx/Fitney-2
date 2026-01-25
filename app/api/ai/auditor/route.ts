import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { workoutLogs } from "@/app/lib/schema";
import { eq, and, gte } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { subDays } from "date-fns";
import { safeGenerateContent, extractJSON } from "@/app/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const lastWeekWorkouts = await db.select().from(workoutLogs)
        .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.date, subDays(new Date(), 7))));

    if (lastWeekWorkouts.length === 0) {
        return NextResponse.json({
            score: 0,
            status: "No Data",
            analysis: "No workout data found for the last 7 days. Start logging to get an audit!",
            suggestion: "Log your first workout today!"
        });
    }

    const prompt = `
      As a fitness coach, audit this user's training variety from the last 7 days:
      ${lastWeekWorkouts.map(w => `- ${w.name} (${w.type})`).join("\n")}
      
      Return ONLY a JSON object:
      {
        "score": number (1-100),
        "status": "Balanced" | "Imbalanced",
        "analysis": "Brief analysis",
        "suggestion": "Next exercise type"
      }
    `;

    const aiText = await safeGenerateContent(prompt);
    const data = extractJSON(aiText);

    if (!data) throw new Error("AI output failed");
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("AUDITOR_ERROR", error);
    return NextResponse.json({
        score: 50, 
        status: "Calibration Required", 
        analysis: "AI is currently busy. Please try again in 10 seconds.",
        suggestion: "Retry Audit"
    }, { status: 200 }); // Return as 200 with fallback to avoid blank UI
  }
}