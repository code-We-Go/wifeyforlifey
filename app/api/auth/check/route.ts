import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/authOptions';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ isAuth: false, user: null }, { status: 401 });
    }
    
    return NextResponse.json({ isAuth: true, user: session.user });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ isAuth: false, user: null }, { status: 500 });
  }
} 