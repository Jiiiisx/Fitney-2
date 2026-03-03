import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from '@/app/lib/db';
import { users } from '@/app/lib/schema';
import { SignJWT } from 'jose';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ error: 'No credential provided' }, { status: 400 });
    }

    // Verify Google Token via Google API
    let verifyRes;
    try {
      verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    } catch (fetchError: any) {
      console.error('GOOGLE_FETCH_ERROR:', fetchError.message);
      return NextResponse.json({ error: 'Failed to reach Google servers. Check your internet connection.' }, { status: 503 });
    }
    
    if (!verifyRes.ok) {
      const errorData = await verifyRes.json();
      console.error('GOOGLE_VERIFY_FAILURE:', errorData);
      return NextResponse.json({ error: 'Invalid Google token or expired session' }, { status: 401 });
    }

    const payload = await verifyRes.json();

    // Basic validation
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (payload.aud !== clientId) {
      console.error('GOOGLE_AUDIENCE_MISMATCH:', { payloadAud: payload.aud, envId: clientId });
      return NextResponse.json({ error: 'Invalid audience configuration' }, { status: 401 });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let user;

    if (userResult.length === 0) {
      // Create new user
      const newUserId = uuidv4();
      // Generate a random username from email
      const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
      
      // Random dummy password for OAuth users
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);

      const [newUserDetails] = await db.insert(users).values({
        id: newUserId,
        email: email,
        username: uniqueUsername,
        fullName: name,
        imageUrl: null, // Don't save Google photo automatically, show initials instead
        passwordHash: dummyPassword,
        role: 'user',
        level: 1,
        xp: 0,
      }).returning();
      
      user = newUserDetails;
    } else {
      user = userResult[0];
      // We don't auto-update image anymore to respect user choice
    }

    // Generate JWT
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

    // Set HttpOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 1 day in seconds
      path: '/',
    });

    return NextResponse.json({ 
        success: true,
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            role: user.role
        } 
    });
  } catch (error) {
    console.error('GOOGLE_AUTH_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
