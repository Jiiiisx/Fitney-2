// app/api/planner/day/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { headers } from 'next/headers';
import { differenceInDays, parseISO } from 'date-fns';

export async function POST(req: Request) {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await pool.connect();

  try {
    const { name, type, date, duration } = await req.json();

    if (!name || !type || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. Find or create the user's active plan.
    let planRes = await client.query(
      'SELECT id, start_date FROM user_plans WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    if (planRes.rows.length === 0) {
      planRes = await client.query(
        'INSERT INTO user_plans (user_id, start_date, is_active) VALUES ($1, $2, true) RETURNING id, start_date',
        [userId, date]
      );
    }
    
    const userPlanId = planRes.rows[0].id;
    const startDate = new Date(planRes.rows[0].start_date);

    // 2. Calculate day_number.
    const workoutDate = parseISO(date);
    const dayNumber = differenceInDays(workoutDate, startDate) + 1;

    // 3. Use INSERT ... ON CONFLICT to atomically "upsert" the day's workout.
    const description = type === 'Rest Day' ? 'A day to recover and rebuild.' : `${type} workout for ${duration} minutes.`;
    const upsertQuery = `
      INSERT INTO user_plan_days (user_plan_id, date, day_number, name, description)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_plan_id, date)
      DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        day_number = EXCLUDED.day_number;
    `;
    
    await client.query(upsertQuery, [userPlanId, date, dayNumber, name, description]);

    await client.query('COMMIT');

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding custom workout day:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
