import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { notifications, users } from "@/app/lib/schema";
import { eq, desc, and } from "drizzle-orm";

// GET: Fetch all notifications for the current user
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const results = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
      with: {
        // We need relations defined in schema for this to work elegantly
        // If relations aren't set up for senderId, we might need a manual join
      }
    });

    // Manual Join since we haven't updated relations for senderId yet
    // Let's do a more robust query
    const data = await db
        .select({
            id: notifications.id,
            type: notifications.type,
            message: notifications.message,
            resourceId: notifications.resourceId,
            linkUrl: notifications.linkUrl,
            isRead: notifications.isRead,
            createdAt: notifications.createdAt,
            sender: {
                id: users.id,
                username: users.username,
                fullName: users.fullName,
                imageUrl: users.imageUrl,
            }
        })
        .from(notifications)
        .leftJoin(users, eq(notifications.senderId, users.id))
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(50);

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET_NOTIFICATIONS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Mark notification as read
export async function PATCH(req: NextRequest) {
    try {
      const auth = await verifyAuth(req);
      if (auth.error) return auth.error;
      const userId = auth.user.userId;
  
      const body = await req.json();
      const { notificationId, all } = body;
  
      if (all) {
          // Mark all as read
          await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId));
      } else if (notificationId) {
          // Mark specific as read
          await db
            .update(notifications)
            .set({ isRead: true })
            .where(
                and(
                    eq(notifications.id, notificationId),
                    eq(notifications.userId, userId)
                )
            );
      }
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("PATCH_NOTIFICATIONS_ERROR", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}