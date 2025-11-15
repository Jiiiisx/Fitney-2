// app/api/workouts/history/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { headers } from 'next/headers';

export async function GET() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const query = `
      SELECT 
        id, 
        type, 
        name, 
        sets, 
        reps, 
        weight_kg, 
        duration_min, 
        distance_km, 
        to_char(date, 'YYYY-MM-DD HH24:MI:SS') as date 
      FROM workout_logs 
      WHERE user_id = $1 
      ORDER BY date DESC;
    `;
    
    const client = await pool.connect();
    try {
      const result = await client.query(query, [userId]);
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error fetching workout history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
