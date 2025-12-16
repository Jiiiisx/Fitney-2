import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq } from "drizzle-orm";

const calculateXpForNextLevel = (level: number) => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) {
    return auth.error;
  }
  const userId = auth.user.userId;

  try {
    const userArr = await db.select({
      level: users.level,
      xp: users.xp,
    }).from (users).where(eq(users.id, userId));

    if (userArr.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userArr[0];
    const xpForNextLevel = calculateXpForNextLevel(user.level);
    const progressPercetage = Math.floor((user.xp / xpForNextLevel) * 100);

    return NextResponse.json({
      level: user.level,
      xp: user.xp,
      xpForNextLevel: xpForNextLevel,
      progressPercetage: progressPercetage,
    });

  } catch ( error ) {
    console.error('Error fetching gamification stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}