import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM workout_logs ORDER BY date DESC');
    
    const formattedHistory = rows.map(row => ({
      id: row.id,
      date: new Date(row.date).toISOString().split('T')[0], // Format to YYYY-MM-DD
      name: row.name,
      type: row.type,
      duration: row.duration_min,
      calories: row.calories_burned, // Assuming the column is named calories_burned
    }));

    return NextResponse.json(formattedHistory);

  } catch (error) {
    console.error("Error fetching workout history from DB:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}