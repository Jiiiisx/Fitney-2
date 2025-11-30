// app/api/users/profile/active-plan/days/[day_id]/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { headers } from 'next/headers';

export async function DELETE(
  req: Request,
  context: { params: Promise<{ day_id: string }> }
) {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  
  // Await the params promise to resolve it
  const params = await context.params;
  const userPlanDayId = params.day_id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!userPlanDayId || isNaN(Number(userPlanDayId))) {
    return NextResponse.json({ error: 'Valid Day ID is required' }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    const deleteQuery = `
      DELETE FROM user_plan_days
      WHERE id = $1 
      AND user_plan_id IN (
        SELECT id FROM user_plans 
        WHERE user_id = $2 AND is_active = true
      )
      RETURNING id;
    `;
    
    const result = await client.query(deleteQuery, [userPlanDayId, userId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Day not found or you do not have permission to delete it.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedDayId: result.rows[0].id }, { status: 200 });

  } catch (error) {
    console.error('Error deleting plan day:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
