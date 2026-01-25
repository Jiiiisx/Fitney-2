import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { workoutLogs, sleepLogs } from "@/app/lib/schema";
import { eq, and, gte } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { subDays, format } from "date-fns";
import { model } from "@/app/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const threeDaysAgo = subDays(new Date(), 3);

    // Fetch Sleep & Workouts
    const workouts = await db.select().from(workoutLogs).where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.date, threeDaysAgo)));
    const sleep = await db.select().from(sleepLogs).where(and(eq(sleepLogs.userId, userId), gte(sleepLogs.date, format(threeDaysAgo, 'yyyy-MM-dd'))));

    const context = `
      Last 3 days:
      Workouts: ${workouts.length} sessions.
      Sleep Logs: ${sleep.length} entries. Average quality: ${sleep.reduce((acc, s) => acc + (s.qualityRating || 0), 0) / (sleep.length || 1)}/5
    `;

    const prompt = `
      Evaluate the user's recovery status.
      Return ONLY a JSON object:
      {
        "recoveryScore": number (1-100),
        "status": "Optimal" | "Recovering" | "Fatigued",
        "detail": "1-2 sentences about their nervous system and muscle recovery state.",
        "action": "Next action (e.g. Full Rest, Light Cardio, or Heavy Lift)"
      }
    `;

    const result = await model.generateContent(context + prompt);
    const text = (await result.response).text();
    const jsonMatch = text.match(/\{.*\}/s);
    if (!jsonMatch) throw new Error("Invalid AI format");

    return NextResponse.json(JSON.parse(jsonMatch[0]));

  } catch (error) {
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
