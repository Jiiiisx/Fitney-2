import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { workoutLogs, users } from "@/app/lib/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    // Check premium status
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true }
    });
    
    if (user?.role !== 'premium' && user?.role !== 'admin') {
      return NextResponse.json({ error: "Premium required" }, { status: 403 });
    }

    // Fetch all logs
    const logs = await db.select().from(workoutLogs)
      .where(eq(workoutLogs.userId, userId))
      .orderBy(desc(workoutLogs.date));

    // Create CSV header
    let csv = "Date,Type,Name,Duration (min),Calories,Sets,Reps,Weight (kg),Distance (km)\n";

    // Add rows
    logs.forEach(log => {
      const row = [
        format(new Date(log.date), 'yyyy-MM-dd HH:mm'),
        `"${log.type}"`, 
        `"${log.name}"`, 
        log.durationMin || 0,
        log.caloriesBurned || 0,
        log.sets || 0,
        `"${log.reps || ""}"`, 
        log.weightKg || 0,
        log.distanceKm || 0
      ].join(",");
      csv += row + "\n";
    });

    // Return as file download
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="fitney-activity-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    });

  } catch (error) {
    console.error("EXPORT_ERROR", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
