import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { userProfiles } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId)
    });

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({
      profile: {
        ...profile,
        weight: profile.weight ? parseFloat(profile.weight) : null,
        height: profile.height ? parseFloat(profile.height) : null,
      }
    });
  } catch (error) {
    console.error("GET_NUTRITION_PROFILE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
