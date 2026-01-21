import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { userGroups } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, and } from "drizzle-orm";

// DELETE: Kick Member
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string; userId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { groupId, userId: targetUserId } = await params;
    const groupIdInt = parseInt(groupId);
    const currentUserId = auth.user.userId;

    if (isNaN(groupIdInt)) return NextResponse.json({ error: "Invalid Group ID" }, { status: 400 });

    // 1. Cek apakah yang melakukan request adalah Admin Grup
    const requesterMembership = await db.query.userGroups.findFirst({
        where: and(eq(userGroups.userId, currentUserId), eq(userGroups.groupId, groupIdInt))
    });

    if (!requesterMembership || !requesterMembership.isAdmin) {
        return NextResponse.json({ error: "Unauthorized: Only admin can kick members" }, { status: 403 });
    }

    // 2. Cek apakah target bukan diri sendiri (Opsional: Admin leave grup logicnya beda)
    if (targetUserId === currentUserId) {
        return NextResponse.json({ error: "Cannot kick yourself" }, { status: 400 });
    }

    // 3. Hapus member
    await db.delete(userGroups)
        .where(
            and(
                eq(userGroups.groupId, groupIdInt),
                eq(userGroups.userId, targetUserId)
            )
        );

    return NextResponse.json({ message: "Member kicked successfully" });

  } catch (error) {
    console.error("KICK_MEMBER_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
