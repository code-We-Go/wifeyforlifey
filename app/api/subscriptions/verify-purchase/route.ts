import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import subscriptionsModel from "@/app/modals/subscriptionsModel";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    
    const { purchaseEmail } = await request.json();
    
    if (!purchaseEmail) {
      return NextResponse.json(
        { error: "Purchase email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(purchaseEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Find subscription by email
    const subscription = await subscriptionsModel.findOne({ 
      email: purchaseEmail,
      subscribed: true 
    });
    
    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found with this email" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (err: any) {
    console.error("Error verifying purchase:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
