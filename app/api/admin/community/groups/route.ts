import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { groups, userGroups, users } from "@/app/lib/schema";
import { verifyAdmin } from "@/app/lib/auth";
import { eq, sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req);
    if (auth.error) return auth.error;

    const allGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        createdAt: groups.createdAt,
        memberCount: sql<number>`count(${userGroups.userId})::int`,
        creatorName: users.fullName,
      })
      .from(groups)
      .leftJoin(userGroups, eq(groups.id, userGroups.groupId))
      .leftJoin(users, eq(groups.createdBy, users.id))
      .groupBy(groups.id, users.fullName)
      .orderBy(desc(groups.createdAt));

    return NextResponse.json(allGroups);
  } catch (error) {
    console.error("ADMIN_GET_GROUPS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    try {
      const auth = await verifyAdmin(req);
      if (auth.error) return auth.error;
  
      const { searchParams } = new URL(req.url);
      const groupId = searchParams.get("id");
  
      if (!groupId) return NextResponse.json({ error: "Group ID required" }, { status: 400 });
  
      await db.delete(groups).where(eq(groups.id, parseInt(groupId)));
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("ADMIN_DELETE_GROUP_ERROR", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
