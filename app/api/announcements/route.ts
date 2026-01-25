import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { announcements } from "@/app/lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const activeAnnouncements = await db.select()
    .from(announcements)
    .where(eq(announcements.isActive, true))
    .limit(1); // Usually just one major announcement at a time

  return NextResponse.json(activeAnnouncements);
}
