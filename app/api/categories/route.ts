import { NextResponse } from 'next/server';
import categoriesModel from '@/app/modals/categoriesModel';
import subCategoryModel from '@/app/modals/subCategoryModel';
import { ConnectDB } from '@/app/config/db';

export async function GET(request: Request) {
  try {
    // Connect to database with proper error handling
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const locale = searchParams.get('locale') || searchParams.get('lang') || 'en';

    let query: any = { active: true };
    if (type) {
      if (type === 'product') {
        query.$or = [{ type: 'product' }, { type: { $exists: false } }, { type: null }];
        
      } 
      else {
        query.type = type;
      }
    }
    
    else {
      query.$or = [{ type: 'product' }, { type: { $exists: false } }, { type: null }];
    }
    // Fetch only active categories
    const categories = await categoriesModel.find(query).sort({ categoryName: 1 });

    // Fetch subcategories for each category
    const categoriesWithSubcategories = await Promise.all(
      categories.map(async (category: any) => {
        const subcategories = await subCategoryModel
          .find({ categoryID: category._id, active: true })
          .sort({ subCategoryName: 1 });

        console.log(`Category: ${category.categoryName}, Subcategories found: ${subcategories.length}`);

        const catName = locale === 'ar' && category.translations?.ar?.categoryName
          ? category.translations.ar.categoryName
          : category.categoryName;
        const catDesc = locale === 'ar' && category.translations?.ar?.description
          ? category.translations.ar.description
          : category.description;

        return {
          _id: category._id,
          name: catName,
          categoryName: catName,
          originalName: category.categoryName,
          description: catDesc,
          image: category.image,
          translations: category.translations,
          subcategories: subcategories.map((sub: any) => {
            const subName = locale === 'ar' && sub.translations?.ar?.subCategoryName
              ? sub.translations.ar.subCategoryName
              : sub.subCategoryName;
            const subDesc = locale === 'ar' && sub.translations?.ar?.description
              ? sub.translations.ar.description
              : sub.description;

            return {
              _id: sub._id,
              name: subName,
              subCategoryName: subName,
              originalName: sub.subCategoryName,
              description: subDesc,
              image: sub.image,
              categoryID: sub.categoryID,
              translations: sub.translations
            };
          })
        };
      })
    );

    console.log('Total categories with subcategories:', categoriesWithSubcategories.length);
    return NextResponse.json(categoriesWithSubcategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Database connection timeout. Please try again.' },
          { status: 503 }
        );
      }
      if (error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Database authentication failed. Check credentials.' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}