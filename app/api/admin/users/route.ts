import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/schema";
import { verifyAdmin } from "@/app/lib/auth";
import { eq, ilike, or, desc, sql } from "drizzle-orm";

// GET: List or Search Users
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let whereCondition = undefined;
    if (query) {
      whereCondition = or(
        ilike(users.username, `%${query}%`),
        ilike(users.email, `%${query}%`),
        ilike(users.fullName, `%${query}%`)
      );
    }

    const allUsers = await db.query.users.findMany({
      where: whereCondition,
      orderBy: [desc(users.createdAt)],
      columns: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        level: true,
        xp: true,
        createdAt: true,
        imageUrl: true,
      },
      limit: limit,
      offset: offset,
    });

    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);

    return NextResponse.json({ data: allUsers, total: totalUsers[0].count });
  } catch (error) {
    console.error("ADMIN_GET_USERS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
