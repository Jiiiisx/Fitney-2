import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { communityEvents } from "@/app/lib/schema";
import { asc, gt } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    // 1. Fetch upcoming events (start time > now)
    const now = new Date();
    
    try {
        const events = await db
        .select()
        .from(communityEvents)
        .where(gt(communityEvents.startTime, now))
        .orderBy(asc(communityEvents.startTime))
        .limit(5);

        // --- AUTO-SEEDING FOR PROTOTYPE (If no events found) ---
        if (events.length === 0) {
            console.log("No events found. Seeding dummy events...");
            
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(7, 0, 0, 0);

            const weekend = new Date();
            weekend.setDate(weekend.getDate() + (6 - weekend.getDay() + 7) % 7); // Next Saturday
            weekend.setHours(8, 0, 0, 0);

            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            nextWeek.setHours(18, 0, 0, 0);

            const seedData = [
                {
                    title: "Morning Yoga Flow",
                    description: "Join us for a relaxing start to the day.",
                    startTime: tomorrow,
                    location: "Central Park / Zoom",
                    type: "wellness"
                },
                {
                    title: "Weekend 5K Run",
                    description: "Community jog, all paces welcome!",
                    startTime: weekend,
                    location: "City Square",
                    type: "fitness"
                },
                {
                    title: "Nutrition Workshop",
                    description: "Learn about macros and meal prep.",
                    startTime: nextWeek,
                    location: "Community Hall",
                    type: "education"
                }
            ];

            // Insert dummy data
            const inserted = await db.insert(communityEvents).values(seedData).returning();
            return NextResponse.json(inserted);
        }

        return NextResponse.json(events);

    } catch (dbError: any) {
        // Handle case where table might not exist yet (if migration wasn't run)
        if (dbError.code === '42P01') { // PostgreSQL: undefined_table
            return NextResponse.json({ 
                error: "Database table not found. Please run 'npx drizzle-kit push' to update your schema." 
            }, { status: 500 });
        }
        throw dbError;
    }

  } catch (error) {
    console.error("GET_EVENTS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
