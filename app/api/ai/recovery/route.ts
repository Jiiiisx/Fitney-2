import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { workoutLogs, sleepLogs } from "@/app/lib/schema";
import { eq, and, gte } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { subDays, format } from "date-fns";
import { safeGenerateContent, extractJSON } from "@/app/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const threeDaysAgo = subDays(new Date(), 3);
    const workouts = await db.select().from(workoutLogs).where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.date, threeDaysAgo)));
    const sleep = await db.select().from(sleepLogs).where(and(eq(sleepLogs.userId, userId), gte(sleepLogs.date, format(threeDaysAgo, 'yyyy-MM-dd'))));

    const prompt = `
      Evaluate recovery for: ${workouts.length} workouts, ${sleep.length} sleep logs.
      Avg Sleep Quality: ${sleep.length > 0 ? (sleep.reduce((a, b) => a + (b.qualityRating || 0), 0) / sleep.length).toFixed(1) : 'Unknown'}/5.
      
      Return ONLY a JSON object:
      {
        "recoveryScore": number,
        "status": "Optimal" | "Recovering" | "Fatigued",
        "detail": "Description",
        "action": "Next action"
      }
    `;

    const aiText = await safeGenerateContent(prompt);
    const data = extractJSON(aiText);

    if (!data) throw new Error("AI output failed");
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ 
        recoveryScore: 0, 
        status: "Unknown", 
        detail: "Unable to calculate recovery right now due to server load.", 
        action: "Try again shortly" 
    });
  }
}