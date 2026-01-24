import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { directMessages, hiddenDirectMessages } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const { ids, mode } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    if (mode === "everyone") {
      await db.update(directMessages)
        .set({ content: "_DELETED_" })
        .where(and(
          inArray(directMessages.id, ids),
          eq(directMessages.senderId, userId)
        ));
    } else {
      const values = ids.map(id => ({
        userId: userId,
        messageId: id
      }));
      
      await db.insert(hiddenDirectMessages)
        .values(values)
        .onConflictDoNothing();
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("BULK_DELETE_DIRECT_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
