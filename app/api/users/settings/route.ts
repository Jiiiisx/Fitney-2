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
        emailNotifications: true,
        pushNotifications: true,
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
    const { theme, measurementUnits, emailNotifications, pushNotifications } = body;

    const updates: any = {};
    if (theme) updates.theme = theme;
    if (measurementUnits) updates.measurementUnits = measurementUnits;
    if (emailNotifications !== undefined) updates.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) updates.pushNotifications = pushNotifications;

    // Pastikan user punya record settings sebelum update
    const existingSettings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    });

    let updatedSettings;

    if (!existingSettings) {
       updatedSettings = await db.insert(userSettings).values({
        userId,
        theme: theme || 'system',
        measurementUnits: measurementUnits || 'metric',
        emailNotifications: emailNotifications ?? true,
        pushNotifications: pushNotifications ?? true,
      }).returning();
    } else {
       updatedSettings = await db.update(userSettings)
        .set(updates)
        .where(eq(userSettings.userId, userId))
        .returning();
    }

    return NextResponse.json(updatedSettings[0]);

  } catch (error) {
    console.error("UPDATE_SETTINGS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
