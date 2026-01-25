import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { userPlans, userPlanDays, userPlanDayExercises, exercises } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq } from "drizzle-orm";
import { addDays, format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    
    // Check if premium
    const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, auth.user.userId)
    });
    if (user?.role !== 'premium' && user?.role !== 'admin') {
        return NextResponse.json({ error: "Premium subscription required" }, { status: 403 });
    }

    const { goal, level, location } = await req.json();

    // 1. Deactivate current plans
    await db.update(userPlans)
      .set({ isActive: false })
      .where(eq(userPlans.userId, auth.user.userId));

    // 2. Create new plan
    const newPlan = await db.insert(userPlans).values({
      userId: auth.user.userId,
      isActive: true,
      startDate: format(new Date(), 'yyyy-MM-dd'),
    }).returning();

    const planId = newPlan[0].id;

    // 3. Mock AI Logic: Generate 3 days of workouts based on goal
    const planStructure = [
        { day: 1, name: goal === 'muscle_gain' ? "Push Day (Chest/Triceps)" : "Full Body Fat Burn" },
        { day: 2, name: "Rest & Recovery" },
        { day: 3, name: goal === 'muscle_gain' ? "Pull Day (Back/Biceps)" : "HIIT Cardio Blast" },
    ];

    // Get some random exercises to fill the plan
    const allExercises = await db.select().from(exercises).limit(10);

    for (const item of planStructure) {
        const planDay = await db.insert(userPlanDays).values({
            userPlanId: planId,
            dayNumber: item.day,
            date: format(addDays(new Date(), item.day - 1), 'yyyy-MM-dd'),
            name: item.name,
        }).returning();

        // Add exercises only for non-rest days
        if (!item.name.includes("Rest") && allExercises.length > 0) {
            await db.insert(userPlanDayExercises).values({
                userPlanDayId: planDay[0].id,
                exerciseId: allExercises[Math.floor(Math.random() * allExercises.length)].id,
                sets: 3,
                reps: "12",
            });
        }
    }

    return NextResponse.json({ success: true, planId });
  } catch (error) {
    console.error("AI_GENERATE_ERROR", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
