import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { reports, users } from "@/app/lib/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdmin } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  try {
    const allReports = await db.select({
      id: reports.id,
      targetType: reports.targetType,
      targetId: reports.targetId,
      reason: reports.reason,
      status: reports.status,
      createdAt: reports.createdAt,
      reporterName: users.fullName,
      reporterUsername: users.username,
    })
    .from(reports)
    .leftJoin(users, eq(reports.reporterId, users.id))
    .orderBy(desc(reports.createdAt));

    return NextResponse.json(allReports);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const { id, status, adminNotes } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await db.update(reports)
      .set({ 
        status, 
        adminNotes, 
        resolvedAt: status !== 'pending' ? new Date() : null 
      })
      .where(eq(reports.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
