import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { userGoals } from '@/app/lib/schema';
import { verifyAuth } from "@/app/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return auth.error;
  }
  const userId = auth.user.userId;

  try {
    const goals = await db
      .select()
      .from(userGoals)
      .where(eq(userGoals.userId, userId))
      .orderBy(desc(userGoals.createdAt));

    return NextResponse.json(goals);
  } catch (dbError) {
    console.error('Error fetching user goals:', dbError);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}