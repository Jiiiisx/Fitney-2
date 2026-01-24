import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { groupMessages } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string, messageId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { messageId } = await params;
    const msgIdInt = parseInt(messageId);

    if (isNaN(msgIdInt)) return NextResponse.json({ error: "Invalid Message ID" }, { status: 400 });

    // Cek apakah pesan ada dan milik user tersebut
    const message = await db.query.groupMessages.findFirst({
        where: and(eq(groupMessages.id, msgIdInt), eq(groupMessages.userId, auth.user.userId))
    });

    if (!message) {
        return NextResponse.json({ error: "Message not found or unauthorized" }, { status: 404 });
    }

    // Ubah konten menjadi placeholder bukannya menghapus baris
    await db.update(groupMessages)
        .set({ content: "_DELETED_" })
        .where(eq(groupMessages.id, msgIdInt));

    return NextResponse.json({ message: "Message deleted" });

  } catch (error) {
    console.error("DELETE_GROUP_MESSAGE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
