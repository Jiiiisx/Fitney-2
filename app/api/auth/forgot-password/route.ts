import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { users, passwordResetTokens } from '@/app/lib/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
      return NextResponse.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }

    const user = userResult[0];
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: token,
      expiresAt: expiresAt,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Kirim email sungguhan menggunakan Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Fitney <onboarding@resend.dev>', // Ganti dengan domain Anda jika sudah diverifikasi
        to: email,
        subject: 'Reset Your Fitney Password',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your Fitney account. Click the button below to choose a new password:</p>
            <div style="margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #FFD54F; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
            </div>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #888; font-size: 12px;">Fitney App - Your Fitness Companion</p>
          </div>
        `
      });
    }

    console.log(`Password reset link for ${email}: ${resetLink}`);

    return NextResponse.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    console.error('FORGOT_PASSWORD_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
