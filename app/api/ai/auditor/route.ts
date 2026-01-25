import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { workoutLogs } from "@/app/lib/schema";
import { eq, and, gte } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { subDays } from "date-fns";
import { model } from "@/app/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    // Fetch workouts from the last 7 days
    const lastWeekWorkouts = await db.select().from(workoutLogs)
        .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.date, subDays(new Date(), 7))));

    if (lastWeekWorkouts.length === 0) {
        return NextResponse.json({
            analysis: "No workout data found for the last 7 days. Start logging to get an audit!",
            imbalanceFound: false
        });
    }

    const context = `
      Workouts in the last 7 days:
      ${lastWeekWorkouts.map(w => `- ${w.name} (${w.type})`).join("\n")}
    `;

    const prompt = `
      As a professional Strength & Conditioning coach, audit this user's training variety.
      Identify if they are neglecting any major muscle groups (Legs, Back, Chest, Core, Shoulders).
      
      Return ONLY a JSON object:
      {
        "score": number (1-100),
        "status": "Balanced" | "Imbalanced" | "Specialized",
        "analysis": "2-3 sentences about what they are doing well and what is missing.",
        "suggestion": "Specific exercise type to add next."
      }
    `;

    const result = await model.generateContent(context + prompt);
    const text = (await result.response).text();
    const jsonMatch = text.match(/\{.*\}/s);
    if (!jsonMatch) throw new Error("Invalid AI format");

    return NextResponse.json(JSON.parse(jsonMatch[0]));

  } catch (error) {
    console.error("AI_AUDITOR_ERROR", error);
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
