import { NextResponse } from 'next/server';
import subCategoryModel from '@/app/modals/subCategoryModel';
import { ConnectDB } from '@/app/config/db';

export async function GET(request: Request) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const homepage = searchParams.get('homepage');

    let query: any = {};
    if (homepage === 'true') {
      query.HomePage = true;
    }
    
    // Check for active param
    const active = searchParams.get('active');
    if (active === 'true') {
      query.active = true;
    }

    const subcategories = await subCategoryModel.find(query).sort({ subCategoryName: 1 });
    console.log("subcategories length " + subcategories.length);
    
    // Return array directly to simplify frontend usage if requested, or keep { data } wrapper?
    // The previous implementation returned { data: subcategories }. 
    // I will return it as is but be mindful in frontend.
    return NextResponse.json({ data: subcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}
