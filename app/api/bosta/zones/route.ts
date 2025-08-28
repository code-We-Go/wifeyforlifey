import { NextRequest, NextResponse } from 'next/server';
import bostaLocationService from '../../../services/bostaLocationService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId');
    
    if (!cityId) {
      return NextResponse.json(
        { success: false, error: 'cityId parameter is required' },
        { status: 400 }
      );
    }

    const zones = await bostaLocationService.getZones(cityId);
    return NextResponse.json({ success: true, data: zones });
  } catch (error) {
    console.error('Error fetching zones:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch zones' },
      { status: 500 }
    );
  }
}