import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/mobileAuth';

export async function GET(request: NextRequest) {
  try {
    const { isAuthenticated, user } = await authenticateRequest(request);
    
    if (!isAuthenticated || !user) {
      return NextResponse.json({ isAuth: false, user: null }, { status: 401 });
    }
    
    return NextResponse.json({ isAuth: true, user: user });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ isAuth: false, user: null }, { status: 500 });
  }
} 
