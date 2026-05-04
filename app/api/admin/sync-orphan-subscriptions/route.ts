import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import UserModel, { PACKAGE_IDS } from "@/app/modals/userModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import mongoose from "mongoose";

/**
 * Sync Script: Finds active subscriptions that are not linked in the user's 'subscriptions' array.
 * This ensures all paid content is correctly attached to the user accounts.
 */
export async function GET() {
  try {
    await ConnectDB();

    const now = new Date();

    // 1. Find all active and paid subscriptions
    // We include Mini package (no expiry check) or non-expired packages
    const activeSubscriptions = await subscriptionsModel.find({
      subscribed: true,
      $or: [
        { expiryDate: { $gt: now } },
        { packageID: PACKAGE_IDS.MINI }
      ]
    });

    console.log(`Found ${activeSubscriptions.length} active subscriptions to check.`);

    let syncedCount = 0;
    const details = [];

    for (const sub of activeSubscriptions) {
      // Find potential owners (primary email or gift recipient)
      const emailsToCheck = [sub.email, sub.giftRecipientEmail].filter(Boolean);
      
      if (emailsToCheck.length === 0) continue;

      // Find user(s) associated with these emails
      const users = await UserModel.find({ 
        email: { $in: emailsToCheck } 
      });

      for (const user of users) {
        // Check if this subscription ID is already in the user's array
        const hasSub = user.subscriptions?.some(
          (id: any) => id.toString() === sub._id.toString()
        );

        if (!hasSub) {
          // Sync it!
          await UserModel.updateOne(
            { _id: user._id },
            { $addToSet: { subscriptions: sub._id } }
          );
          
          syncedCount++;
          details.push({
            userEmail: user.email,
            subscriptionId: sub._id,
            package: sub.packageName || "Unknown"
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed.`,
      checkedSubscriptions: activeSubscriptions.length,
      newlyLinked: syncedCount,
      details: details.length > 20 ? "Too many to show" : details
    });

  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "An error occurred during sync."
    }, { status: 500 });
  }
}
