import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { notifications } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    
    const userId = auth.user.userId;

    const notifs = await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    return NextResponse.json(notifs);

  } catch (error) {
    console.error("GET_NOTIFICATIONS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Optional: Endpoint untuk mark as read (bisa nanti)
export async function PATCH(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (auth.error) return auth.error;
        const userId = auth.user.userId;

        // Mark all as read for this user
        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId));

        return NextResponse.json({ message: "Marked all as read" });
    } catch (error) {
        return NextResponse.json({ error: "Error" }, { status: 500 });
    }
}
