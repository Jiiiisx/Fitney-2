import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { categories } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  try {
    const allCategories = await db.select().from(categories).orderBy(categories.name);
    return NextResponse.json(allCategories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
