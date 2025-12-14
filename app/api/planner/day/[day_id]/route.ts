import { NextRequest, NextResponse } from "next/server";
import { db } from '@/app/lib/db';
import { userPlans, userPlanDays } from '@/app/lib/schema';
import { verifyAuth } from "@/app/lib/auth";
import { and, eq, inArray } from 'drizzle-orm';

export async function DELETE(
  req: NextRequest, { params }: { params: { day_id: string } }
) {
  const auth = await verifyAuth(req);
  if (auth.error || !auth.user?.userId) {
    return auth.error || NextResponse.json({ error: 'Unauthorized' }, {status: 401});
  }

  const userId = auth.user.userId;
  const dayId = params.day_id;

  const dayIdAsNumber = parseInt(dayId, 10);
  if (isNaN(dayIdAsNumber)) {
    return NextResponse.json({ error: 'Valid Day ID is required'}, {status: 400});
  }

  try {
    const activeUserPlanQuery = db
      .select({ id: userPlans.id })
      .from(userPlans)
      .where(
        and(
          eq(userPlans.userId, userId),
          eq(userPlans.isActive, true)
        )
      );

      const deleteDays = await db
        .delete(userPlanDays)
        .where(
          and(
            eq(userPlanDays.id, dayIdAsNumber),
            inArray(userPlanDays.userPlanId, activeUserPlanQuery)
          )
        )
        .returning({ id: userPlanDays.id });

      if (deleteDays.length === 0) {
        return NextResponse.json({ error: 'day not found or you do no have permission to delete it.'}, {status: 404});
      }

      return NextResponse.json({ succes: true, deleteDaysId: deleteDays[0].id }, { status: 200 });
  } catch (error) {
    console.error('Error deleting plan day:', error);
    return NextResponse.json({ error: 'Internal Server Error'}, { status: 500 });
  }
}