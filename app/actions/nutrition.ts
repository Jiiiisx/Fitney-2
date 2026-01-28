"use server";

import { db } from "@/app/lib/db";
import { userProfiles } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";

async function getAuthUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const user = await getUserFromToken(token);
  return user?.userId;
}

export async function saveNutritionProfile(data: {
  gender: string;
  age: number;
  weight: number;
  height: number;
  activityLevel: string;
  tdee: number;
  mainGoal?: string;
}) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Unauthorized" };

  try {
    // Upsert logic: Check if profile exists
    const existing = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, userId)
    });

    // Simple target calculation (can be improved)
    // For now, let's just set calorieTarget = tdee
    const calorieTarget = data.tdee;
    const proteinTarget = Math.round(data.weight * 2); // 2g per kg
    const fatTarget = Math.round((calorieTarget * 0.25) / 9); // 25% calories from fat
    const carbsTarget = Math.round((calorieTarget - (proteinTarget * 4) - (fatTarget * 9)) / 4);

    const profileData = {
        userId,
        gender: data.gender,
        age: data.age,
        weight: data.weight.toString(),
        height: data.height.toString(),
        activityLevel: data.activityLevel,
        tdee: data.tdee,
        calorieTarget,
        proteinTarget,
        carbsTarget,
        fatTarget,
        mainGoal: data.mainGoal || "Maintenance",
        updatedAt: new Date()
    };

    if (existing) {
        await db.update(userProfiles)
            .set(profileData)
            .where(eq(userProfiles.userId, userId));
    } else {
        await db.insert(userProfiles).values(profileData);
    }

    revalidatePath("/nutrition");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to save nutrition profile:", error);
    return { error: "Failed to save profile" };
  }
}

export async function getNutritionProfile() {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Unauthorized" };

    try {
        const profile = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, userId)
        });

        if (!profile) return { profile: null };

        // Convert string numeric to number for frontend
        return {
            profile: {
                ...profile,
                weight: profile.weight ? parseFloat(profile.weight) : null,
                height: profile.height ? parseFloat(profile.height) : null,
            }
        };
    } catch (error) {
        console.error("Failed to fetch nutrition profile:", error);
        return { error: "Failed to fetch profile" };
    }
}
