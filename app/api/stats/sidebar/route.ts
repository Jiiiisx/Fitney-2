import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // --- 1. Calculate Workout Consistency ---
    const consistencyResult = await query(
      `
      SELECT
        COUNT(DISTINCT CASE WHEN ws.session_date >= NOW() - INTERVAL '7 days' THEN ws.session_id END) AS last_7_days,
        COUNT(DISTINCT CASE WHEN ws.session_date >= NOW() - INTERVAL '14 days' AND ws.session_date < NOW() - INTERVAL '7 days' THEN ws.session_id END) AS previous_7_days
      FROM workout_logs wl
      JOIN workout_sessions ws ON wl.session_id = ws.session_id
      WHERE ws.user_id = $1 AND ws.session_date >= NOW() - INTERVAL '14 days';
      `,
      [userId]
    );

    const { last_7_days, previous_7_days } = consistencyResult.rows[0];
    let consistencyChange = 0;
    if (previous_7_days > 0) {
      consistencyChange = ((last_7_days - previous_7_days) / previous_7_days) * 100;
    } else if (last_7_days > 0) {
      consistencyChange = 100; // Infinite growth, cap at 100% for simplicity
    }

    // --- 2. Calculate Goal Progress (Temporarily Disabled) ---
    // The 'goals' table does not exist in the database schema yet.
    // This section is commented out to prevent the API from crashing.
    // let progressResult = await query(
    //   `
    //   SELECT current_value, target_value
    //   FROM goals
    //   WHERE user_id = $1 AND status = 'in_progress' AND target_value > 0
    //   ORDER BY created_at DESC
    //   LIMIT 1;
    //   `,
    //   [userId]
    // );

    let goalProgress = 0;
    // if (progressResult.rows.length > 0) {
    //   const goal = progressResult.rows[0];
    //   if (goal.target_value > 0) {
    //     goalProgress = (goal.current_value / goal.target_value) * 100;
    //   }
    // }

    return NextResponse.json({
      consistencyChange: Math.round(consistencyChange),
      goalProgress: Math.round(goalProgress),
    });

  } catch (error) {
    console.error('API_STATS_SIDEBAR_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
