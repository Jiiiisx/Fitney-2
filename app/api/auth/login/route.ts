import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Missing identifier or password' }, { status: 400 });
    }

    const userResult = await query('SELECT * FROM users WHERE email = $1 OR username = $1', [identifier]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Use 'jose' for signing to match middleware verification
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({ email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);

    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('LOGIN_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
