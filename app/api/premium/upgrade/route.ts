import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const { planId } = await req.json();

    const now = new Date();
    const expiry = new Date();
    
    // Add 30 days for 'pro' (monthly) and 365 for 'elite' (yearly)
    if (planId === 'pro') {
        expiry.setDate(now.getDate() + 30);
    } else {
        expiry.setDate(now.getDate() + 365);
    }

    // 1. Update User Role and Expiry Dates
    await db.update(users)
      .set({ 
          role: planId === 'pro' ? 'pro' : 'elite',
          premiumSince: now,
          premiumUntil: expiry
      })
      .where(eq(users.id, userId));

    // Optional: Add achievement for subscribing
    // await db.insert(userAchievements)...

    return NextResponse.json({ success: true, role: 'premium' });

  } catch (error) {
    console.error("UPGRADE_PREMIUM_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
