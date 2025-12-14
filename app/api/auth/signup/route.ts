import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { users } from '@/app/lib/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { username, email, password, fullName } = await req.json();

    if ( !username || !email || !password ) {
      return NextResponse.json({ error: 'Missing username, email, password' }, { status: 400 } );
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
          return NextResponse.json({ error : ' User with this email already exists'}, { status: 409 });
        }
        if (existingUsers.some(user => user.username === username))
          return NextResponse.json({ error: 'username is already taken'}, { status: 409 });
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

        return NextResponse.json(newUserResult[0]);
    } catch (error) {
      console.error('SIGNUP_ERROR', error);
      if (error instanceof Error && (error.message.includes('duplicate key') || error.message.includes('unique constraint'))) {
        return NextResponse.json({ error: 'An account with that username or email already exists.' }, {status: 409});
      }
      return NextResponse.json({ error: ' Internal Server Error'}, {status: 500});
    }
}