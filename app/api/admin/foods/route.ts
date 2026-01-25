import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { foods } from "@/app/lib/schema";
import { eq, ilike, sql } from "drizzle-orm";
import { verifyAdmin } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "15");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const results = await db.select().from(foods)
      .where(ilike(foods.name, `%${query}%`))
      .orderBy(foods.name)
      .limit(limit)
      .offset(offset);

    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(foods);
    const total = totalResult[0].count;

    return NextResponse.json({ data: results, total });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch foods" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const { name, calories, protein, carbs, fat } = body;
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const newFood = await db.insert(foods).values({
      name,
      caloriesPer100g: calories.toString(),
      proteinPer100g: protein.toString(),
      carbsPer100g: carbs.toString(),
      fatPer100g: fat.toString(),
    }).returning();

    return NextResponse.json(newFood[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create food" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const { id, name, calories, protein, carbs, fat } = body;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updated = await db.update(foods)
      .set({
        name,
        caloriesPer100g: calories.toString(),
        proteinPer100g: protein.toString(),
        carbsPer100g: carbs.toString(),
        fatPer100g: fat.toString(),
      })
      .where(eq(foods.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update food" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await db.delete(foods).where(eq(foods.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete food" }, { status: 500 });
  }
}