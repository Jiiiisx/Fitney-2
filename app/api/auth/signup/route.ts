import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { username, email, password, fullName } = await req.json();

    if (!username || !email || !password) {
      return new NextResponse('Missing username, email, or password', { status: 400 });
    }

    const existingUserByEmail = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUserByEmail.rows.length > 0) {
      return new NextResponse('User with this email already exists', { status: 409 });
    }

    const existingUserByUsername = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (existingUserByUsername.rows.length > 0) {
      return new NextResponse('Username is already taken', { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const newUser = await query(
      'INSERT INTO users (id, username, email, password_hash, full_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, full_name',
      [userId, username, email, hashedPassword, fullName]
    );

    return NextResponse.json(newUser.rows[0]);
  } catch (error) {
    console.error('SIGNUP_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
