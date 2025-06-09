import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { Router } from 'next/router';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function setToken(token: string) {
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 60, // 30 minutes
  });
}

export function removeToken() {
  try{
    cookies().delete('token');
  }
  catch(e){
    console.log("erorr in deleting token" + e)
  }

}

export function getToken() {
  return cookies().get('token')?.value;
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