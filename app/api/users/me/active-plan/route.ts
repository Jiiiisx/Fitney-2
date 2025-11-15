// app/api/users/me/active-plan/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { headers } from 'next/headers';

// (The existing POST function remains here)
export async function POST(req: Request) {
  const headersList = await headers();
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


// --- NEW GET HANDLER ---

// Helper function to structure the data (similar to the other route)
function structureActivePlan(rows: any[]) {
  if (rows.length === 0) {
    return null;
  }

  const program = {
    id: rows[0].program_id,
    name: rows[0].program_name,
    description: rows[0].program_description,
    weeks: rows[0].weeks,
    start_date: rows[0].start_date,
    schedule: new Map(),
  };

  for (const row of rows) {
    if (row.day_id && !program.schedule.has(row.day_id)) {
      program.schedule.set(row.day_id, {
        day: row.day_number,
        name: row.day_name,
        exercises: [],
      });
    }

    if (row.day_id && row.exercise_id) {
      const day = program.schedule.get(row.day_id);
      day.exercises.push({
        name: row.exercise_name,
        sets: row.sets,
        reps: row.reps,
        duration_seconds: row.duration_seconds,
      });
    }
  }

  program.schedule = Array.from(program.schedule.values()).sort((a, b) => a.day - b.day);
  return program;
}


export async function GET() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await pool.connect();

  try {
    // Step 1: Find the active plan for the user
    let activePlanRes;
    try {
      const activePlanQuery = 'SELECT program_id, start_date FROM user_active_plans WHERE user_id = $1 AND is_active = true';
      activePlanRes = await client.query(activePlanQuery, [userId]);
    } catch (e) {
      console.error('Error during active plan lookup:', e);
      throw new Error('Database query for active plan failed.');
    }

    if (activePlanRes.rows.length === 0) {
      return NextResponse.json(null); // No active plan found
    }

    const { program_id, start_date } = activePlanRes.rows[0];

    // Step 2: Fetch the full details of that plan
    let fullPlanRes;
    try {
      const fullPlanQuery = `
        SELECT
          p.id as program_id, p.name as program_name, p.description as program_description, p.weeks,
          d.id as day_id, d.day_number, d.name as day_name,
          de.sets, de.reps, de.duration_seconds,
          e.id as exercise_id, e.name as exercise_name
        FROM workout_programs p
        LEFT JOIN program_days d ON p.id = d.program_id
        LEFT JOIN program_day_exercises de ON d.id = de.program_day_id
        LEFT JOIN exercises e ON de.exercise_id = e.id
        WHERE p.id = $1
        ORDER BY d.day_number, de.display_order;
      `;
      fullPlanRes = await client.query(fullPlanQuery, [program_id]);
    } catch (e) {
      console.error('Error during full plan query:', e);
      throw new Error('Database query for full plan details failed.');
    }
    
    // Step 3: Structure the data
    let structuredPlan;
    try {
      const rowsWithStartDate = fullPlanRes.rows.map(row => ({ ...row, start_date }));
      structuredPlan = structureActivePlan(rowsWithStartDate);
    } catch(e) {
      console.error('Error during data structuring:', e);
      throw new Error('Failed to structure plan data.');
    }

    return NextResponse.json(structuredPlan);

  } catch (error) {
    console.error('Error fetching active plan:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
