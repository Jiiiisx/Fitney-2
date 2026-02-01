"use server";

import { db } from "@/app/lib/db";
import { challenges, userChallenges, users } from "@/app/lib/schema";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import { getUserFromToken } from "@/app/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// --- HELPERS ---
async function getAuthUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const user = await getUserFromToken(token);
  return user?.userId;
}

// --- ACTIONS ---

export async function createChallenge(formData: FormData) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const type = formData.get("type") as "frequency" | "distance" | "volume";
  const goalValue = parseInt(formData.get("goalValue") as string);
  const durationDays = parseInt(formData.get("durationDays") as string) || 7;
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + durationDays);

  try {
    const [newChallenge] = await db.insert(challenges).values({
      creatorId: userId,
      title,
      type,
      goalValue,
      startDate: startDate.toISOString().split('T')[0], // yyyy-mm-dd
      endDate: endDate.toISOString().split('T')[0],
    }).returning();

    // Auto-join creator
    await db.insert(userChallenges).values({
      userId,
      challengeId: newChallenge.id,
      joinedAt: new Date(),
    });

    revalidatePath("/community");
    return { success: true, challengeId: newChallenge.id };
  } catch (error) {
    console.error("Failed to create challenge:", error);
    return { error: "Failed to create challenge" };
  }
}

export async function joinChallenge(challengeId: number) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Unauthorized" };

  try {
    await db.insert(userChallenges).values({
      userId,
      challengeId,
      joinedAt: new Date(),
    });

    revalidatePath("/community");
    return { success: true };
  } catch (error) {
    return { error: "Already joined or failed" };
  }
}

export async function getActiveChallenges() {
    const today = new Date().toISOString().split('T')[0];
    
    // Get challenges that haven't ended yet
    const activeChallenges = await db.query.challenges.findMany({
        where: gte(challenges.endDate, today),
        orderBy: [desc(challenges.createdAt)],
        with: {
            creator: true,
            participants: {
                with: {
                    user: true
                }
            }
        }
    });

    return activeChallenges;
}

export async function getUserActiveChallenges() {
    const userId = await getAuthUserId();
    if (!userId) return [];

    const myChallenges = await db.query.userChallenges.findMany({
        where: and(eq(userChallenges.userId, userId), eq(userChallenges.isCompleted, false)),
        with: {
            challenge: true
        }
    });

    return myChallenges;
}
