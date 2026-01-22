import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { workoutLogs, users, exercises } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { updateUserStreak } from "@/app/lib/streaks";

const calculateXpForNextLevel = (level: number) => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    // 2. Parse Body
    const body = await req.json();
    const { 
      exerciseId, 
      name, 
      type = "Strength", 
      sets, 
      reps, 
      weight, 
      duration, 
      distance, 
      date 
    } = body;

    // 3. Cari Nama Latihan
    let workoutName = name || "Unknown Workout";
    if (exerciseId) {
      const exerciseData = await db.select().from(exercises).where(eq(exercises.id, exerciseId)).limit(1);
      if (exerciseData.length > 0) {
        workoutName = exerciseData[0].name;
      }
    }

    // 4. Hitung XP
    let awardedXp = 0;
    const baseDurationXp = (Number(duration) || 0) * 2;

    if (type === "Strength" || type === "Weightlifting") {
        const repVal = parseInt(String(reps)) || 0;
        const volXp = (Number(sets) || 1) * repVal * (Number(weight) || 0) * 0.05;
        awardedXp = Math.floor(baseDurationXp + volXp);
    } else {
        const distXp = (Number(distance) || 0) * 10;
        awardedXp = Math.floor(baseDurationXp + distXp);
    }

    if (awardedXp < 10) awardedXp = 10;

    // 5. Update User Level & XP
    const currentUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (currentUser.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let newLevel = currentUser[0].level;
    let newXp = currentUser[0].xp + awardedXp;
    let xpToNext = calculateXpForNextLevel(newLevel);

    let leveledUp = false;
    while (newXp >= xpToNext) {
        newXp -= xpToNext;
        newLevel++;
        xpToNext = calculateXpForNextLevel(newLevel);
        leveledUp = true;
    }

    await db.update(users)
        .set({ level: newLevel, xp: newXp })
        .where(eq(users.id, userId));

    // 6. Simpan Log
    await db.insert(workoutLogs).values({
        userId: userId,
        date: date ? new Date(date) : new Date(),
        type: type,
        name: workoutName,
        sets: Number(sets) || null,
        reps: String(reps) || null,
        weightKg: weight ? String(weight) : null,
        durationMin: Number(duration) || null,
        distanceKm: distance ? String(distance) : null,
        caloriesBurned: Math.floor(Number(duration) * 5) || 0
    });

    // 7. Update Streak
    // Fire and forget (optional: await if consistency is critical)
    await updateUserStreak(userId);

    return NextResponse.json({ 
        success: true, 
        message: "Workout logged!", 
        xpGained: awardedXp,
        leveledUp: leveledUp,
        newLevel: newLevel
    });

  } catch (error) {
    console.error("LOG_WORKOUT_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
