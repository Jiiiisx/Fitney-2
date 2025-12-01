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
    const upsertQuery = `
      INSERT INTO user_settings (user_id, has_completed_onboarding)
      VALUES ($1, true)
      ON CONFLICT (user_id) DO UPDATE SET
        has_completed_onboarding = true;
    `;
    await query(upsertQuery, [userId]);
    return NextResponse.json({ message: 'Onboarding status updated successfully.' });
  } catch (error) {
    console.error('API_COMPLETE_ONBOARDING_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
