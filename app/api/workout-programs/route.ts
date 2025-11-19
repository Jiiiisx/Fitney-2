// app/api/workout-programs/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// This function transforms the flat database result into a nested JSON structure
function structurePrograms(rows: any[]) {
  const programsMap = new Map();

  for (const row of rows) {
    // Ensure program exists in the map
    if (!programsMap.has(row.program_id)) {
      programsMap.set(row.program_id, {
        id: row.program_id,
        name: row.program_name,
        description: row.program_description,
        weeks: row.weeks,
        schedule: new Map(), // Use a map for days to avoid duplicates
      });
    }

    const program = programsMap.get(row.program_id);

    // Ensure day exists in the program's schedule map
    if (row.day_id && !program.schedule.has(row.day_id)) {
      program.schedule.set(row.day_id, {
        day: row.day_number,
        name: row.day_name,
        exercises: [],
      });
    }

    // Add exercise to the day if it exists
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

  // Convert maps to arrays for the final JSON output
  const result = Array.from(programsMap.values()).map(p => {
    p.schedule = Array.from(p.schedule.values()).sort((a, b) => a.day - b.day);
    return p;
  });

  return result;
}

export async function GET() {
  try {
    const query = `
      SELECT
        p.id as program_id,
        p.name as program_name,
        p.description as program_description,
        p.weeks,
        d.id as day_id,
        d.day_number,
        d.name as day_name,
        de.sets,
        de.reps,
        de.duration_seconds,
        e.id as exercise_id,
        e.name as exercise_name
      FROM workout_programs p
      LEFT JOIN program_days d ON p.id = d.program_id
      LEFT JOIN program_day_exercises de ON d.id = de.program_day_id
      LEFT JOIN exercises e ON de.exercise_id = e.id
      ORDER BY p.id, d.day_number, de.display_order;
    `;

    const client = await pool.connect();
    try {
      const result = await client.query(query);
      const structuredData = structurePrograms(result.rows);
      return NextResponse.json(structuredData);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching workout programs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
