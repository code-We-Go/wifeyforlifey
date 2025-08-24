import { NextResponse } from 'next/server';
import { ConnectDB } from "@/app/config/db";
import { DiscountModel } from '@/app/modals/Discount';
import DiscountUsage from '@/app/models/discountUsage';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    // const session = await getServerSession(authOptions);
    const { cart, discountCode ,redeemType} = await req.json();

    if (!cart || !Array.isArray(cart)) {
      return NextResponse.json(
        { error: 'Invalid cart data' },
        { status: 400 }
      );
    }

    await ConnectDB();

    // Calculate cart total
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Find the discount
    const discount = await DiscountModel.findOne({
      code: discountCode,
      isActive: true,
      redeemType: { $in: [redeemType, "All"] },

    //   startDate: { $lte: new Date() },
    //   endDate: { $gte: new Date() },
    });
    if (!discount) {
      return NextResponse.json(
        { error: 'Invalid or expired discount code' },
        { status: 400 }
      );
    }

    // Check minimum cart value
    if (discount.conditions?.minimumOrderAmount && cartTotal < discount.conditions.minimumOrderAmount) {
      return NextResponse.json(
        { error: `Minimum cart value of ${discount.conditions.minimumOrderAmount} required` },
        { status: 400 }
      );
    }

    // Check usage limit
    if (discount.conditions?.usageLimit && discount.usageCount >= discount.conditions.usageLimit) {
      return NextResponse.json(
        { error: 'Discount usage limit reached' },
        { status: 400 }
      );
    }

    // Check first-time user condition
    // if (discount.firstTimeUserOnly && session?.user) {
    //   const previousUsage = await DiscountUsage.findOne({ userId: session.user.id });
    //   if (previousUsage) {
    //     return NextResponse.json(
    //       { error: 'This discount is only available for first-time users' },
    //       { status: 400 }
    //     );
    //   }
    // }

    // Calculate discount amount
    let discountAmount = 0;
    switch (discount.calculationType) {
      case 'PERCENTAGE':
        if(discount.value){

          discountAmount = (cartTotal * discount.value) / 100;
        }
        // if (discount.maxDiscountAmount) {
        //   discountAmount = Math.min(discountAmount, discount.maxDiscountAmount);
        // }
        break;
      case 'FIXED_AMOUNT':

        discountAmount = discount.value ? discount.value : 0;
        break;
      case 'FREE_SHIPPING':
        // For free shipping, we set the value to 0 since it's a special case
        discountAmount = 0;
        discount.value = 0; // Ensure the value is set to 0 for free shipping
        break;
      // case 'BUY_X_GET_Y':
      //   // Implement buy X get Y logic based on your requirements
      //   discountAmount = 0; // Replace with actual calculation
      //   break;
    }

    const finalTotal = cartTotal - discountAmount;

    // Update discount usage
    // await DiscountModel.findByIdAndUpdate(discount._id, {
    //   $inc: { usageCount: 1 }
    // });
    return NextResponse.json({
      success: true,
      discount: {
        _id:discount._id,
        code: discount.code,
        calculationType: discount.calculationType,
        value: discount.value,
        description: discount.calculationType === 'FREE_SHIPPING' ? 'Free Shipping' : undefined
      },
      cartTotal,
      finalTotal,
    });
  } catch (error) {
    console.error('Error applying discount:', error);
    return NextResponse.json(
      { error: 'Failed to apply discount' },
      { status: 500 }
    );
  }
}