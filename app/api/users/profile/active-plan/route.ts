import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import {
  userPlans,
  programDays,
  programDayExercises,
  userPlanDays,
  userPlanDayExercises,
  workoutLogs,
} from '@/app/lib/schema';
import { verifyAuth } from '@/app/lib/auth';
import { and, eq, asc, inArray, gte, lte } from 'drizzle-orm';
import { format, addDays, parseISO } from 'date-fns';

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
      return NextResponse.json(null);
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

    // Fetch workout logs for the relevant period to validate completion
    // We fetch logs that happened on or after the plan start date
    // Simple optimization: Just fetch all logs for this user to be safe, or filter by date range if optimizing.
    // Let's filter >= plan start date to be efficient.
    const logs = await db.query.workoutLogs.findMany({
      where: and(
        eq(workoutLogs.userId, userId),
        gte(workoutLogs.date, new Date(activePlan.startDate))
      ),
      columns: {
        date: true,
        name: true, // Fetch name to match specific workouts
      }
    });

    // Group logs by date for easier lookup: Map<DateString, Array<LogName>>
    const logsByDate = new Map<string, string[]>();
    logs.forEach(log => {
      const dateStr = format(new Date(log.date), 'yyyy-MM-dd');
      if (!logsByDate.has(dateStr)) {
        logsByDate.set(dateStr, []);
      }
      logsByDate.get(dateStr)?.push(log.name);
    });

    const formattedSchedule = scheduleDays.map(day => {
      // Logic: A day is completed if there is a log on that date WITH THE SAME NAME
      const dayLogs = logsByDate.get(day.date) || [];
      
      // Find index of first matching log (Case insensitive optional? Currently exact match)
      const logIndex = dayLogs.indexOf(day.name || '');
      
      let isLogged = false;
      if (logIndex !== -1) {
          isLogged = true;
          // Remove this log so it doesn't complete another plan of the same name (1 Log = 1 Plan Completed)
          dayLogs.splice(logIndex, 1);
      }
      
      return {
        id: day.id,
        day_number: day.dayNumber,
        name: day.name,
        description: day.description,
        date: day.date,
        is_completed: isLogged, // Matches specific workout name
        exercises: day.userPlanDayExercises.map(ex => ({
          name: ex.exercise.name,
          sets: ex.sets,
          reps: ex.reps,
          duration_seconds: ex.durationSeconds,
        }))
      };
    });

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
  if (auth.error) return auth.error;
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
    const result = await db.transaction(async (tx) => {
      // 1. Check for existing active plan
      let activePlan = await tx.query.userPlans.findFirst({
        where: and(eq(userPlans.userId, userId), eq(userPlans.isActive, true)),
      });

      let planId: number;
      let planStartDate: Date;

      if (activePlan) {
        // MERGE MODE
        planId = activePlan.id;
        // Start date for the MERGE is "Today" so the new program starts effectively from now
        // This ensures the user doesn't get workouts inserted in the past
        planStartDate = new Date(); 
      } else {
        // CREATE NEW MODE
        const insertedUserPlans = await tx
          .insert(userPlans)
          .values({
            userId: userId,
            sourceProgramId: programId,
            isActive: true,
            startDate: format(new Date(), 'yyyy-MM-dd'), // Explicitly set today
          })
          .returning({
            id: userPlans.id,
            startDate: userPlans.startDate,
          });
        
        if (!insertedUserPlans[0]) throw new Error('Failed to create new user plan.');
        
        planId = insertedUserPlans[0].id;
        planStartDate = new Date(insertedUserPlans[0].startDate); // Should be today
      }

      // 2. Fetch Template Days
      const templateDays = await tx
        .select()
        .from(programDays)
        .where(eq(programDays.programId, programId))
        .orderBy(asc(programDays.dayNumber));

      if (templateDays.length === 0) {
        return { message: 'Program has no days', planId };
      }

      const templateDayIds = templateDays.map(d => d.id);
      const allTemplateExercises = await tx
        .select()
        .from(programDayExercises)
        .where(inArray(programDayExercises.programDayId, templateDayIds));

      // 3. Iterate and Merge
      for (const templateDay of templateDays) {
        // Calculate the target date for this template day relative to merge start date
        // Day 1 = Today, Day 2 = Tomorrow, etc.
        const targetDate = addDays(planStartDate, templateDay.dayNumber - 1);
        const targetDateStr = format(targetDate, 'yyyy-MM-dd');

        // Check if there is already a workout on this date
        const existingDays = await tx
          .select()
          .from(userPlanDays)
          .where(
            and(
              eq(userPlanDays.userPlanId, planId),
              eq(userPlanDays.date, targetDateStr)
            )
          );

        let shouldInsert = true;
        
        // Conflict Resolution Logic
        if (existingDays.length > 0) {
           for (const existingDay of existingDays) {
              if (existingDay.name === 'Rest Day') {
                 // If it's a Rest Day, we DELETE it and replace it with the new workout
                 // This solves "Rest Day getting overwritten" -> effectively replaced
                 await tx.delete(userPlanDays).where(eq(userPlanDays.id, existingDay.id));
              } else {
                 // If it's a REAL workout, we KEEP it and ADD the new one (stacking)
                 // So we don't change 'shouldInsert', we just let it insert a second row.
                 // This solves "Manual workout disappearing" -> Now both exist.
              }
           }
        }

        if (shouldInsert) {
           const insertedUserPlanDays = await tx
            .insert(userPlanDays)
            .values({
              userPlanId: planId,
              dayNumber: templateDay.dayNumber, // Note: This dayNumber might duplicate existing ones, but that's fine for rendering
              date: targetDateStr,
              name: templateDay.name,
              description: templateDay.description
            })
            .returning({ id: userPlanDays.id });
          
          const newUserPlanDayId = insertedUserPlanDays[0].id;

          const exercisesForThisDay = allTemplateExercises.filter(
            (ex) => ex.programDayId === templateDay.id
          );

          if (exercisesForThisDay.length > 0) {
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
      }

      return { message: 'Plan merged successfully', planId };
    });

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('Failed to create active plan:', e);
    return NextResponse.json({ error: 'Internal Server Error'}, { status: 500 });
  }
}
