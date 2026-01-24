import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/schema";
import { verifyAdmin } from "@/app/lib/auth";
import { eq } from "drizzle-orm";

// PATCH: Update user (role, level, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await verifyAdmin(req);
    if (auth.error) return auth.error;

    const { userId } = await params;
    const body = await req.json();
    
    const allowedFields = ["role", "level", "xp"];
    const updates: any = {};
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) updates[field] = body[field];
    });

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    const updatedUser = await db.update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error("ADMIN_UPDATE_USER_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await verifyAdmin(req);
    if (auth.error) return auth.error;

    const { userId } = await params;

    // Prevent admin from deleting themselves
    if (userId === auth.user.userId) {
      return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
    }

    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_DELETE_USER_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
