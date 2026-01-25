import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/schema";
import { desc, limit } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  const topUsers = await db.select({
    id: users.id,
    username: users.username,
    fullName: users.fullName,
    imageUrl: users.imageUrl,
    level: users.level,
    xp: users.xp
  })
  .from(users)
  .orderBy(desc(users.level), desc(users.xp))
  .limit(10);

  return NextResponse.json(topUsers);
}
