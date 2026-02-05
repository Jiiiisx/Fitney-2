import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { users, passwordResetTokens } from '@/app/lib/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { authRateLimit } from "@/app/lib/ratelimit"; // Import authRateLimit

// Konfigurasi Transporter Gmail yang lebih stabil
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success, limit, reset, remaining } = await authRateLimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
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
    const { email, turnstileToken } = body; // Get turnstileToken from body

    // 2. Cloudflare Turnstile Verification
    if (process.env.NODE_ENV === 'production') { // Only verify in production
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

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const userResult = await db
      .select({ id: users.id, email: users.email })
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

    // Kirim email menggunakan Gmail (Nodemailer)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        await transporter.sendMail({
          from: `"Fitney Support" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: 'Reset Your Fitney Password',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
              <div style="background-color: #FFD54F; padding: 20px; text-align: center;">
                <h1 style="margin: 0; color: #333;">Fitney</h1>
              </div>
              <div style="padding: 30px;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p style="color: #555; line-height: 1.6;">Hello,</p>
                <p style="color: #555; line-height: 1.6;">We received a request to reset your password for your Fitney account. Click the button below to choose a new password:</p>
                <div style="margin: 40px 0; text-align: center;">
                  <a href="${resetLink}" style="background-color: #FFD54F; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
                </div>
                <p style="color: #555; line-height: 1.6;">This link will expire in <strong>1 hour</strong>.</p>
                <p style="color: #555; line-height: 1.6;">If you didn't request this, you can safely ignore this email.</p>
              </div>
              <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 12px;">
                <p>Fitney App - Your Fitness Companion</p>
                <p>© 2026 Fitney Project</p>
              </div>
            </div>
          `
        });
        console.log(`✅ Email sent successfully to ${email}`);
      } catch (mailError) {
        console.error('❌ GMAIL_SEND_ERROR:', mailError);
      }
    } else {
      console.error('❌ GMAIL_USER or GMAIL_APP_PASSWORD is not set in environment variables');
    }

    console.log(`Password reset link for ${email}: ${resetLink}`);

    return NextResponse.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    console.error('FORGOT_PASSWORD_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
