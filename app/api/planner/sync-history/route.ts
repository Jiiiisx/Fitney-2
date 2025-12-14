import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { userPlans, userPlanDays, workoutLogs } from '@/app/lib/schema';
import { and, eq, sql } from 'drizzle-orm';
import { isBefore, startOfToday, format } from 'date-fns';
import { verifyAuth } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error || !auth.user) {
      return auth.error || NextResponse.json({ error: 'Unauthorized'}, {status: 401});
    }
    const userId = auth.user.userId;

    const planResult = await db
      .select({ id: userPlans.id })
      .from(userPlans)
      .where(and(eq(userPlans.userId, userId), eq(userPlans.isActive, true)));

      if (planResult.length === 0) {
        return NextResponse.json({ message: 'No active plan sync.'});
      }
      const userPlanId = planResult[0].id;

    const daysResult = await db
      .select({ id: userPlanDays.id, date: userPlanDays.date, name: userPlanDays.name })
      .from(userPlanDays)
      .where(eq(userPlanDays.userPlanId, userPlanId));
    
    const today = startOfToday();
    const pastDays = daysResult.filter(day => day.date && isBefore(new Date(day.date), today));

    if (pastDays.length === 0) {
      return NextResponse.json({ message: 'No past workout days to sync.'});
    }
    
    let syncedCount = 0;
    for (const day of pastDays) {
      if (!day.date || !day.name) {
        continue;
      }

      const existingLog = await db
        .select({ id: workoutLogs.id })
        .from(workoutLogs)
        .where(
          and(
            eq(workoutLogs.userId, userId),
            eq(sql`DATE(${workoutLogs.date})`, format(new Date(day.date), 'yyyy-MM-dd')),
            eq(workoutLogs.name, day.name)
          )
        )

      if (existingLog.length > 0) {
        continue;
      }

      let type = 'Strenght';
      if (day.name?.toLowerCase().includes('rest')) {
        type = 'Rest Day';
      } else if (day.name?.toLowerCase().includes('cardio')) {
        type = 'cardio';
      } else if (day.name?.toLowerCase().includes('flexibility')) {
        type = 'flexibility';
      }

      const duration_min = day.name?.toLowerCase().includes('Rest') ? 0 : Math.floor(Math.random() * (75 - 45 + 1)) + 45;
      const calories_burned = day.name?.toLowerCase().includes('rest') ? 0 : Math.floor(duration_min * 5.5);

      await db.insert(workoutLogs).values({
        userId: userId,
        date: new Date(day.date),
        type: type,
        name: day.name,
        durationMin: duration_min,
        caloriesBurned: calories_burned,
      });
      syncedCount++;
    }

    return NextResponse.json({ message: 'Synced ${syncedCount} day(s) to history.'});
  } catch (error) {
    console.error('Error Syncing planner to history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}