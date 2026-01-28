"use server";

import { db } from "@/app/lib/db";
import { users, workoutLogs, exercises, posts } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/app/lib/auth";
import { workoutLogSchema } from "@/app/lib/validators";

const calculateXpForNextLevel = (level: number) => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export async function logWorkoutAction(formData: FormData) {
  try {
    // 1. Authentication Check
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      return { error: "Unauthorized: No token found" };
    }

    const payload = await getUserFromToken(token);
    if (!payload || !payload.userId) {
      return { error: "Unauthorized: Invalid token" };
    }
    
    const userId = payload.userId; // UUID string

    // 2. Parse & Validate Input using Zod
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = workoutLogSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return { 
        error: "Validation failed", 
        details: validatedFields.error.flatten().fieldErrors 
      };
    }

    const { 
      type, 
      exerciseId, 
      name: nameInput, 
      sets, 
      reps, 
      weight, 
      duration, 
      distance, 
      share: shareToCommunity 
    } = validatedFields.data;

    // 3. Execute in Transaction
    const result = await db.transaction(async (tx) => {
      // Get User Data for XP Calculation
      const user = await tx.query.users.findFirst({
        where: eq(users.id, userId),
      });
      
      if (!user) throw new Error("User not found");

      let workoutName = nameInput || "Unknown Workout";
      if (exerciseId) {
        const exercise = await tx.query.exercises.findFirst({
          where: eq(exercises.id, Number(exerciseId)),
        });
        if (exercise) workoutName = exercise.name;
      }

      // XP Logic
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

      // Level Up Logic
      let newXp = user.xp + awardedXp;
      let newLevel = user.level;
      let xpToNext = calculateXpForNextLevel(newLevel);
      
      while (newXp >= xpToNext) {
        newXp -= xpToNext;
        newLevel++;
        xpToNext = calculateXpForNextLevel(newLevel);
      }

      // Update User XP/Level
      await tx.update(users)
        .set({ level: newLevel, xp: newXp })
        .where(eq(users.id, userId));

      // Insert Log
      await tx.insert(workoutLogs).values({
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

      // Auto Share Logic
      if (shareToCommunity) {
        let content = `Just finished ${workoutName}! 💪\n`;
        if (type === "Strength") content += `${sets} sets x ${reps} reps @ ${weight}kg`;
        else if (type === "Cardio") content += `${duration} mins • ${distance}km`;
        
        await tx.insert(posts).values({
          userId: userId,
          content: content,
          createdAt: new Date(),
        });
      }
      
      return { success: true, awardedXp };
    });

    revalidatePath("/dashboard");
    revalidatePath("/history");
    revalidatePath("/community");
    
    return result;

  } catch (error) {
    console.error("Error logging workout:", error);
    return { error: error instanceof Error ? error.message : "Failed to log workout" };
  }
}
