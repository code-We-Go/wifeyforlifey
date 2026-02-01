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

    const subcategories = await subCategoryModel.find(query);
console.log("subcategories length "+ subcategories.length)
    return NextResponse.json({ data: subcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}
