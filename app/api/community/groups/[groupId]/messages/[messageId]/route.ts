import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { groupMessages, hiddenGroupMessages } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string, messageId: string }> }
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
    const message = await db.query.groupMessages.findFirst({
        where: eq(groupMessages.id, msgIdInt)
    });

    if (!message) {
        return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (mode === "everyone") {
        // Only sender can delete for everyone
        if (message.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized to delete for everyone" }, { status: 403 });
        }

        await db.update(groupMessages)
            .set({ content: "_DELETED_" })
            .where(eq(groupMessages.id, msgIdInt));
            
        return NextResponse.json({ message: "Message deleted for everyone" });
    } else {
        // Delete for me: Hide the message for the current user
        await db.insert(hiddenGroupMessages).values({
            userId: userId,
            messageId: msgIdInt
        }).onConflictDoNothing();

        return NextResponse.json({ message: "Message hidden for you" });
    }

  } catch (error) {
    console.error("DELETE_GROUP_MESSAGE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
