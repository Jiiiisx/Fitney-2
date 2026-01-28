import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from '@/app/lib/db';
import { users } from '@/app/lib/schema';
import { loginSchema } from '@/app/lib/validators';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { eq, or } from 'drizzle-orm'

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedFields = loginSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({ 
        error: 'Validation Error', 
        details: validatedFields.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { identifier, password } = validatedFields.data;

    const userResult = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.username, identifier)));

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials ' }, { status: 401 });
    }

    const user = userResult[0];


    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({ 
      email: user.email,
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);

    const { passwordHash, ...userWithoutPassword } = user;

    // Set HttpOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 1 day in seconds
      path: '/',
    });

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('LOGIN_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Down' }, { status: 500 });
  }
}