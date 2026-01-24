import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { users, posts, groups } from "@/app/lib/schema";
import { ilike, or, sql } from "drizzle-orm";
import { verifyAdmin } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ users: [], posts: [], groups: [] });
  }

  try {
    const searchPattern = `%${query}%`;

    const [foundUsers, foundPosts, foundGroups] = await Promise.all([
      db.select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        role: users.role
      })
      .from(users)
      .where(or(
        ilike(users.username, searchPattern),
        ilike(users.email, searchPattern),
        ilike(users.fullName, searchPattern)
      ))
      .limit(5),

      db.select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        authorName: users.fullName,
        authorUsername: users.username
      })
      .from(posts)
      .leftJoin(users, ilike(posts.userId, users.id)) // Note: UUID comparison might need casting or exact match, using ilike for safety in some PG setups or eq
      .where(ilike(posts.content, searchPattern))
      .limit(5),

      db.select({
        id: groups.id,
        name: groups.name,
        description: groups.description
      })
      .from(groups)
      .where(or(
        ilike(groups.name, searchPattern),
        ilike(groups.description, searchPattern)
      ))
      .limit(5)
    ]);

    return NextResponse.json({
      users: foundUsers,
      posts: foundPosts,
      groups: foundGroups
    });
  } catch (error) {
    console.error("Admin search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
