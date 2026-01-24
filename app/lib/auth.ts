import { jwtVerify, JWTPayload } from 'jose';
import { NextRequest } from 'next/server';

// Ensure JWT_SECRET is set
const secretString = process.env.JWT_SECRET;
if (!secretString) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const secret = new TextEncoder().encode(secretString);

export interface UserPayload extends JWTPayload {
  userId: string;
  email: string;
}

export async function getUserFromToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    // The 'sub' claim from JWT is conventionally the user ID.
    if (!payload.sub) {
      return null;
    }
    const user: UserPayload = {
      ...payload,
      userId: payload.sub,
      email: payload.email as string,
    };
    return user;
  } catch (err) {
    // Token is invalid, expired, etc.
    return null;
  }
}

export async function verifyAuth(req: NextRequest): Promise<{ user: UserPayload; error: null } | { user: null; error: Response }> {
  let token = req.cookies.get('token')?.value;

  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return { user: null, error: new Response(JSON.stringify({ error: 'Unauthorized: No token provided' }), { status: 401 }) };
  }

  const user = await getUserFromToken(token);

  if (!user) {
    return { user: null, error: new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), { status: 401 }) };
  }

  return { user, error: null };
}
