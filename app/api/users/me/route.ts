import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const userResult = await query('SELECT id, username, email, full_name FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(userResult.rows[0]);
  } catch (error) {
    console.error('API_USERS_ME_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
