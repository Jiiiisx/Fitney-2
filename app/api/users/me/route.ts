import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    // Get user's base info
    const userResult = await query(
      `SELECT full_name, email, date_of_birth, gender FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return new NextResponse(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    const userData = userResult.rows[0];

    // Get user's latest body measurements
    const measurementResult = await query(
      `SELECT height_cm, weight_kg 
       FROM body_measurements 
       WHERE user_id = $1 
       ORDER BY date DESC 
       LIMIT 1`,
      [userId]
    );

    const measurementData = measurementResult.rows[0] || {};

    // Format date to YYYY-MM-DD for input[type=date]
    const formattedDob = userData.date_of_birth 
      ? format(new Date(userData.date_of_birth), 'yyyy-MM-dd') 
      : null;

    const profile = {
      fullName: userData.full_name || '',
      email: userData.email || '',
      dob: formattedDob || '',
      gender: userData.gender || '',
      height: measurementData.height_cm || '',
      weight: measurementData.weight_kg || '',
    };

    return NextResponse.json(profile);

  } catch (error) {
    console.error('API_GET_USER_PROFILE_ERROR', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
