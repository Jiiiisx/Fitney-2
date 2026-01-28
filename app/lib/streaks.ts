import { db } from "@/app/lib/db";
import { workoutLogs, userStreaks, users, userPlanDayExercises, userPlanDays, userPlans } from "@/app/lib/schema";
import { eq, desc, sql, and, gte, lt } from "drizzle-orm";
import { startOfDay, subDays, endOfDay } from "date-fns";

export async function updateUserStreak(userId: string) {
  const today = startOfDay(new Date());
  const thirtyDaysAgo = subDays(today, 30);

  // 1. Hitung berapa banyak jadwal yang terlewat (Missed) dalam 30 hari terakhir
  // Kita ambil semua jadwal yang tanggalnya sudah lewat namun belum selesai
  const missedDaysResult = await db.select({ count: sql<number>`count(*)` })
    .from(userPlanDays)
    .innerJoin(userPlans, eq(userPlanDays.userPlanId, userPlans.id))
    .where(
      and(
        eq(userPlans.userId, userId),
        lt(userPlanDays.date, today.toISOString().split('T')[0]),
        gte(userPlanDays.date, thirtyDaysAgo.toISOString().split('T')[0]),
        sql`NOT EXISTS (
          SELECT 1 FROM ${workoutLogs} 
          WHERE ${workoutLogs.userId} = ${userId} 
          AND date::date = ${userPlanDays.date}::date
        )`,
        sql`${userPlanDays.name} != 'Rest Day'` // Rest day tidak dihitung missed
      )
    );

  const missedCount = Number(missedDaysResult[0]?.count || 0);

  // 2. Tentukan status Streak
  // Jika missed > 5, streak reset. Jika tidak, streak berlanjut berdasarkan hari aktif.
  let currentStreak = 0;
  if (missedCount <= 5) {
      // Hitung streak aktif (hari-hari di mana ada latihan)
      const logs = await db
        .select({ date: workoutLogs.date })
        .from(workoutLogs)
        .where(eq(workoutLogs.userId, userId))
        .orderBy(desc(workoutLogs.date));

      if (logs.length > 0) {
        const uniqueDates = Array.from(new Set(logs.map(l => startOfDay(new Date(l.date)).toISOString())));
        const lastLogDate = startOfDay(new Date(uniqueDates[0]));
        
        // Streak tetap hidup jika latihan terakhir maksimal 7 hari lalu (selama jatah missed masih ada)
        if (differenceInDays(today, lastLogDate) <= 7) {
            let checkDate = lastLogDate;
            while (uniqueDates.includes(checkDate.toISOString())) {
                currentStreak++;
                checkDate = subDays(checkDate, 1);
            }
        }
      }
  }

  // 3. Update Database
  await saveStreak(userId, currentStreak, new Date());
}

// Helper untuk hitung selisih hari
function differenceInDays(date1: Date, date2: Date) {
    return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
}

export async function applyMissedPenalty(userId: string) {
    const penaltyAmount = 50;
    
    // Ambil user saat ini
    const user = await db.select({ xp: users.xp }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) return;

    const newXp = Math.max(0, (user[0].xp || 0) - penaltyAmount);

    await db.update(users)
        .set({ xp: newXp })
        .where(eq(users.id, userId));
    
    return penaltyAmount;
}

async function saveStreak(userId: string, streak: number, lastDate: Date | null) {
  const existing = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db.update(userStreaks)
      .set({
        currentStreak: streak,
        lastActivityDate: lastDate ? lastDate.toISOString().split('T')[0] : null
      })
      .where(eq(userStreaks.userId, userId));
  } else {
    await db.insert(userStreaks).values({
      userId,
      currentStreak: streak,
      lastActivityDate: lastDate ? lastDate.toISOString().split('T')[0] : null
    });
  }
}
