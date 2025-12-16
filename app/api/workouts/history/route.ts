import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { workoutLogs } from "@/app/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const historyData = await db
      .select()
      .from(workoutLogs)
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

  } catch(error) {
    console.error("Error fetching workout history from DB:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}