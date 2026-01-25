import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { exercises, categories } from "@/app/lib/schema";
import { eq, ilike, or, sql } from "drizzle-orm";
import { verifyAdmin } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "15");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const results = await db.select({
      id: exercises.id,
      name: exercises.name,
      description: exercises.description,
      imageUrl: exercises.imageUrl,
      categoryName: categories.name,
      categoryId: exercises.categoryId,
    })
    .from(exercises)
    .leftJoin(categories, eq(exercises.categoryId, categories.id))
    .where(or(
      ilike(exercises.name, `%${query}%`),
      ilike(exercises.description, `%${query}%`)
    ))
    .orderBy(exercises.name)
    .limit(limit)
    .offset(offset);

    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(exercises);
    const total = totalResult[0].count;

    return NextResponse.json({ data: results, total });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const { name, description, categoryId, imageUrl } = body;
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const newExercise = await db.insert(exercises).values({
      name,
      description,
      categoryId: categoryId ? parseInt(categoryId) : null,
      imageUrl,
      updatedAt: new Date()
    }).returning();

    return NextResponse.json(newExercise[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create exercise" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const { id, name, description, categoryId, imageUrl } = body;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updated = await db.update(exercises)
      .set({
        name,
        description,
        categoryId: categoryId ? parseInt(categoryId) : null,
        imageUrl,
        updatedAt: new Date()
      })
      .where(eq(exercises.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update exercise" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await db.delete(exercises).where(eq(exercises.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}