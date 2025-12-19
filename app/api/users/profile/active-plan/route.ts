import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import {
  userPlans,
  programDays,
  programDayExercises,
  userPlanDays,
  userPlanDayExercises,
} from '@/app/lib/schema';
import { verifyAuth } from '@/app/lib/auth';
import { and, eq, asc, inArray } from 'drizzle-orm';
import { format, addDays } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const activePlan = await db.query.userPlans.findFirst({
      where: and(eq(userPlans.userId, userId), eq(userPlans.isActive, true)),
      columns: {
        id: true,
        sourceProgramId: true,
        startDate: true,
      },
    });

    if (!activePlan) {
      return NextResponse.json({ message: 'No active plan found' }, { status: 404});
    }

    const scheduleDays = await db.query.userPlanDays.findMany({
      where: eq(userPlanDays.userPlanId, activePlan.id),
      orderBy: [asc(userPlanDays.date)],
      with: {
        userPlanDayExercises: {
          orderBy: [asc(userPlanDayExercises.displayOrder)],
          with: {
            exercise: {
              columns: {name: true}
            }
          }
        }
      }
    });

    const formattedSchedule = scheduleDays.map(day => ({
      id: day.id,
      day_number: day.dayNumber,
      name: day.name,
      description: day.description,
      date: day.date,
      exercises: day.userPlanDayExercises.map(ex => ({
        name: ex.exercise.name,
        sets: ex.sets,
        reps: ex.reps,
        duration_seconds: ex.durationSeconds,
      }))
    }));

    return NextResponse.json({
      id: activePlan.id,
      name: "Active Plan",
      start_date: activePlan.startDate,
      schedule: formattedSchedule
    });

  } catch (error) {
    console.error('API_GET_ACTIVE_PLAN_ERROR', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return verifyAuth(req);
  const userId = auth.user.userId;

  let programId: number;
  try {
    const body = await req.json();
    programId = body.programId;
    if (!programId || typeof programId !== 'number') {
      return NextResponse.json({ error: 'programId is required and must a number'}, {status: 400});
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body'}, {status: 400});
  }

  try {
    const newPlan = await db.transaction(async (tx) => {
      await tx
      .update(userPlans)
      .set({ isActive: false })
      .where(and(eq(userPlans.userId, userId), eq(userPlans.isActive, true)));

    const insertedUserPlans = await tx
      .insert(userPlans)
      .values({
        userId: userId,
        sourceProgramId: programId,
        isActive: true,
      })
      .returning({
        id: userPlans.id,
        startDate: userPlans.startDate,
      });

    const newUserPlan = insertedUserPlans[0];
    if (!newUserPlan) {
      throw new Error('Failed to create new user plan.');
    }

    const templateDays = await tx
      .select()
      .from(programDays)
      .where(eq(programDays.programId, programId))
      .orderBy(asc(programDays.dayNumber));

    if (templateDays.length === 0) {
      console.log(`Program ${programId} has no days. Created an empty plan for user ${userId}.`);
      return newUserPlan;
    }

    const templateDayIds = templateDays.map(d => d.id);

    const allTemplateExercises = await tx
      .select()
      .from(programDayExercises)
      .where(inArray(programDayExercises.programDayId, templateDayIds))

    for (const templateDay of templateDays) {
      const specificDate = addDays(new Date(newUserPlan.startDate), templateDay.dayNumber - 1);

      const insertedUserPlanDays = await tx
        .insert(userPlanDays)
        .values({
          userPlanId: newUserPlan.id,
          dayNumber: templateDay.dayNumber,
          date: format(specificDate, 'yyyy-MM-dd'),
          name: templateDay.name,
        })
        .returning({ id: userPlanDays.id });

      const newUserPlanDayId = insertedUserPlanDays[0].id;

      const exercisesForThisDay = allTemplateExercises.filter(
        (ex) => ex.programDayId === templateDay.id
      );

      if (exercisesForThisDay.length > 0 ) {
        await tx.insert(userPlanDayExercises).values(
          exercisesForThisDay.map((ex) => ({
            userPlanDayId: newUserPlanDayId,
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            durationSeconds: ex.durationSeconds,
            notes: ex.notes,
            displayOrder: ex.displayOrder,
            isCompleted: false,
          }))
        );
      }
    }

    return newUserPlan;
    });

    return NextResponse.json({
      message: 'Active plan created succesfully',
      planId: newPlan.id,
    });
  } catch (e: any) {
    console.error('Failed to create active plan:', e);
    return NextResponse.json({ error: 'Internal Server Error'}, { status: 500 });
  }
}
