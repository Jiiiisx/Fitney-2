import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { directMessages } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { messageId } = await params;
    const msgIdInt = parseInt(messageId);

    if (isNaN(msgIdInt)) return NextResponse.json({ error: "Invalid Message ID" }, { status: 400 });

    const message = await db.query.directMessages.findFirst({
        where: and(eq(directMessages.id, msgIdInt), eq(directMessages.senderId, auth.user.userId))
    });

    if (!message) {
        return NextResponse.json({ error: "Message not found or unauthorized" }, { status: 404 });
    }

    await db.update(directMessages)
        .set({ content: "_DELETED_" })
        .where(eq(directMessages.id, msgIdInt));

    return NextResponse.json({ message: "Message deleted" });

  } catch (error) {
    console.error("DELETE_DIRECT_MESSAGE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
