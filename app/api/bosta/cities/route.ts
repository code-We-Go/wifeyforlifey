import { NextRequest, NextResponse } from 'next/server';
import bostaLocationService from '../../../services/bostaLocationService';

export async function GET() {
  try {
    const cities = await bostaLocationService.getCities();
    return NextResponse.json({ success: true, data: cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}