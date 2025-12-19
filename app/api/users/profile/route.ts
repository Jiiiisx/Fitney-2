import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/app/lib/db';
import { users, userSettings, bodyMeasurements } from '@/app/lib/schema';

import { eq, desc } from 'drizzle-orm';
import { format } from 'date-fns';
import { verifyAuth } from '@/app/lib/auth';
import { Weight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error || !verifyAuth) {
      return auth.error || NextResponse.json({ error: 'Unauthorized'}, { status: 401});
    }
    const userId = auth.user.userId;

    const userResult = await db
      .select({
        fullname: users.fullName,
        email: users.email,
        dateOfBirth: users.dateOfBirth,
        gender: users.gender,
        hasCompletedOnboarding: userSettings.hasCompletedOnboarding,
      })
      .from(users)
      .leftJoin(userSettings, eq(users.id, userSettings.userId))
      .where(eq(users.id, userId));

    if (userResult.length === 0) {
      return new NextResponse(JSON.stringify({ message: 'User not found' }), {status: 404});
    }

    const userData = userResult[0];

    const measurementResult = await db
      .select({
        height: bodyMeasurements.heightCm,
        Weight: bodyMeasurements.weightKg,
      })
      .from(bodyMeasurements)
      .where(eq(bodyMeasurements.userId, userId))
      .orderBy(desc(bodyMeasurements.date))
      .limit(1);

    const measurementData = measurementResult[0] || {};

    const formattedDob = userData.dateOfBirth
      ? format(new Date(userData.dateOfBirth), 'yyyy-MM-dd')
      : null;

    const profile = {
      fullName: userData.fullname || '',
      email: userData.email || '',
      dob: formattedDob || '',
      gender: userData.gender || '',
      height: measurementData.height || '',
      weight: measurementData.Weight || '',
      hasCompletedOnboarding: userData.hasCompletedOnboarding || false,
    };

    return NextResponse.json(profile);

  } catch(error) {
    console.error('API_GET_USER_PROFILE_ERROR', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error'}), {status: 500})
  }
}