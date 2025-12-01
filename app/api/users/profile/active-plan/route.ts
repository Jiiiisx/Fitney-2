// app/api/users/profile/active-plan/route.ts
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/app/lib/db';
import { format, addDays } from 'date-fns';
import { verifyAuth } from '@/app/lib/auth';

// POST handler to create a user-specific copy of a workout plan
export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;
  const userId = auth.user.userId;

  const client = await pool.connect();

  try {
    const { programId } = await req.json();

    if (!programId) {
      return NextResponse.json({ error: 'programId is required' }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. Deactivate any existing active plans for this user
    await client.query('UPDATE user_plans SET is_active = false WHERE user_id = $1 AND is_active = true', [userId]);

    // 2. Create the new user_plan record and get its start date
    const userPlanRes = await client.query(
      'INSERT INTO user_plans (user_id, source_program_id, start_date, is_active) VALUES ($1, $2, CURRENT_DATE, true) RETURNING id, start_date',
      [userId, programId]
    );
    const { id: userPlanId, start_date: startDate } = userPlanRes.rows[0];

    // 3. Get all days from the source program template
    const templateDaysRes = await client.query(
      'SELECT id, day_number, name, description FROM program_days WHERE program_id = $1 ORDER BY day_number',
      [programId]
    );

    // 4. Copy the template days and their exercises to the user-specific tables
    for (const templateDay of templateDaysRes.rows) {
      // Calculate the specific date for this day in TypeScript
      const dayDate = addDays(new Date(startDate), templateDay.day_number - 1);
      const formattedDate = format(dayDate, 'yyyy-MM-dd');

      // a. Create a user-specific day
      const userPlanDayRes = await client.query(
        'INSERT INTO user_plan_days (user_plan_id, day_number, date, name, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [userPlanId, templateDay.day_number, formattedDate, templateDay.name, templateDay.description]
      );
      const userPlanDayId = userPlanDayRes.rows[0].id;

      // b. Get exercises for the template day
      const templateExercisesRes = await client.query(
        'SELECT exercise_id, sets, reps, duration_seconds, notes, display_order FROM program_day_exercises WHERE program_day_id = $1',
        [templateDay.id]
      );

      // c. Copy exercises to the user-specific day
      for (const templateExercise of templateExercisesRes.rows) {
        await client.query(
          `INSERT INTO user_plan_day_exercises 
            (user_plan_day_id, exercise_id, sets, reps, duration_seconds, notes, display_order) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            userPlanDayId,
            templateExercise.exercise_id,
            templateExercise.sets,
            templateExercise.reps,
            templateExercise.duration_seconds,
            templateExercise.notes,
            templateExercise.display_order,
          ]
        );
      }
    }

    await client.query('COMMIT');

    return NextResponse.json({ success: true, userPlanId }, { status: 201 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating user plan copy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}


// Helper function to structure the data from the new user-specific tables
function structureActivePlan(rows: any[]) {
  if (rows.length === 0) {
    return null;
  }

  // If the first row has no day_id, it means a plan exists but has no days scheduled yet.
  // Return the basic plan info with an empty schedule.
  if (rows[0].day_id === null) {
    return {
      id: rows[0].user_plan_id,
      name: rows[0].program_name || 'My Custom Plan',
      start_date: rows[0].start_date,
      schedule: [],
    };
  }

  const plan = {
    id: rows[0].user_plan_id,
    name: rows[0].program_name || 'My Custom Plan',
    start_date: rows[0].start_date,
    schedule: new Map(),
  };

  for (const row of rows) {
    if (row.day_id && !plan.schedule.has(row.day_id)) {
      plan.schedule.set(row.day_id, {
        id: row.day_id,
        day_number: row.day_number,
        name: row.day_name,
        description: row.day_description,
        date: row.date,
        exercises: [],
      });
    }

    if (row.day_id && row.exercise_id) {
      const day = plan.schedule.get(row.day_id);
      day.exercises.push({
        name: row.exercise_name,
        sets: row.sets,
        reps: row.reps,
        duration_seconds: row.duration_seconds,
      });
    }
  }

  plan.schedule = Array.from(plan.schedule.values()).sort((a, b) => a.day_number - b.day_number);
  return plan;
}

// GET handler to read the user-specific plan
export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;
  const userId = auth.user.userId;

  const client = await pool.connect();

  try {
    const query = `
      SELECT
        up.id as user_plan_id,
        up.start_date,
        COALESCE(wp.name, 'My Custom Plan') as program_name,
        upd.id as day_id,
        upd.day_number,
        upd.date,
        upd.name as day_name,
        upd.description as day_description,
        upde.sets,
        upde.reps,
        upde.duration_seconds,
        e.id as exercise_id,
        e.name as exercise_name
      FROM user_plans up
      LEFT JOIN user_plan_days upd ON up.id = upd.user_plan_id
      LEFT JOIN user_plan_day_exercises upde ON upd.id = upde.user_plan_day_id
      LEFT JOIN exercises e ON upde.exercise_id = e.id
      LEFT JOIN workout_programs wp ON up.source_program_id = wp.id
      WHERE up.user_id = $1 AND up.is_active = true
      ORDER BY upd.day_number, upde.display_order;
    `;
    
    const result = await client.query(query, [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(null);
    }

    const structuredPlan = structureActivePlan(result.rows);

    console.log("Structured Plan being sent to frontend:", JSON.stringify(structuredPlan, null, 2));

    return NextResponse.json(structuredPlan);

  } catch (error) {
    console.error('Error fetching active plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
