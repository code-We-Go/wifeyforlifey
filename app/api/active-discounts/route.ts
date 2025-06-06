import { NextResponse } from 'next/server';
import { ConnectDB } from "@/app/config/db";
import discount from '@/app/models/discount';

export async function GET(req: Request) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(req.url);
    const cartTotal = parseFloat(searchParams.get('cartTotal') || '0');

    // Find all active automatic discounts
    const activeDiscounts = await discount.find({
      isActive: true,
      applicationType: "AUTOMATIC",
    //   startDate: { $lte: new Date() },
    //   endDate: { $gte: new Date() },
      $or: [
        { minCartValue: { $exists: false } },
        { minCartValue: { $lte: cartTotal } }
      ]
    }).select('-__v');
    console.log("activeDiscounts: "+activeDiscounts +activeDiscounts.length);
    return NextResponse.json({
      success: true,
      discounts: activeDiscounts,
    });
  } catch (error) {
    console.error('Error fetching active discounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active discounts' },
      { status: 500 }
    );
  }
} 