import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { users, passwordResetTokens } from '@/app/lib/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      // For security reasons, don't reveal if the user exists or not
      return NextResponse.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }

    const user = userResult[0];
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Delete any existing reset tokens for this user
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

    // Insert new token
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: token,
      expiresAt: expiresAt,
    });

    // Generate reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // TODO: Send email with resetLink
    console.log(`Password reset link for ${email}: ${resetLink}`);

    return NextResponse.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    console.error('FORGOT_PASSWORD_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
