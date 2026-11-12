import { NextResponse } from 'next/server';
import subCategoryModel from '@/app/modals/subCategoryModel';
import categoriesModel from '@/app/modals/categoriesModel';
import { ConnectDB } from '@/app/config/db';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await ConnectDB();
    console.log("registering"+categoriesModel)
    const { searchParams } = new URL(request.url);
    const homepage = searchParams.get('homepage');

    let query: any = {};
    if (homepage === 'true') {
      query.HomePage = true;
    }
    
    // Check for active param
    // const active = searchParams.get('active');
    // if (active === 'true') {
    //   query.active = true;
    // }

    let typeQuery: any = {};
    const type = searchParams.get('type');
    if (type) {
      typeQuery = type === 'product'
        ? { $or: [{ type: 'product' }] }
        : { type };
    }
    else{
      typeQuery = {
         type: 'product' 
      }
    }

    let subcategories = await subCategoryModel.find({...query, active: true})
      .populate({
        path: 'categoryID',
        match: { ...typeQuery , active: true },
      })
      .sort({ subCategoryName: 1 });

    // Remove subcategories whose category didn't match (and thus categoryID is null)
    subcategories = subcategories.filter((sub: any) => sub.categoryID !== null);
    
    console.log("subcategories length " + subcategories.length);
    

    
    const locale = searchParams.get('locale') || searchParams.get('lang') || 'en';
    
    // Map populated categoryID back to string ID for frontend compatibility and localize
    const responseData = subcategories.map((sub: any) => {
      const subObj = sub.toObject ? sub.toObject() : sub;
      if (subObj.categoryID && typeof subObj.categoryID === 'object') {
        subObj.categoryID = subObj.categoryID._id.toString();
      }
      if (locale === 'ar' && subObj.translations?.ar?.subCategoryName) {
        subObj.originalSubCategoryName = subObj.subCategoryName;
        subObj.subCategoryName = subObj.translations.ar.subCategoryName;
        if (subObj.translations.ar.description) {
          subObj.description = subObj.translations.ar.description;
        }
      }
      return subObj;
    });

    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}
