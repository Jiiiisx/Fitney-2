import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { directMessages, users, notifications } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, and, or, desc, asc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const myId = auth.user.userId;
    const { userId: friendId } = await params;

    const messages = await db.query.directMessages.findMany({
      where: or(
        and(eq(directMessages.senderId, myId), eq(directMessages.receiverId, friendId)),
        and(eq(directMessages.senderId, friendId), eq(directMessages.receiverId, myId))
      ),
      orderBy: [asc(directMessages.createdAt)],
      with: {
        sender: {
          columns: {
            username: true,
            fullName: true,
            imageUrl: true,
          }
        }
      }
    });

    return NextResponse.json(messages);

  } catch (error) {
    console.error("GET_DIRECT_MESSAGES_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const myId = auth.user.userId;
    const { userId: friendId } = await params;
    const { content } = await req.json();

    if (!content) {
        return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const newMessage = await db.insert(directMessages).values({
      senderId: myId,
      receiverId: friendId,
      content,
    }).returning();

    // Create a notification for the receiver
    try {
        await db.insert(notifications).values({
            userId: friendId,
            senderId: myId,
            type: 'message',
            message: `sent you a message: "${content.substring(0, 20)}${content.length > 20 ? '...' : ''}"`,
            linkUrl: `/community/messages/${myId}`,
        });
    } catch (notifyErr) {
        console.error("Failed to create notification", notifyErr);
    }

    return NextResponse.json(newMessage[0], { status: 201 });

  } catch (error) {
    console.error("POST_DIRECT_MESSAGE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
