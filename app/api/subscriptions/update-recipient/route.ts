import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import subscriptionsModel from "@/app/modals/subscriptionsModel";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    
    const { oldRecipientEmail, newRecipientEmail } = await request.json();
    
    if (!oldRecipientEmail || !newRecipientEmail) {
      return NextResponse.json(
        { error: "Both old and new recipient emails are required" },
        { status: 400 }
      );
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(oldRecipientEmail) || !emailRegex.test(newRecipientEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Find subscription by old recipient email
    const subscription = await subscriptionsModel.findOne({ 
      giftRecipientEmail: oldRecipientEmail,
      isGift: true 
    }).populate({ path: "packageID", options: { strictPopulate: false } });
    
    if (!subscription) {
      return NextResponse.json(
        { error: "No gift subscription found with the current recipient email" },
        { status: 404 }
      );
    }

    // Check if this is a mini experience (duration = "0")
    const isMiniExperience = (subscription as any).packageID?.duration === "0";
    
    // Update both email and giftRecipientEmail for both mini and full experience
    (subscription as any).email = newRecipientEmail;
    (subscription as any).giftRecipientEmail = newRecipientEmail;
    
    if (isMiniExperience) {
      console.log("Mini experience: Updated both email and giftRecipientEmail to:", newRecipientEmail);
    } else {
      console.log("Full experience: Updated both email and giftRecipientEmail to:", newRecipientEmail);
    }
    
    await subscription.save();

    return NextResponse.json({
      success: true,
      email: newRecipientEmail,
      giftRecipientEmail: newRecipientEmail,
    });
  } catch (err: any) {
    console.error("Error updating recipient:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
