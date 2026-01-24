import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { groupMessages, userGroups, users, hiddenGroupMessages } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, asc, and, notInArray, inArray } from "drizzle-orm";

// GET: Ambil pesan untuk grup tertentu
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const { groupId } = await params;
    const groupIdInt = parseInt(groupId);

    if (isNaN(groupIdInt)) return NextResponse.json({ error: "Invalid Group ID" }, { status: 400 });

    // 1. Dapatkan ID pesan yang disembunyikan oleh user ini
    const hiddenIds = await db
        .select({ id: hiddenGroupMessages.messageId })
        .from(hiddenGroupMessages)
        .where(eq(hiddenGroupMessages.userId, userId));
    
    const hiddenIdList = hiddenIds.map(h => h.id);

    // 2. Fetch pesan
    const messages = await db.query.groupMessages.findMany({
      where: and(
        eq(groupMessages.groupId, groupIdInt),
        hiddenIdList.length > 0 ? notInArray(groupMessages.id, hiddenIdList) : undefined
      ),
      orderBy: [asc(groupMessages.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            fullName: true,
            imageUrl: true,
          }
        }
      }
    });

    return NextResponse.json(messages);

  } catch (error) {
    console.error("GET_GROUP_MESSAGES_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Hapus banyak pesan sekaligus (Bulk Delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const { ids, mode } = await req.json(); // IDs: number[], mode: 'me' | 'everyone'

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    if (mode === "everyone") {
      // Hanya hapus pesan yang memang dikirim oleh user ini
      await db.update(groupMessages)
        .set({ content: "_DELETED_" })
        .where(and(
          inArray(groupMessages.id, ids),
          eq(groupMessages.userId, userId)
        ));
    } else {
      // Hapus untuk saya (hide)
      const values = ids.map(id => ({
        userId: userId,
        messageId: id
      }));
      
      await db.insert(hiddenGroupMessages)
        .values(values)
        .onConflictDoNothing();
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("BULK_DELETE_GROUP_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Kirim pesan baru
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { groupId } = await params;
    const groupIdInt = parseInt(groupId);
    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
        return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    // Insert pesan
    const newMessage = await db.insert(groupMessages).values({
        groupId: groupIdInt,
        userId: auth.user.userId,
        content: content.trim(),
    }).returning();

    // Fetch user info untuk return langsung (optimistic UI di frontend)
    const user = await db.query.users.findFirst({
        where: eq(users.id, auth.user.userId),
        columns: {
            id: true,
            username: true,
            fullName: true,
            imageUrl: true,
        }
    });

    return NextResponse.json({
        ...newMessage[0],
        user
    }, { status: 201 });

  } catch (error) {
    console.error("SEND_GROUP_MESSAGE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
