import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { directMessages, hiddenDirectMessages } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, and, or } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const { messageId } = await params;
    const msgIdInt = parseInt(messageId);

    if (isNaN(msgIdInt)) return NextResponse.json({ error: "Invalid Message ID" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "me"; // 'me' or 'everyone'

    // 1. Fetch message
    const message = await db.query.directMessages.findFirst({
        where: eq(directMessages.id, msgIdInt)
    });

    if (!message) {
        return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (mode === "everyone") {
        // Only sender can delete for everyone
        if (message.senderId !== userId) {
            return NextResponse.json({ error: "Unauthorized to delete for everyone" }, { status: 403 });
        }

        await db.update(directMessages)
            .set({ content: "_DELETED_" })
            .where(eq(directMessages.id, msgIdInt));
            
        return NextResponse.json({ message: "Message deleted for everyone" });
    } else {
        // Delete for me
        // Verify user is either sender or receiver
        if (message.senderId !== userId && message.receiverId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await db.insert(hiddenDirectMessages).values({
            userId: userId,
            messageId: msgIdInt
        }).onConflictDoNothing();

        return NextResponse.json({ message: "Message hidden for you" });
    }

  } catch (error) {
    console.error("DELETE_DIRECT_MESSAGE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
