// app/api/planner/day/route.ts
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/app/lib/db';
import { differenceInDays, parseISO } from 'date-fns';
import { verifyAuth } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;
  const userId = auth.user.userId;


  const client = await pool.connect();

  try {
    const { name, date, exercises } = await req.json();

    if (!name || !date) {
      return NextResponse.json({ error: 'Name and date are required' }, { status: 400 });
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

    // 3. Since adding a detailed workout, we assume it replaces any simple "Rest Day" on that date.
    await client.query(
      'DELETE FROM user_plan_days WHERE user_plan_id = $1 AND date = $2 AND name = $3',
      [userPlanId, date, 'Rest Day']
    );
    
    // 4. Insert the new workout day "header".
    const description = `Custom workout: ${name}`;
    const insertDayRes = await client.query(
      'INSERT INTO user_plan_days (user_plan_id, day_number, date, name, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userPlanId, dayNumber, date, name, description]
    );
    const userPlanDayId = insertDayRes.rows[0].id;

    // 5. If there are exercises, insert them into the user_plan_day_exercises table
    if (exercises && exercises.length > 0) {
      for (const [index, exercise] of exercises.entries()) {
        // The exercise ID is now sent directly from the frontend.
        if (!exercise.id) continue;

        await client.query(
          `INSERT INTO user_plan_day_exercises 
            (user_plan_day_id, exercise_id, sets, reps, duration_seconds, display_order) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            userPlanDayId,
            exercise.id,
            exercise.type === 'Strength' ? parseInt(exercise.sets, 10) || null : null,
            exercise.type === 'Strength' ? exercise.reps : null,
            exercise.type === 'Cardio' ? parseInt(exercise.duration, 10) * 60 || null : null,
            index,
          ]
        );
      }
    }

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
