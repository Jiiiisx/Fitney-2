import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users, notifications } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { verifyAdmin } from "@/app/lib/auth";

const calculateXpForNextLevel = (level: number) => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  try {
    const { userId } = await context.params;
    const { amount, reason } = await req.json();

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let newXp = user.xp + parseInt(amount);
    let newLevel = user.level;
    let xpToNext = calculateXpForNextLevel(newLevel);

    // Level up logic
    while (newXp >= xpToNext) {
      newXp -= xpToNext;
      newLevel++;
      xpToNext = calculateXpForNextLevel(newLevel);
    }

    // Level down logic (if amount is negative)
    while (newXp < 0 && newLevel > 1) {
      newLevel--;
      xpToNext = calculateXpForNextLevel(newLevel);
      newXp += xpToNext;
    }

    if (newXp < 0) newXp = 0;

    await db.update(users)
      .set({ 
        xp: newXp, 
        level: newLevel 
      })
      .where(eq(users.id, userId));

    // Notify user
    await db.insert(notifications).values({
      userId: userId,
      type: "system",
      message: `Admin awarded you ${amount} XP! ${reason ? `Reason: ${reason}` : ""}`,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, newLevel, newXp });
  } catch (error) {
    console.error("XP_ADJUST_ERROR", error);
    return NextResponse.json({ error: "Failed to adjust XP" }, { status: 500 });
  }
}
