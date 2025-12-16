import { NextResponse, NextRequest } from "next/server";
import { users } from "@/app/lib/schema";
import { db } from "@/app/lib/db";
import { workoutLogs } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq } from "drizzle-orm";

const calculateXpForNextLevel = (level: number) => {
  return Math.floor(100* Math.pow(level, 1.5));
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) {
    return auth.error;
  }
  const userId = auth.user.userId;

  try {
    const body = await req.json();
    const { type, name, sets, reps, weight, duration, distance } = body;

    if (!type || !name) {
      return NextResponse.json({ error: 'Workout type and name are required' }, { status: 400 });
    }


    let awardedXp = 0;
    const baseDurationXp = (duration || 0) * 2;

    if (type === 'Strength') {
      const volumeXp = (sets || 1) * (reps || 1) * (weight || 0) * 0.1;
      awardedXp = baseDurationXp + Math.floor(volumeXp);
    } else if (type === 'Cardio') {
      const distanceXp = (distance || 0) * 10;
      awardedXp = baseDurationXp + Math.floor(distanceXp);
    } else {
      awardedXp = baseDurationXp;
    }

    const currentUserArr = await db.select().from(users).where(eq(users.id, userId));
    if (currentUserArr.length === 0) {
      return NextResponse.json({ error: 'User not found'}, {status: 404});
    }
    const currentUser = currentUserArr[0];

    let newXp = currentUser.xp + awardedXp;
    let newLevel = currentUser.level;
    let xpToNext = calculateXpForNextLevel(newLevel);

    while (newXp >= xpToNext) {
      newXp -= xpToNext;
      newLevel++;
      xpToNext = calculateXpForNextLevel(newLevel);
    }

    await db.update(users)
      .set({ level: newLevel, xp: newXp })
      .where(eq(users.id, userId));

    const newLog = await db.insert(workoutLogs).values({
      userId: userId,
      type: type,
      name: name,
      sets: sets || null,
      reps: reps || null,
      weightKg: weight || null,
      durationMin: duration || null,
      distanceKm: distance || null,
      date: new Date(),
    })
    .returning();

    if (newLog.length === 0) {
      return NextResponse.json({ error: 'Failed to log workout'}, { status: 500 });
    }

    return NextResponse.json(newLog[0], {status: 201});

  } catch ( error ) {
    console.error('Error logging workout:', error);
    return NextResponse.json({ error: 'Internal server error'}, {status: 500})
  }
}