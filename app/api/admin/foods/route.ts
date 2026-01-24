import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { foods } from "@/app/lib/schema";
import { eq, ilike, or } from "drizzle-orm";
import { verifyAdmin } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  try {
    const results = await db.select().from(foods)
      .where(ilike(foods.name, `%${query}%`))
      .orderBy(foods.name)
      .limit(100);

    return NextResponse.json(results);
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
    console.error("Error creating food:", error);
    return NextResponse.json({ error: "Failed to create food" }, { status: 500 });
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
