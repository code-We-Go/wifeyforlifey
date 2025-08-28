import { NextRequest, NextResponse } from 'next/server';
import bostaLocationService from '../../../services/bostaLocationService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId');
    const zoneId = searchParams.get('zoneId');
    
    if (!cityId) {
      return NextResponse.json(
        { success: false, error: 'cityId parameter is required' },
        { status: 400 }
      );
    }

    let districts;
    if (zoneId) {
      districts = await bostaLocationService.getDistrictsByZone(cityId, zoneId);
    } else {
      districts = await bostaLocationService.getDistricts(cityId);
    }
    
    return NextResponse.json({ success: true, data: districts });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}