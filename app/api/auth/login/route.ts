import { NextResponse  } from "next/server";
import { db } from '@/app/lib/db';
import { users } from '@/app/lib/schema';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { eq, or } from 'drizzle-orm'

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Missing identifier or password'}, { status: 400 });
    }

    const userResult = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.username, identifier)));

    if (userResult.length === 0) {
      return NextResponse.json({ error : 'Invalid credentials '}, { status: 401 });
    }

    const user = userResult[0];


    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({ email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);

    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, token })
  } catch (error) {
    console.error('LOGIN_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Down'}, { status: 500 });
  }
}