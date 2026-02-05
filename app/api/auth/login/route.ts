import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from '@/app/lib/db';
import { users } from '@/app/lib/schema';
import { loginSchema } from '@/app/lib/validators';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { eq, or } from 'drizzle-orm'
import { authRateLimit } from "@/app/lib/ratelimit";

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success, limit, reset, remaining } = await authRateLimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 10 minutes." },
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
    const { turnstileToken, ...restBody } = body;

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

    const validatedFields = loginSchema.safeParse(restBody);

    if (!validatedFields.success) {
      return NextResponse.json({ 
        error: 'Validation Error', 
        details: validatedFields.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { identifier, password } = validatedFields.data;

    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        passwordHash: users.passwordHash,
        role: users.role,
        fullName: users.fullName,
        imageUrl: users.imageUrl,
        level: users.level,
        xp: users.xp
      })
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

    // Set HttpOnly Cookie with stricter security
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: true, // Always true for better security
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 86400, 
      path: '/',
    });

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('LOGIN_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Down' }, { status: 500 });
  }
}