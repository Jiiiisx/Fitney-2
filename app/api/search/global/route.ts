import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users, groups, challenges } from "@/app/lib/schema";
import { ilike, or, ne, and } from "drizzle-orm";
import { verifyAuth } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [], groups: [], challenges: [] });
    }

    // Parallel Search
    const [foundUsers, foundGroups, foundChallenges] = await Promise.all([
        // Search Users (exclude admins)
        db.query.users.findMany({
            where: and(
                ne(users.role, 'admin'),
                or(ilike(users.username, `%${query}%`), ilike(users.fullName, `%${query}%`))
            ),
            limit: 5,
            columns: { id: true, username: true, fullName: true, imageUrl: true, role: true }
        }),
        // Search Groups
        db.query.groups.findMany({
            where: ilike(groups.name, `%${query}%`),
            limit: 5
        }),
        // Search Challenges
        db.query.challenges.findMany({
            where: ilike(challenges.title, `%${query}%`),
            limit: 5
        })
    ]);

    return NextResponse.json({
        users: foundUsers,
        groups: foundGroups,
        challenges: foundChallenges
    });

  } catch (error) {
    console.error("GLOBAL_SEARCH_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
