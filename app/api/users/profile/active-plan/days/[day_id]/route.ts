import { NextResponse, NextRequest } from "next/server";
import { db } from '@/app/lib/db';
import { verifyAuth } from "@/app/lib/auth";
import { userPlanDays, userPlans } from "@/app/lib/schema";
import { and, eq, inArray } from 'drizzle-orm';

export async function DELETE(
  req: NextRequest,
  context: { params: { day_id: string } }
) {
  const auth = await verifyAuth(req);
  if (auth.error) {
    return auth.error;
  }
  const userId = auth.user.userId;

  const dayId = context.params.day_id;
  const parsedDayId = parseInt(dayId, 10);

  if (isNaN(parsedDayId)) {
    return NextResponse.json (
      { error: 'Valid Day ID us required'}, {status: 400}
    );
  }

  try {
    const userOwnedPlansQuery = db 
      .select({ id: userPlans.id })
      .from(userPlans)
      .where(eq(userPlans.userId, userId));

    const deletedDay = await db
      .delete(userPlanDays)
      .where(
        and(
          eq(userPlanDays.id, parsedDayId),
          inArray(userPlanDays.userPlanId, userOwnedPlansQuery)
        )
      )
      .returning({ id: userPlanDays.id });

    if (deletedDay.length === 0) {
      return NextResponse.json(
        { error: 'Day not founf or you do not have permission to delete it.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { succes: true, deletedDayId: deletedDay[0].id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting plan day:', error);
    return NextResponse.json(
      { error: ' Internal server error'},
      { status: 500 }
    );
  }
}