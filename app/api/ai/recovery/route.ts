import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { workoutLogs, sleepLogs, userProfiles, aiRecoveryScans } from "@/app/lib/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { subDays, format } from "date-fns";
import { safeGenerateContent, extractJSON } from "@/app/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // 0. CHECK CACHE
    const cached = await db.select().from(aiRecoveryScans)
      .where(and(eq(aiRecoveryScans.userId, userId), eq(aiRecoveryScans.date, todayStr)))
      .limit(1);

    if (cached.length > 0) {
      console.log("Serving RECOVERY from cache");
      return NextResponse.json(cached[0].content);
    }

    const sevenDaysAgo = subDays(today, 7);
    
    // Fetch 7 days of context for better fatigue prediction
    const workouts = await db.select().from(workoutLogs)
        .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.date, sevenDaysAgo)));
    
    const sleep = await db.select().from(sleepLogs)
        .where(and(eq(sleepLogs.userId, userId), gte(sleepLogs.date, format(sevenDaysAgo, 'yyyy-MM-dd'))))
        .orderBy(desc(sleepLogs.date));

    const profile = await db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, userId) });

    const prompt = `
      Evaluate CNS (Central Nervous System) Fatigue and Injury Risk for this user.
      User Profile: ${profile?.experienceLevel || 'Intermediate'} level, Goal: ${profile?.mainGoal || 'General'}.
      Workouts in last 7 days: ${workouts.length}.
      Avg Sleep Quality: ${sleep.length > 0 ? (sleep.reduce((a, b) => a + (b.qualityRating || 0), 0) / sleep.length).toFixed(1) : 'Unknown'}/5.
      Last Night Sleep: ${sleep[0] ? sleep[0].qualityRating + '/5' : 'No data'}.
      
      Calculation Logic:
      - High volume (>5 workouts/week) + Low sleep quality (<3/5) = High CNS Fatigue and High Injury Risk.
      - Advanced trainees can handle more volume, but recovery is still key.
      
      Return ONLY a JSON object:
      {
        "recoveryScore": number (1-100),
        "status": "Optimal" | "Recovering" | "Fatigued" | "Danger Zone",
        "cnsFatigue": number (1-100),
        "injuryRisk": number (1-100),
        "detail": "Description of current state",
        "action": "Immediate recommendation",
        "preventionTip": "One sentence tip to prevent injury based on their data"
      }
    `;

    const aiText = await safeGenerateContent(prompt);
    const data = extractJSON(aiText);

    if (!data) throw new Error("AI output failed");

    // 3. SAVE TO CACHE
    await db.insert(aiRecoveryScans).values({
      userId,
      date: todayStr,
      content: data
    }).onConflictDoNothing();

    return NextResponse.json(data);

  } catch (error) {
    console.error("RECOVERY_ERROR", error);
    return NextResponse.json({ 
        recoveryScore: 0, 
        status: "Unknown", 
        cnsFatigue: 0,
        injuryRisk: 0,
        detail: "Unable to calculate recovery right now.", 
        action: "Try again shortly",
        preventionTip: "Stay hydrated and listen to your body."
    });
  }
}
