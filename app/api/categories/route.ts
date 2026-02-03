import { NextResponse } from 'next/server';
import categoriesModel from '@/app/modals/categoriesModel';
import subCategoryModel from '@/app/modals/subCategoryModel';
import { ConnectDB } from '@/app/config/db';

export async function GET() {
  try {
    // Connect to database with proper error handling
    await ConnectDB();

    // Fetch categories
    const categories = await categoriesModel.find().sort({ categoryName: 1 });

    // Fetch subcategories for each category
    const categoriesWithSubcategories = await Promise.all(
      categories.map(async (category: any) => {
        const subcategories = await subCategoryModel
          .find({ categoryID: category._id })
          .sort({ subCategoryName: 1 });

        console.log(`Category: ${category.categoryName}, Subcategories found: ${subcategories.length}`);

        return {
          _id: category._id,
          name: category.categoryName,
          description: category.description,
          image: category.image,
          subcategories: subcategories.map((sub: any) => ({
            _id: sub._id,
            name: sub.subCategoryName,
            description: sub.description,
            image: sub.image,
            categoryID: sub.categoryID
          }))
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