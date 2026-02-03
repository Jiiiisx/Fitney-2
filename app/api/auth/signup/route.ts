import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/app/lib/db';
import { users } from '@/app/lib/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { authRateLimit } from "@/app/lib/ratelimit";

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success, limit, reset, remaining } = await authRateLimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          }
        }
      );
    }

    const body = await req.json();
    const { username, email, password, fullName, turnstileToken } = body;

    // 2. Cloudflare Turnstile Verification
    if (process.env.NODE_ENV === 'production') {
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret: process.env.TURNSTILE_SECRET_KEY,
                response: turnstileToken,
                remoteip: ip,
            }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
            return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 403 });
        }
    }

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing username, email, password' }, { status: 400 });
    }

    const existingUsers = await db
      .select({
        email: users.email,
        username: users.username
      })
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)));

    if (existingUsers.length > 0) {
      if (existingUsers.some(user => user.email === email)) {
        return NextResponse.json({ error: ' User with this email already exists' }, { status: 409 });
      }
      if (existingUsers.some(user => user.username === username))
        return NextResponse.json({ error: 'username is already taken' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const newUserResult = await db
      .insert(users)
      .values({
        id: userId,
        username: username,
        email: email,
        passwordHash: hashedPassword,
        fullName: fullName
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName
      });



    // Auto-login after signup: Generate Token & Set Cookie
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { SignJWT } = await import('jose'); // Dynamic import or add to top-level imports
    const token = await new SignJWT({ email: newUserResult[0].email })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(newUserResult[0].id)
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    });

    return NextResponse.json(newUserResult[0]);
  } catch (error) {
    console.error('SIGNUP_ERROR', error);
    if (error instanceof Error && (error.message.includes('duplicate key') || error.message.includes('unique constraint'))) {
      return NextResponse.json({ error: 'An account with that username or email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: ' Internal Server Error' }, { status: 500 });
  }
}