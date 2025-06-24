import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/authOptions';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session) {
      // NextAuth will handle the session cleanup
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 