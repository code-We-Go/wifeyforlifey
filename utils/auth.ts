import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
// import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/cookies';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function setToken(token: string) {
  const cookieStore = await cookies(); // Await cookies() to get the cookie store
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 60, // 30 minutes
  });
}

export async function removeToken() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');
  } catch (e) {
    console.error('Error in deleting token:', e);
  }
}

export async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function generateToken(payload: { id: string; username: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' });
}