import { NextRequest, NextResponse } from "next/server";
import { db } from '@/app/lib/db';
import { userPlans, userPlanDays, userPlanDayExercises } from '@/app/lib/schema';
import { verifyAuth } from '@/app/lib/auth';
import { and, eq } from 'drizzle-orm';
import { differenceInDays, parseISO, format } from "date-fns";

interface ExercisesData {
  exerciseId: number;
  sets?: number;
  reps?: string;
  durationSeconds?: number;
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
          const exercisesToInsert = exercises.map((ex, index) => ({
            userPlanDayId: newPlanDayId,
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            durationSeconds: ex.durationSeconds,
            displayOrder: index,
          }));

          await tx.insert(userPlanDayExercises).values(exercisesToInsert);
        }

        return { newPlanDayId };
    });

    return NextResponse.json({ message: 'Day created succesfully', newPlanDayId: newDay.newPlanDayId}, { status: 201 });
  } catch (error) {
    console.error('API_POST_PLANNER_DAY_ERROR', error);
    return NextResponse.json({ error: 'A plan for this day already exists'}, {status: 409});
    return NextResponse.json({ error: 'Internal Server Error'}, {status: 500});
  }
}