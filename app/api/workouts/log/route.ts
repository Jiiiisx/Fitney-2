// app/api/workouts/log/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const headersList = headers();
  const userId = headersList.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, name, sets, reps, weight, duration, distance } = body;

    // Basic validation
    if (!type || !name) {
      return NextResponse.json({ error: 'Workout type and name are required' }, { status: 400 });
    }

    const query = `
      INSERT INTO workout_logs (user_id, type, name, sets, reps, weight_kg, duration_min, distance_km, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *;
    `;

    // Use null for undefined values to ensure they are inserted as NULL in the database
    const values = [
      userId,
      type,
      name,
      sets || null,
      reps || null,
      weight || null,
      duration || null,
      distance || null,
    ];

    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      return NextResponse.json(result.rows[0], { status: 201 });
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error logging workout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
