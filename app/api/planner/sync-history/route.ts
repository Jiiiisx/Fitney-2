import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { isBefore, startOfToday, parseISO } from 'date-fns';
import { verifyAuth } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) {
      return auth.error;
    }
    const userId = auth.user.userId;

    // 1. Find the user's active plan
    const planResult = await query(
      'SELECT id FROM user_plans WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    if (planResult.rows.length === 0) {
      return NextResponse.json({ message: 'No active plan to sync.' });
    }
    const userPlanId = planResult.rows[0].id;

    // 2. Find all past, unsynced days for that plan
    const daysResult = await query(
      'SELECT id, date, name FROM user_plan_days WHERE user_plan_id = $1',
      [userPlanId]
    );

    // Use a more robust date check to only get days strictly before today
    const today = startOfToday();
    const pastDays = daysResult.rows.filter(day => day.date && isBefore(parseISO(day.date), today));

    if (pastDays.length === 0) {
      return NextResponse.json({ message: 'No past workout days to sync.' });
    }

    // 3. For each past day, create an entry in workout_logs
    for (const day of pastDays) {
      // Check if it's already logged to prevent duplicates, casting the timestamp to a date
      const existingLog = await query(
        'SELECT id FROM workout_logs WHERE user_id = $1 AND date::date = $2 AND name = $3',
        [userId, day.date, day.name]
      );

      if (existingLog.rows.length > 0) {
        continue; // Skip if already logged
      }

      let type = 'Strength'; // Default
      if (day.name.toLowerCase().includes('rest')) {
        type = 'Rest Day';
      } else if (day.name.toLowerCase().includes('cardio')) {
        type = 'Cardio';
      } else if (day.name.toLowerCase().includes('flexibility')) {
        type = 'Flexibility';
      }
      
      // Mock duration and calories for now
      const duration_min = day.name.toLowerCase().includes('rest') ? 0 : Math.floor(Math.random() * (75 - 45 + 1)) + 45;
      const calories_burned = day.name.toLowerCase().includes('rest') ? 0 : Math.floor(duration_min * 5.5);

      await query(
        `INSERT INTO workout_logs (user_id, date, type, name, duration_min, calories_burned)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, day.date, type, day.name, duration_min, calories_burned]
      );
    }

    return NextResponse.json({ message: `Synced ${pastDays.length} day(s) to history.` });

  } catch (error) {
    console.error('Error syncing planner to history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
