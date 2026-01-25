import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { bodyMeasurements } from "@/app/lib/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  const results = await db.select({
    date: bodyMeasurements.date,
    weight: bodyMeasurements.weightKg,
  })
  .from(bodyMeasurements)
  .where(eq(bodyMeasurements.userId, auth.user.userId))
  .orderBy(asc(bodyMeasurements.date))
  .limit(30);

  const formatted = results.map(r => ({
    name: format(new Date(r.date), 'MMM d'),
    weight: parseFloat(r.weight || "0"),
  }));

  return NextResponse.json(formatted);
}
