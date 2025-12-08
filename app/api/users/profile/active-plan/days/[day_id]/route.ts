import { NextResponse, NextRequest } from 'next/server';
import pool from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { day_id: string } }
) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;
  const userId = auth.user.userId;

  const userPlanDayId = params.day_id;

  if (!userPlanDayId || isNaN(Number(userPlanDayId))) {
    return NextResponse.json({ error: 'Valid Day ID is required' }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // First, delete associated exercises due to foreign key constraints
    await client.query(
      'DELETE FROM user_plan_day_exercises WHERE user_plan_day_id = $1',
      [userPlanDayId]
    );

    // Now, delete the day itself
    const deleteQuery = `
      DELETE FROM user_plan_days
      WHERE id = $1 
      AND user_plan_id IN (
        SELECT id FROM user_plans 
        WHERE user_id = $2
      )
      RETURNING id;
    `;
    
    const result = await client.query(deleteQuery, [userPlanDayId, userId]);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Day not found or you do not have permission to delete it.' }, { status: 404 });
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, deletedDayId: result.rows[0].id }, { status: 200 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting plan day:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
