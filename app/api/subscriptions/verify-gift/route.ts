import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import subscriptionsModel from "@/app/modals/subscriptionsModel";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    
    const { giftSenderEmail } = await request.json();
    
    if (!giftSenderEmail) {
      return NextResponse.json(
        { error: "Gift sender email is required" },
        { status: 400 }
      );
    }
console.log(giftSenderEmail)
    const subscription = await subscriptionsModel.findOne({ email: giftSenderEmail });
    console.log("SubscriptionCheck:", subscription);
    
    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Verify that this is a gift subscription
    if (!(subscription as any).isGift) {
      return NextResponse.json(
        { error: "This is not a gift subscription" },
        { status: 400 }
      );
    }

    // Verify the gift sender email matches the subscription email
    if ((subscription as any).email?.toLowerCase() !== giftSenderEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Gift sender email does not match" },
        { status: 403 }
      );
    }

    // Check if subscription has already been activated
    if ((subscription as any).miniSubscriptionActivated === true) {
      return NextResponse.json(
        { error: "This subscription has already been activated" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: subscription,
      giftRecipientEmail: (subscription as any).giftRecipientEmail,
    });
  } catch (err: any) {
    console.error("Error verifying gift:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
