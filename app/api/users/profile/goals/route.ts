import { NextResponse } from 'next/server';

export async function GET() {
  // In a real application, you would fetch this from a database
  const goals = [
    { id: 1, type: 'weekly_workouts', target: 4, current_progress: 0 },
    { id: 2, type: 'running_distance', target: 10, current_progress: 0 },
  ];

  return NextResponse.json(goals);
}
