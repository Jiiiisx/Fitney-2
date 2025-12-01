
import { NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';
import { auth } from '@/app/lib/auth';

interface RouteParams {
  params: {
    goal_id: string;
  };
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { goal_id } = params;

  try {
    const { title, target_value, current_value, end_date } = await request.json();

    // For simplicity, this example only allows updating these fields.
    // You could expand this to update any field.
    if (!title || !target_value || current_value === undefined) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = getPool();
    const result = await pool.query(
      `UPDATE user_goals
       SET title = $1, target_value = $2, current_value = $3, end_date = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, target_value, current_value, end_date || null, goal_id, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Goal not found or not owned by user' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating goal ${goal_id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const { goal_id } = params;
  
    try {
      const pool = getPool();
      const result = await pool.query(
        'DELETE FROM user_goals WHERE id = $1 AND user_id = $2 RETURNING *',
        [goal_id, userId]
      );
  
      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Goal not found or not owned by user' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'Goal deleted successfully' });
    } catch (error) {
      console.error(`Error deleting goal ${goal_id}:`, error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
