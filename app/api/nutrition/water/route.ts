import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { waterLogs } from "@/app/lib/schema";
import { eq, and } from "drizzle-orm";

// Ambil log air hari ini
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const today = new Date().toISOString().split('T')[0];

    const log = await db
      .select()
      .from(waterLogs)
      .where(
        and(
          eq(waterLogs.userId, userId),
          eq(waterLogs.date, today)
        )
      )
      .limit(1);

    return NextResponse.json(log[0] || { amountMl: 0 });
  } catch ( error ) {
    console.error("GET_WATER_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error"}, {status: 500});
  }
}

// Update air minum (insert and update)
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const body = await req.json();
    const { amountMl, date } = body;

    const logDate = date || new Date().toISOString().split('T')[0];

    //cek login
    const existingLog = await db
      .select()
      .from(waterLogs)
      .where(and(eq(waterLogs.userId, userId), eq(waterLogs.date, logDate)))
      .limit(1);

    let result;

    if (existingLog.length > 0) {
      result = await db
        .update(waterLogs)
        .set({ amountMl: amountMl })
        .where(eq(waterLogs.id, existingLog[0].id))
        .returning();
    } else {
      result = await db
        .insert(waterLogs)
        .values({
          userId,
          date: logDate,
          amountMl: amountMl
        })
        .returning();
    }

    return NextResponse.json(result[0]);

  } catch (error) {
    console.error("POST_WATER_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}