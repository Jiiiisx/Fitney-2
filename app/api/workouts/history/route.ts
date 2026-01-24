import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { workoutLogs } from "@/app/lib/schema";
import { desc, eq } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    // Fetch only current user's workout history
    const historyData = await db
      .select()
      .from(workoutLogs)
      .where(eq(workoutLogs.userId, auth.user.userId))
      .orderBy(desc(workoutLogs.date));

    const formattedHistory = historyData.map(log => ({
      id: log.id,
      date: new Date(log.date).toISOString().split('T')[0],
      name: log.name,
      type: log.type,
      duration: log.durationMin,
      calories: log.caloriesBurned,
    }));

    return NextResponse.json(formattedHistory);

  } catch (error) {
    console.error("Error fetching workout history from DB:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}