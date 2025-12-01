import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

// The context parameter is typed as `any` to work around a Next.js/Turbopack issue
// where `params` can be a promise, causing type conflicts with the standard signature.
export async function PUT(request: NextRequest, { params }: any) {
  const resolvedParams = await params;
  const goalId = resolvedParams.goal_id;

  const { user, error } = await verifyAuth(request);
  if (error) {
    return error;
  }
  const userId = user.userId;

  try {
    const body = await request.json();
    const { title, target_value, end_date, current_value } = body;

    const updates: { [key: string]: any } = {};
    if (title !== undefined) updates.title = title;
    if (target_value !== undefined) updates.target_value = target_value;
    if (end_date !== undefined) updates.end_date = end_date;
    if (current_value !== undefined) updates.current_value = current_value;
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.updated_at = new Date();

    const setClauses = Object.keys(updates)
      .map((key, index) => `"${key}" = $${index + 3}`)
      .join(', ');
      
    const values = [...Object.values(updates)];

    const result = await pool.query(
      `UPDATE user_goals SET ${setClauses} WHERE id = $1 AND user_id = $2 RETURNING *`,
      [goalId, userId, ...values]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Goal not found or you do not have permission to edit it' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (dbError) {
    console.error('Error updating goal:', dbError);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: any) {
  const resolvedParams = await params;
  const goalId = resolvedParams.goal_id;

  const { user, error } = await verifyAuth(request);
  if (error) {
    return error;
  }
  const userId = user.userId;

  if (!goalId) {
    return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      'DELETE FROM user_goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Goal not found or you do not have permission to delete it' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Goal deleted successfully' }, { status: 200 });
  } catch (dbError) {
    console.error('Error deleting goal:', dbError);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
