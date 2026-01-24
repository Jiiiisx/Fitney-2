import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';
import { users, workoutLogs } from '@/app/lib/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { subDays, startOfDay } from 'date-fns';

const getXpForLevel = (level: number): number => {
  return 1000 * level;
};

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const userProfile = await db.query.users.findFirst({
      where: eq(users.id, auth.user.userId),
      columns: {
        level: true,
        xp: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const xpForNextLevel = getXpForLevel(userProfile.level);
    const progressPercentage = (userProfile.xp / xpForNextLevel) * 100;

    // Calculate Consistency Change
    const today = startOfDay(new Date());
    const lastWeekStart = subDays(today, 6);
    const prevWeekStart = subDays(today, 13);
    const prevWeekEnd = subDays(today, 7);

    // Current Week Count
    const currentWeekRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, auth.user.userId),
          gte(workoutLogs.date, lastWeekStart)
        )
      );
    const currentWeekCount = Number(currentWeekRes[0].count);

    // Previous Week Count
    const prevWeekRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, auth.user.userId),
          gte(workoutLogs.date, prevWeekStart),
          lte(workoutLogs.date, prevWeekEnd)
        )
      );
    const prevWeekCount = Number(prevWeekRes[0].count);

    let consistencyChange = 0;
    if (prevWeekCount === 0) {
      consistencyChange = currentWeekCount > 0 ? 100 : 0;
    } else {
      consistencyChange = Math.round(((currentWeekCount - prevWeekCount) / prevWeekCount) * 100);
    }

    const statsData = {
      level: userProfile.level,
      progressPercentage: Math.round(progressPercentage),
      consistencyChange: consistencyChange,
    };

    return NextResponse.json(statsData);
  } catch (error) {
    console.error('Error fetching sidebar stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}