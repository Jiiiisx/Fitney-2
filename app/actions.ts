// app/actions.ts
"use server";

import { db } from "@/app/lib/db";
import { users, workoutLogs, exercises } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const calculateXpForNextLevel = (level: number) => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export async function logWorkoutAction(formData: FormData) {
  try {
    // TODO: In a real production environment, you must retrieve the authenticated user's ID securely.
    // Since this app uses JWT in headers (API-centric), standard Server Actions don't automatically get the token.
    // For now, we fetch the first user as a fallback to make this action functional for development.
    const user = await db.query.users.findFirst();

    if (!user) {
      console.error("No user found in database to log workout for.");
      return { error: "No user found" };
    }

    const userId = user.id;

    // Extract data from FormData
    const type = formData.get("type")?.toString() || "Strength"; // Default to Strength if not specified
    const exerciseId = formData.get("exerciseId")?.toString();
    const nameInput = formData.get("name")?.toString();
    
    // Numeric fields
    const sets = formData.get("sets") ? Number(formData.get("sets")) : null;
    const reps = formData.get("reps")?.toString() || null;
    const weight = formData.get("weight") ? Number(formData.get("weight")) : null;
    const duration = formData.get("duration") ? Number(formData.get("duration")) : null;
    const distance = formData.get("distance") ? Number(formData.get("distance")) : null;

    let workoutName = nameInput || "Unknown Workout";

    // If an exercise ID is provided, look up the name
    if (exerciseId) {
      const exercise = await db.query.exercises.findFirst({
        where: eq(exercises.id, Number(exerciseId)),
      });
      if (exercise) {
        workoutName = exercise.name;
      }
    }

    // --- Gamification Logic (XP Calculation) ---
    // Duplicate of logic in app/api/workouts/log/route.ts
    let awardedXp = 0;
    const baseDurationXp = (duration || 0) * 2;

    if (type === "Strength") {
      // Simple volume heuristic: sets * reps * weight * constant
      // Note: reps is a string (e.g., "8-12"), so we try to parse the first number or default to 1
      const numericReps = reps ? parseInt(reps) : 1; 
      const volumeXp = (sets || 1) * (isNaN(numericReps) ? 1 : numericReps) * (weight || 0) * 0.1;
      awardedXp = baseDurationXp + Math.floor(volumeXp);
    } else if (type === "Cardio") {
      const distanceXp = (distance || 0) * 10;
      awardedXp = baseDurationXp + Math.floor(distanceXp);
    } else {
      awardedXp = baseDurationXp;
    }

    // Update User XP & Level
    let newXp = user.xp + awardedXp;
    let newLevel = user.level;
    let xpToNext = calculateXpForNextLevel(newLevel);

    while (newXp >= xpToNext) {
      newXp -= xpToNext;
      newLevel++;
      xpToNext = calculateXpForNextLevel(newLevel);
    }

    await db.update(users)
      .set({ level: newLevel, xp: newXp })
      .where(eq(users.id, userId));

    // --- Insert Log ---
    await db.insert(workoutLogs).values({
      userId: userId,
      type: type,
      name: workoutName,
      sets: sets,
      reps: reps,
      weightKg: weight ? String(weight) : null, // Schema expects numeric but Drizzle might handle number -> numeric casting, strictly it's a string in numeric types usually
      durationMin: duration,
      distanceKm: distance ? String(distance) : null,
      date: new Date(),
    });

    revalidatePath("/dashboard");
    revalidatePath("/history");
    
    return { success: true, awardedXp };
  } catch (error) {
    console.error("Error logging workout:", error);
    return { error: "Failed to log workout" };
  }
}
