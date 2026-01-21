import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { groups, userGroups } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");

    const userId = auth.user.userId;

    // Gunakan explicit LEFT JOIN untuk mengambil data grup + info membership sekaligus
    // Ini lebih 'raw' tapi jauh lebih stabil daripada abstraction layer
    const rows = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        imageUrl: groups.imageUrl,
        createdBy: groups.createdBy,
        joinedAt: userGroups.joinedAt,
        isAdmin: userGroups.isAdmin,
      })
      .from(userGroups)
      .leftJoin(groups, eq(userGroups.groupId, groups.id))
      .where(eq(userGroups.userId, userId))
      .orderBy(desc(userGroups.joinedAt));

    // Filter null groups (jaga-jaga jika referensi rusak)
    let result = rows
        .filter(row => row.id !== null) 
        .map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            imageUrl: row.imageUrl,
            createdBy: row.createdBy,
            joinedAt: row.joinedAt,
            isAdmin: row.isAdmin
        }));

    // Jika filter 'created', kita filter hasil yang sudah didapat
    if (filter === 'created') {
        result = result.filter(g => g.createdBy === userId);
    }
    
    // Debug header untuk melihat user ID di browser network tab
    return NextResponse.json(result, {
        headers: {
            'X-Debug-User-ID': userId,
            'X-Debug-Count': String(result.length)
        }
    });

  } catch (error) {
    console.error("GET_GROUPS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { name, description, imageUrl } = body;

    if (!name) {
        return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    // 1. Create Group
    const newGroup = await db.insert(groups).values({
        name,
        description,
        imageUrl: imageUrl || null,
        createdBy: auth.user.userId,
    }).returning();

    const groupId = newGroup[0].id;

    // 2. Add Creator as Admin Member
    await db.insert(userGroups).values({
        userId: auth.user.userId,
        groupId: groupId,
        isAdmin: true,
    });

    return NextResponse.json(newGroup[0], { status: 201 });

  } catch (error) {
    console.error("CREATE_GROUP_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
