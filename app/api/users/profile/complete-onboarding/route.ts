// app/api/users/profile/complete-onboarding/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) {
    return auth.error;
  }
  const userId = auth.user.userId;

  try {
    const { goal, level, location } = await req.json();

    if (!goal || !level || !location) {
      return NextResponse.json({ error: 'Missing onboarding data' }, { status: 400 });
    }

    // Upsert into user_profiles table
    const profileUpsertQuery = `
      INSERT INTO user_profiles (user_id, main_goal, experience_level, workout_location, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        main_goal = EXCLUDED.main_goal,
        experience_level = EXCLUDED.experience_level,
        workout_location = EXCLUDED.workout_location,
        updated_at = NOW();
    `;
    await query(profileUpsertQuery, [userId, goal, level, location]);

    // Upsert into user_settings table
    const settingsUpsertQuery = `
      INSERT INTO user_settings (user_id, has_completed_onboarding)
      VALUES ($1, true)
      ON CONFLICT (user_id) DO UPDATE SET
        has_completed_onboarding = true;
    `;
    await query(settingsUpsertQuery, [userId]);
    
    return NextResponse.json({ message: 'Onboarding completed and profile saved successfully.' });
  } catch (error) {
    console.error('API_COMPLETE_ONBOARDING_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
