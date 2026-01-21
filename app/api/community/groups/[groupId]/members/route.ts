import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { userGroups, users } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, and, desc } from "drizzle-orm";

// GET: Ambil daftar anggota
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { groupId } = await params;
    const groupIdInt = parseInt(groupId);

    if (isNaN(groupIdInt)) return NextResponse.json({ error: "Invalid Group ID" }, { status: 400 });

    const members = await db
      .select({
        userId: users.id,
        username: users.username,
        fullName: users.fullName,
        imageUrl: users.imageUrl,
        joinedAt: userGroups.joinedAt,
        isAdmin: userGroups.isAdmin,
      })
      .from(userGroups)
      .leftJoin(users, eq(userGroups.userId, users.id))
      .where(eq(userGroups.groupId, groupIdInt))
      .orderBy(desc(userGroups.isAdmin), desc(userGroups.joinedAt));

    return NextResponse.json(members);

  } catch (error) {
    console.error("GET_GROUP_MEMBERS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
