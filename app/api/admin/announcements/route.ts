import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { announcements } from "@/app/lib/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdmin } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  const results = await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  try {
    const { content, type } = await req.json();
    const newAnnouncement = await db.insert(announcements).values({
      content,
      type,
    }).returning();
    return NextResponse.json(newAnnouncement[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await db.delete(announcements).where(eq(announcements.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
