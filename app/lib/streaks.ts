import { db } from "@/app/lib/db";
import { workoutLogs, userStreaks } from "@/app/lib/schema";
import { eq, desc, sql } from "drizzle-orm";
import { startOfDay, subDays, isSameDay } from "date-fns";

export async function updateUserStreak(userId: string) {
  // 1. Ambil semua tanggal unik latihan user, urutkan dari terbaru
  // Kita batasi misal 365 hari terakhir untuk performa, tapi streak > 1 tahun jarang.
  // Ambil secukupnya, misal 100 record terakhir.
  const logs = await db
    .select({ date: workoutLogs.date })
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId))
    .orderBy(desc(workoutLogs.date));

  if (logs.length === 0) {
    // Tidak ada log, streak 0
    await saveStreak(userId, 0, null);
    return;
  }

  // 2. Normalisasi tanggal ke 'YYYY-MM-DD' atau Date object startOfDay
  const uniqueDates = Array.from(new Set(logs.map(l => startOfDay(new Date(l.date)).toISOString())));
  
  // 3. Hitung Streak
  // Streak valid jika latihan terakhir adalah HARI INI atau KEMARIN.
  // Jika latihan terakhir 2 hari lalu, streak sudah putus (0).
  
  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);
  const todayStr = today.toISOString();
  const yesterdayStr = yesterday.toISOString();

  // Cek apakah ada latihan hari ini atau kemarin
  const hasActivityToday = uniqueDates.includes(todayStr);
  const hasActivityYesterday = uniqueDates.includes(yesterdayStr);

  if (!hasActivityToday && !hasActivityYesterday) {
    // Streak putus
    await saveStreak(userId, 0, new Date(uniqueDates[0])); // Simpan last activity date meski streak 0
    return;
  }

  // Mulai hitung
  // Jika ada activity hari ini, mulai hitung dari hari ini mundur.
  // Jika tidak ada hari ini (tapi ada kemarin), mulai hitung dari kemarin mundur.
  
  let currentStreak = 0;
  let checkDate = hasActivityToday ? today : yesterday;
  
  while (true) {
    const checkDateStr = checkDate.toISOString();
    if (uniqueDates.includes(checkDateStr)) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  // 4. Update Database
  // Last activity date adalah tanggal paling baru di log (bisa hari ini atau kemarin atau kapanpun)
  const lastActivity = new Date(uniqueDates[0]);
  await saveStreak(userId, currentStreak, lastActivity);
}

async function saveStreak(userId: string, streak: number, lastDate: Date | null) {
  // Cek exist
  const existing = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db.update(userStreaks)
      .set({
        currentStreak: streak,
        lastActivityDate: lastDate ? lastDate.toISOString().split('T')[0] : null // cast to date string YYYY-MM-DD if schema uses date
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
