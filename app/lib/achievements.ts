import { db } from "./db";
import { achievements, userAchievements, notifications } from "./schema";
import { eq, and } from "drizzle-orm";

export async function awardAchievement(userId: string, achievementName: string) {
    try {
        // 1. Get achievement ID by name
        const acc = await db.query.achievements.findFirst({
            where: eq(achievements.name, achievementName)
        });

        if (!acc) return;

        // 2. Check if user already has it
        const existing = await db.query.userAchievements.findFirst({
            where: and(
                eq(userAchievements.userId, userId),
                eq(userAchievements.achievementId, acc.id)
            )
        });

        if (existing) return;

        // 3. Award it
        await db.insert(userAchievements).values({
            userId,
            achievementId: acc.id,
            unlockedAt: new Date()
        });

        // 4. Send Notification
        await db.insert(notifications).values({
            userId,
            type: 'system',
            message: `🏆 Badge Baru Terbuka: ${acc.name}! ${acc.description}`,
            createdAt: new Date()
        });

        return true;
    } catch (err) {
        console.error("AWARD_ACHIEVEMENT_ERROR", err);
    }
}

export async function checkWorkoutAchievements(userId: string, totalWorkouts: number) {
    if (totalWorkouts === 1) await awardAchievement(userId, "First Steps");
    if (totalWorkouts === 10) await awardAchievement(userId, "Dedicated Athlete");
    if (totalWorkouts === 50) await awardAchievement(userId, "Fitness Legend");
}
