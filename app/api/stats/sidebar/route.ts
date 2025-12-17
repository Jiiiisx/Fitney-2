import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { getUserFromToken } from '@/app/lib/auth';
import { users } from '@/app/lib/schema';
import { eq } from 'drizzle-orm';

const getXpForLevel = (level: number): number => {
  return 1000 * level;
};

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json ({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Invalid token or user not found'}, { status: 401 });
    }

    const userProfile = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
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

    const statsData = {
      level: userProfile.level,
      progressPercentage: Math.round(progressPercentage),
      consistencyChange: 15,
    };

    return NextResponse.json(statsData);
  } catch (error) {
    console.error('Error fetching sidebar stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}