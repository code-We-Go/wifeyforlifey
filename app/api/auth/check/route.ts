import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const { isAuth, user } = await isAuthenticated();
    
    if (!isAuth) {
      return NextResponse.json({ isAuth: false, user: null }, { status: 401 });
    }
    
    return NextResponse.json({ isAuth: true, user });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ isAuth: false, user: null }, { status: 500 });
  }
} 