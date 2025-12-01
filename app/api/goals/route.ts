import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  const { user, error } = await verifyAuth(request);
  if (error) {
    return error;
  }
  // The user object from verifyAuth has a userId property
  const userId = user.userId;

  try {
    
    const result = await pool.query(
      'SELECT * FROM user_goals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return NextResponse.json(result.rows);
  } catch (dbError) {
    console.error('Error fetching goals:', dbError);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await verifyAuth(request);
  if (error) {
    return error;
  }
  const userId = user.userId;

  try {
    const { title, category, metric, target_value, end_date } = await request.json();

    // Basic validation
    if (!title || !category || !metric || !target_value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    
    const result = await pool.query(
      `INSERT INTO user_goals (user_id, title, category, metric, target_value, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title, category, metric, target_value, end_date || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (dbError) {
    console.error('Error creating goal:', dbError);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}