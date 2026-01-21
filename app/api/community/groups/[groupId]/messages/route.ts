import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { groupMessages, userGroups, users } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, asc, and } from "drizzle-orm";

// GET: Ambil pesan untuk grup tertentu
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

    // Cek apakah user adalah member grup (Optional: untuk privacy)
    // Untuk performa, bisa di-skip jika grup publik, tapi sebaiknya dicek
    const membership = await db.query.userGroups.findFirst({
        where: and(eq(userGroups.userId, auth.user.userId), eq(userGroups.groupId, groupIdInt))
    });

    // Jika tidak member, blokir akses (uncomment jika ingin private)
    // if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Gunakan db.select + Join untuk stabilitas
    const rows = await db
      .select({
        id: groupMessages.id,
        content: groupMessages.content,
        createdAt: groupMessages.createdAt,
        userId: groupMessages.userId,
        user: {
            id: users.id,
            username: users.username,
            fullName: users.fullName,
            imageUrl: users.imageUrl,
        }
      })
      .from(groupMessages)
      .leftJoin(users, eq(groupMessages.userId, users.id))
      .where(eq(groupMessages.groupId, groupIdInt))
      .orderBy(asc(groupMessages.createdAt))
      .limit(100);

    return NextResponse.json(rows);

  } catch (error) {
    console.error("GET_GROUP_MESSAGES_ERROR", error);
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
