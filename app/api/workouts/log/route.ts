import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/db";
import { workoutLogs } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";

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