import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { userSettings } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    let settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    });

    // Jika settings belum ada, buat default
    if (!settings) {
      const newSettings = await db.insert(userSettings).values({
        userId: userId,
        theme: 'system',
        measurementUnits: 'metric',
        fontSize: 'text-size-md',
        emailNotifications: true,
        pushNotifications: true,
        notificationSound: 'default',
        vibrationEnabled: true,
        showPopup: true,
        showBadge: true,
        channelWorkout: true,
        channelAchievements: true,
        channelSocial: true,
      }).returning();
      settings = newSettings[0];
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET_SETTINGS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const body = await req.json();
    
    // List of allowed fields to update
    const allowedFields = [
      'theme', 
      'measurementUnits', 
      'fontSize',
      'emailNotifications', 
      'pushNotifications',
      'notificationSound',
      'vibrationEnabled',
      'showPopup',
      'showBadge',
      'channelWorkout',
      'channelAchievements',
      'channelSocial'
    ];

    const updates: any = {};
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
    }

    // Pastikan user punya record settings sebelum update
    const existingSettings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    });

    let updatedSettings;

    if (!existingSettings) {
       updatedSettings = await db.insert(userSettings).values({
        userId,
        ...updates
      }).returning();
    } else {
       updatedSettings = await db.update(userSettings)
        .set(updates)
        .where(eq(userSettings.userId, userId))
        .returning();
    }

    return NextResponse.json(updatedSettings[0]);

  } catch (error: any) {
    console.error("UPDATE_SETTINGS_ERROR", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
