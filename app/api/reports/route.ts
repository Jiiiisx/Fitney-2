import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { reports } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const { targetType, targetId, reason } = body;

    if (!targetType || !targetId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await db.insert(reports).values({
      reporterId: auth.user.userId,
      targetType,
      targetId: targetId.toString(),
      reason,
      status: "pending",
    });

    return NextResponse.json({ success: true, message: "Report submitted successfully" });
  } catch (error) {
    console.error("REPORT_SUBMIT_ERROR:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
