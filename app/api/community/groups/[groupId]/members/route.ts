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

// POST: Tambah anggota baru
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { groupId } = await params;
    const groupIdInt = parseInt(groupId);
    const { userId } = await req.json(); // ID user yang mau ditambahkan

    if (isNaN(groupIdInt) || !userId) {
      return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
    }

    // 1. Cek apakah user sudah ada di grup
    const existingMember = await db
        .select()
        .from(userGroups)
        .where(and(eq(userGroups.groupId, groupIdInt), eq(userGroups.userId, userId)))
        .limit(1);

    if (existingMember.length > 0) {
        return NextResponse.json({ error: "User already in group" }, { status: 400 });
    }

    // 2. Tambahkan Member
    await db.insert(userGroups).values({
        userId: userId,
        groupId: groupIdInt,
        isAdmin: false, // Default member biasa
    });

    return NextResponse.json({ message: "Member added successfully" }, { status: 201 });

  } catch (error) {
    console.error("ADD_MEMBER_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
