import { NextRequest, NextResponse } from "next/server";
import { db } from '@/app/lib/db';
import { userGoals } from "@/app/lib/schema";
import { verifyAuth } from "@/app/lib/auth";
import { and, eq } from 'drizzle-orm';

export async function PUT(request: NextRequest, { params }: any) {
  const resolvedParams = await params;
  const goalId = parseInt(resolvedParams.goal_id, 10);

  if (isNaN(goalId)) {
    return NextResponse.json({ error: 'Invalid goal ID' }, {status: 400});
  }

  const {user, error} = await verifyAuth(request);
  if(error) {
    return error;
  }
  const userId = user.userId;

  try {
    const body = await request.json();
    const { title, target_value, end_date, current_value} = body;

    const updates: {[key: string]: any} = {};

    if (title !== undefined) updates.title = title;
    if (target_value !== undefined) updates.targetValue = target_value;
    if (end_date !== undefined) updates.endDate = end_date;
    if (current_value !== undefined) updates.currentValue = current_value;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update'}, {status: 400});
    }

    updates.updatedAt = new Date();

    const updatedGoals = await db
      .update(userGoals)
      .set(updates)
      .where(and(eq(userGoals.id, goalId), eq(userGoals.userId, userId)))
      .returning();

    if (updatedGoals.length === 0) {
      return NextResponse.json({ error: 'Goal not found or user does not have permission'}, {status: 404});
    }

    return NextResponse.json(updatedGoals[0]);
  } catch (e: any) {
    console.error('Error updating goal:', e);
    if (e instanceof SyntaxError) {
      return NextResponse.json({ error: 'Internal Server Error'}, {status: 400});
    }
    return NextResponse.json({ error: 'Internal Server Error'}, {status: 500});
  }
}