import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { users, passwordResetTokens } from '@/app/lib/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    // Find the token and ensure it's not expired
    const tokenResult = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (tokenResult.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const resetToken = tokenResult[0];

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await db
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.id, resetToken.userId));

    // Delete the token
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, resetToken.id));

    return NextResponse.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('RESET_PASSWORD_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
