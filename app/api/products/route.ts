import { NextResponse } from 'next/server';
import productsModel from '@/app/modals/productsModel';
import { ConnectDB } from '@/app/config/db';
import mongoose from 'mongoose';

const loadDB = async () => {
  await ConnectDB();
};

loadDB();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy');
    const search = searchParams.get('search');

    let query: any = {};

    // Apply category filter (through subcategory)
    if (category) {
      // First find all subcategories that belong to this category
      const subcategories = await mongoose.model('subCategories').find({
        categoryID: new mongoose.Types.ObjectId(category)
      });
      
      // Then find products that have any of these subcategories
      query.subCategoryID = {
        $in: subcategories.map(sub => sub._id)
      };
    }

    // Apply subcategory filter
    if (subcategory) {
      query.subCategoryID = new mongoose.Types.ObjectId(subcategory);
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      query['price.local'] = {};
      if (minPrice) query['price.local'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.local'].$lte = parseFloat(maxPrice);
    }

    // Apply search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sort: any = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { 'price.local': 1 };
        break;
      case 'price_desc':
        sort = { 'price.local': -1 };
        break;
      case 'popular':
        sort = { ratings: -1 };
        break;
      default:
        sort = { createdAt: -1 }; // Default to newest
    }

    const products = await productsModel
      .find(query)
      .populate({
        path: 'subCategoryID',
        populate: {
          path: 'categoryID',
          model: 'categories'
        }
      })
      .sort(sort);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}