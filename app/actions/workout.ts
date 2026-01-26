"use server";

import { db } from "@/app/lib/db";
import { users, workoutLogs, exercises, posts } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const calculateXpForNextLevel = (level: number) => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export async function logWorkoutAction(formData: FormData) {
  try {
    // ... (existing user logic) 
    const user = await db.query.users.findFirst();
    if (!user) return { error: "No user found" };
    const userId = user.id;

    const type = formData.get("type")?.toString() || "Strength";
    const exerciseId = formData.get("exerciseId")?.toString();
    const nameInput = formData.get("name")?.toString();
    const sets = formData.get("sets") ? Number(formData.get("sets")) : null;
    const reps = formData.get("reps")?.toString() || null;
    const weight = formData.get("weight") ? Number(formData.get("weight")) : null;
    const duration = formData.get("duration") ? Number(formData.get("duration")) : null;
    const distance = formData.get("distance") ? Number(formData.get("distance")) : null;
    const shareToCommunity = formData.get("share") === "on";

    let workoutName = nameInput || "Unknown Workout";
    if (exerciseId) {
      const exercise = await db.query.exercises.findFirst({
        where: eq(exercises.id, Number(exerciseId)),
      });
      if (exercise) workoutName = exercise.name;
    }

    // ... XP Logic (keeping existing)
    let awardedXp = 0;
    const baseDurationXp = (duration || 0) * 2;
    if (type === "Strength") {
      const numericReps = reps ? parseInt(reps) : 1; 
      const volumeXp = (sets || 1) * (isNaN(numericReps) ? 1 : numericReps) * (weight || 0) * 0.1;
      awardedXp = baseDurationXp + Math.floor(volumeXp);
    } else if (type === "Cardio") {
      const distanceXp = (distance || 0) * 10;
      awardedXp = baseDurationXp + Math.floor(distanceXp);
    } else {
      awardedXp = baseDurationXp;
    }

    let newXp = user.xp + awardedXp;
    let newLevel = user.level;
    let xpToNext = calculateXpForNextLevel(newLevel);
    while (newXp >= xpToNext) {
      newXp -= xpToNext;
      newLevel++;
      xpToNext = calculateXpForNextLevel(newLevel);
    }

    await db.update(users).set({ level: newLevel, xp: newXp }).where(eq(users.id, userId));

    // Insert Log
    await db.insert(workoutLogs).values({
      userId: userId,
      type: type,
      name: workoutName,
      sets: sets,
      reps: reps,
      weightKg: weight ? String(weight) : null,
      durationMin: duration,
      distanceKm: distance ? String(distance) : null,
      date: new Date(),
    });

    // AUTO SHARE TO COMMUNITY
    if (shareToCommunity) {
      let content = `Just finished ${workoutName}! 💪\n`;
      if (type === "Strength") content += `${sets} sets x ${reps} reps @ ${weight}kg`;
      else if (type === "Cardio") content += `${duration} mins • ${distance}km`;
      
      await db.insert(posts).values({
        userId: userId,
        content: content,
        createdAt: new Date(),
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/history");
    revalidatePath("/community");
    
    return { success: true, awardedXp };
  } catch (error) {
    console.error("Error logging workout:", error);
    return { error: "Failed to log workout" };
  }
}
