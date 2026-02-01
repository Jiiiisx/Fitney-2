import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/schema";
import { eq, ilike, or, count, sql } from "drizzle-orm";
import { verifyAdmin } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "15");
    const offset = parseInt(searchParams.get("offset") || "0");

    let whereClause = undefined;
    if (query) {
        whereClause = or(
            ilike(users.username, `%${query}%`),
            ilike(users.email, `%${query}%`),
            ilike(users.fullName, `%${query}%`)
        );
    }

    const data = await db.query.users.findMany({
        where: whereClause,
        limit: limit,
        offset: offset,
        orderBy: (users, { desc }) => [desc(users.createdAt)]
    });

    const [total] = await db.select({ value: count() }).from(users).where(whereClause);

    return NextResponse.json({
        data,
        total: total.value
    });

  } catch (error) {
    console.error("ADMIN_USERS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}