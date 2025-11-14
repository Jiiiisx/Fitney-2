// app/api/users/me/active-plan/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const headersList = headers();
  const userId = headersList.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await pool.connect();

  try {
    const { programId } = await req.json();

    if (!programId) {
      return NextResponse.json({ error: 'programId is required' }, { status: 400 });
    }

    // Start a transaction
    await client.query('BEGIN');

    // 1. Deactivate any existing active plans for this user
    const deactivateQuery = 'UPDATE user_active_plans SET is_active = false WHERE user_id = $1 AND is_active = true';
    await client.query(deactivateQuery, [userId]);

    // 2. Insert the new active plan
    const insertQuery = `
      INSERT INTO user_active_plans (user_id, program_id, start_date, is_active)
      VALUES ($1, $2, CURRENT_DATE, true)
      RETURNING *;
    `;
    const result = await client.query(insertQuery, [userId, programId]);

    // Commit the transaction
    await client.query('COMMIT');

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    // If any error occurs, roll back the transaction
    await client.query('ROLLBACK');
    console.error('Error setting active plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
