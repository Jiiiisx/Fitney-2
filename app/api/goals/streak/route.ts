import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { workoutLogs } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    // 1. Hitung Current Streak (Minggu-minggu berturut-turut ke belakang)
    // Kita mulai cek dari MINGGU LALU.
    // Jika minggu lalu ada latihan -> streak 1. Cek 2 minggu lalu -> streak 2. Dst.
    // Jika minggu lalu kosong -> streak 0 (Reset / Baru mulai).
    
    let pastStreak = 0;
    const today = new Date();
    
    // Loop mundur maksimal 52 minggu (1 tahun) untuk efisiensi
    for (let i = 1; i <= 52; i++) {
        const d = subWeeks(today, i);
        const start = startOfWeek(d, { weekStartsOn: 1 });
        const end = endOfWeek(d, { weekStartsOn: 1 });

        const logs = await db.select({ count: sql<number>`count(*)` })
            .from(workoutLogs)
            .where(and(
                eq(workoutLogs.userId, userId),
                gte(workoutLogs.date, start),
                lte(workoutLogs.date, end)
            ));
            
        if (Number(logs[0].count) > 0) {
            pastStreak++;
        } else {
            // Streak putus
            break; 
        }
    }

    // 2. Tentukan Posisi Minggu Ini
    // Minggu ini adalah (Past Streak + 1).
    // Contoh: Punya streak 3 minggu lalu. Minggu ini adalah W4.
    const currentWeekNum = pastStreak + 1;

    // 3. Tentukan Halaman (Pagination per 5 minggu)
    // Jika currentWeekNum = 4, page = 1.
    // Jika currentWeekNum = 6, page = 2.
    const page = Math.ceil(currentWeekNum / 5);
    const startWeek = (page - 1) * 5 + 1;

    // 4. Generate Data untuk 5 Slot
    const weeksData = [];
    for (let i = 0; i < 5; i++) {
        const weekNum = startWeek + i;
        let status = 'pending';

        if (weekNum < currentWeekNum) {
            status = 'completed';
        } else if (weekNum === currentWeekNum) {
            status = 'active'; // Minggu ini selalu active (flame)
        } 
        // Sisanya pending

        weeksData.push({
            week: `W${weekNum}`,
            status
        });
    }

    return NextResponse.json(weeksData);

  } catch(e) {
      console.error("GET_STREAK_ERROR", e);
      return NextResponse.json({error: "Server error"}, {status: 500});
  }
}