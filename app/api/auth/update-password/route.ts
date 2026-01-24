import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch user to get current password hash
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
    }

    // 3. Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // 4. Update password in database
    await db.update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, userId));

    return NextResponse.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("UPDATE_PASSWORD_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
