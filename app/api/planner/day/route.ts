import { NextRequest, NextResponse } from "next/server";
import { db } from '@/app/lib/db';
import { userPlans, userPlanDays, userPlanDayExercises, exercises as exercisesTable } from '@/app/lib/schema';
import { verifyAuth } from '@/app/lib/auth';
import { and, eq } from 'drizzle-orm';
import { differenceInDays, parseISO, format } from "date-fns";

interface ExercisesData {
  id: number; // Changed from exerciseId to id to match frontend payload
  name?: string;
  sets?: string | number;
  reps?: string;
  duration?: string | number; // Frontend sends 'duration' (minutes)
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error || !auth.user?.userId) {
    return auth.error || NextResponse.json({ error: 'Unauthorized'}, { status: 401});
  }
  const userId = auth.user.userId;

  try {
    const { name, date, exercises } = (await req.json()) as {name: string; date: string; exercises: ExercisesData[] };

    if (!name || !date) {
      return NextResponse.json({ error: 'Name and date are required' }, { status: 400 });
    }

    const dateForDb = format(parseISO(date), 'yyyy-MM-dd');

    const newDay = await db.transaction(async (tx) => {
      let userPlanId: number;
      let planStartDate: Date;

      const planResult = await tx
        .select({ id: userPlans.id, startDate: userPlans.startDate})
        .from(userPlans)
        .where(and(eq(userPlans.userId, userId), eq(userPlans.isActive, true)));

        if(planResult.length === 0) {
          const newPlan = await tx
            .insert(userPlans)
            .values({ userId: userId, startDate: dateForDb, isActive: true})
            .returning({ id: userPlans.id, startDate: userPlans.startDate});

            userPlanId = newPlan[0].id;
            planStartDate = parseISO(newPlan[0].startDate);
        } else {
          userPlanId = planResult[0].id;
          planStartDate = parseISO(planResult[0].startDate);
        }

        const dayNumber = differenceInDays(parseISO(date), planStartDate);

        // Always create a new day entry (Session) to allow multiple workouts per day
        const newPlanDay = await tx
        .insert(userPlanDays)
        .values({
            userPlanId: userPlanId,
            dayNumber: dayNumber,
            date: dateForDb,
            name: name,
        })
        .returning({ id: userPlanDays.id});
        const newPlanDayId = newPlanDay[0].id;

        if (exercises && exercises.length > 0) {
          const exercisesToInsert = [];

          for (let i = 0; i < exercises.length; i++) {
             const ex = exercises[i];
             let finalExerciseId = ex.id;

             // Handle Custom Exercises (id === 0)
             if (finalExerciseId === 0 || !finalExerciseId) {
                const exerciseName = ex.name || name; // Use specific name or fallback to plan name
                
                // Check if exists by name
                const existingEx = await tx
                  .select({ id: exercisesTable.id })
                  .from(exercisesTable)
                  .where(eq(exercisesTable.name, exerciseName))
                  .limit(1);

                if (existingEx.length > 0) {
                   finalExerciseId = existingEx[0].id;
                } else {
                   // Create new
                   const newEx = await tx
                     .insert(exercisesTable)
                     .values({ 
                        name: exerciseName,
                        categoryId: null // Or default category if available
                     })
                     .returning({ id: exercisesTable.id });
                   finalExerciseId = newEx[0].id;
                }
             }

             // Type conversion and mapping
             const setsVal = ex.sets ? Number(ex.sets) : null;
             // Frontend 'duration' is in minutes, DB expects seconds
             const durationVal = ex.duration ? Number(ex.duration) * 60 : null;

             exercisesToInsert.push({
               userPlanDayId: newPlanDayId,
               exerciseId: finalExerciseId,
               sets: isNaN(setsVal!) ? null : setsVal,
               reps: ex.reps || null,
               durationSeconds: isNaN(durationVal!) ? null : durationVal,
               displayOrder: i,
             });
          }

          await tx.insert(userPlanDayExercises).values(exercisesToInsert);
        }

        return { newPlanDayId };
    });

    return NextResponse.json({ message: 'Day created succesfully', newPlanDayId: newDay.newPlanDayId}, { status: 201 });
  } catch (error) {
    console.error('API_POST_PLANNER_DAY_ERROR', error);
    // Return original error for debugging purposes (in dev mode usually, but useful here)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Check specifically for duplicate key violation (Postgres code 23505)
    if ((error as any).code === '23505') {
       return NextResponse.json({ error: 'Database constraint violation: Duplicate plan for this day found.' }, { status: 409 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}