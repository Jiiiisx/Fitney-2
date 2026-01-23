import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { notifications } from "@/app/lib/schema";
import { eq, and, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const result = await db
        .select({ value: count() })
        .from(notifications)
        .where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            )
        );

    return NextResponse.json({ unreadCount: result[0].value });
  } catch (error) {
    console.error("GET_UNREAD_COUNT_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
