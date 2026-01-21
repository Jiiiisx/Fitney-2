import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { userGoals, workoutLogs } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { user, error } = await verifyAuth(request);
  if (error) {
    return error;
  }
  const userId = user.userId;

  try {
    // 1. Fetch Goals
    const goals = await db
      .select()
      .from(userGoals)
      .where(eq(userGoals.userId, userId))
      .orderBy(desc(userGoals.createdAt));

    // 2. Recalculate Progress for each goal
    const updatedGoals = await Promise.all(goals.map(async (goal) => {
      // Hanya hitung ulang jika goal belum expired atau masih relevan
      // Tapi untuk aman, hitung semua active goal
      
      const startDate = goal.startDate ? new Date(goal.startDate) : new Date(0); // Epoch if null
      const endDate = goal.endDate ? new Date(goal.endDate) : new Date(); // Now if null (open ended)

      // Pastikan endDate mencakup sampai akhir hari tersebut
      const effectiveEndDate = new Date(endDate);
      effectiveEndDate.setHours(23, 59, 59, 999);

      let computedValue = 0;

      // Base Condition: User & Date Range
      const baseFilter = and(
        eq(workoutLogs.userId, userId),
        gte(workoutLogs.date, startDate),
        lte(workoutLogs.date, effectiveEndDate)
      );

      if (goal.metric === 'workout_frequency') {
        const result = await db
          .select({ value: sql<number>`cast(count(*) as integer)` })
          .from(workoutLogs)
          .where(baseFilter);
        computedValue = result[0]?.value || 0;
      } 
      else if (goal.metric === 'calories_burned') {
        const result = await db
          .select({ value: sql<number>`cast(sum(${workoutLogs.caloriesBurned}) as integer)` })
          .from(workoutLogs)
          .where(baseFilter);
        computedValue = result[0]?.value || 0;
      }
      else if (goal.metric === 'active_minutes') {
        const result = await db
          .select({ value: sql<number>`cast(sum(${workoutLogs.durationMin}) as integer)` })
          .from(workoutLogs)
          .where(baseFilter);
        computedValue = result[0]?.value || 0;
      }
      else if (goal.metric === 'distance_run') {
         // Asumsi semua log dengan distance dihitung
         const result = await db
          .select({ value: sql<number>`cast(sum(${workoutLogs.distanceKm}) as integer)` })
          .from(workoutLogs)
          .where(baseFilter);
         computedValue = result[0]?.value || 0;
      }
      else {
        // Fallback untuk metric lain yang belum dihandle spesifik, gunakan nilai existing
        computedValue = goal.currentValue || 0;
      }

      // Update DB jika nilai berubah
      if (computedValue !== goal.currentValue) {
        await db.update(userGoals)
          .set({ currentValue: computedValue, updatedAt: new Date() })
          .where(eq(userGoals.id, goal.id));
        
        return { ...goal, currentValue: computedValue };
      }

      return goal;
    }));

    return NextResponse.json(updatedGoals);
  } catch (dbError) {
    console.error('Error fetching goals', dbError);
    return NextResponse.json({ error: 'Internal Server Error'}, {status: 500});
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await verifyAuth(request);
  if (error) {
    return error;
  }
  const userId = user.userId;

  try {
    const body = await request.json();
    const { title, category, metric, target_value, end_date } = body;

    if ( !title || !category || !metric || !target_value) {
      return NextResponse.json({ error: 'Missing required fields'}, { status: 400 });
    }

    const newGoal= await db
      .insert(userGoals)
      .values({
        userId: userId,
        title: title,
        category: category,
        metric: metric,
        targetValue: target_value,
        endDate: end_date || null,
      })
      .returning();

    return NextResponse.json(newGoal[0], { status: 201 });
  } catch (dbError) {
    console.error('Error creating goal:', dbError);
    return NextResponse.json({ error: 'Internal Server Error'}, {status: 500});
  }
}