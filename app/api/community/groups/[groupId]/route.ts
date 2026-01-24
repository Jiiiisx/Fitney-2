import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { groups } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { groupId } = await params;
    const groupIdInt = parseInt(groupId);

    if (isNaN(groupIdInt)) {
      return NextResponse.json({ error: "Invalid Group ID" }, { status: 400 });
    }

    const groupResult = await db.select().from(groups).where(eq(groups.id, groupIdInt)).limit(1);
    const group = groupResult[0];

    if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);

  } catch (error) {
    console.error("GET_GROUP_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { groupId } = await params;
    const groupIdInt = parseInt(groupId);

    if (isNaN(groupIdInt)) {
      return NextResponse.json({ error: "Invalid Group ID" }, { status: 400 });
    }

    // 1. Cek apakah grup ada dan apakah user adalah pembuatnya (createdBy)
    // Gunakan db.select() daripada db.query untuk stabilitas
    const groupResult = await db.select().from(groups).where(eq(groups.id, groupIdInt)).limit(1);
    const group = groupResult[0];

    if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.createdBy !== auth.user.userId) {
        return NextResponse.json({ error: "Unauthorized: Only the group admin can delete this group" }, { status: 403 });
    }

    // 2. Hapus Grup (Cascade delete di database akan menghapus user_groups otomatis jika dikonfigurasi, 
    // tapi Drizzle schema kita mendefinisikan foreign key onDelete: 'cascade', jadi aman)
    await db.delete(groups).where(eq(groups.id, groupIdInt));

    return NextResponse.json({ message: "Group deleted successfully" });

  } catch (error) {
    console.error("DELETE_GROUP_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
