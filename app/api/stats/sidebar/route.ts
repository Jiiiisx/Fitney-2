import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { getUserFromToken } from '@/app/lib/auth';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Mock data for now, as the query can be complex.
    // We can implement the actual logic later.
    const statsData = {
      consistencyChange: 15, // Example: 15% increase
      goalProgress: 65,      // Example: 65% of a goal completed
    };

    return NextResponse.json(statsData);

  } catch (error) {
    console.error('Error fetching sidebar stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}