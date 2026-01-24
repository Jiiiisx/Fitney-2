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
  role: string;
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
      role: (payload.role as string) || 'user',
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

export async function verifyAdmin(req: NextRequest): Promise<{ user: UserPayload; error: null } | { user: null; error: Response }> {
  const auth = await verifyAuth(req);
  if (auth.error) return auth;

  if (auth.user.role !== 'admin') {
    return { 
      user: null, 
      error: new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403 }) 
    };
  }

  return auth;
}
