import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { waterLogs } from "@/app/lib/schema";
import { eq, sql } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  const today = format(new Date(), 'yyyy-MM-dd');
  
  const result = await db.query.waterLogs.findFirst({
    where: (logs, { and, eq }) => and(eq(logs.userId, auth.user.userId), eq(logs.date, today))
  });

  return NextResponse.json(result || { amountMl: 0 });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  try {
    const { amount } = await req.json();
    const today = format(new Date(), 'yyyy-MM-dd');

    const existing = await db.query.waterLogs.findFirst({
      where: (logs, { and, eq }) => and(eq(logs.userId, auth.user.userId), eq(logs.date, today))
    });

    if (existing) {
      await db.update(waterLogs)
        .set({ amountMl: existing.amountMl + amount })
        .where(eq(waterLogs.id, existing.id));
    } else {
      await db.insert(waterLogs).values({
        userId: auth.user.userId,
        date: today,
        amountMl: amount
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log water" }, { status: 500 });
  }
}
