import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { userGoals } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { user, error } = await verifyAuth(request);
  if (error) {
    return error;
  }
  const userId = user.userId;

  try {
    const goals = await db
      .select()
      .from(userGoals)
      .where(eq(userGoals.userId, userId))
      .orderBy(desc(userGoals.createdAt));

    return NextResponse.json(goals);
  } catch (dbError) {
    console.error('Error fetching goals', dbError);
    return NextResponse.json({ error: 'Internal Server Error'}, {status: 500});
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await verifyAuth(request);
  if (error) {
    return error;
  }
  const userId = user.userId;

  try {
    const body = await request.json();
    const { title, category, metric, target_value, end_date } = body;

    if ( !title || !category || !metric || !target_value) {
      return NextResponse.json({ error: 'Missing required fields'}, { status: 400 });
    }

    const newGoal= await db
      .insert(userGoals)
      .values({
        userId: userId,
        title: title,
        category: category,
        metric: metric,
        targetValue: target_value,
        endDate: end_date || null,
      })
      .returning();

    return NextResponse.json(newGoal[0], { status: 201 });
  } catch (dbError) {
    console.error('Error creating goal:', dbError);
    return NextResponse.json({ error: 'Internal Server Error'}, {status: 500});
  }
}