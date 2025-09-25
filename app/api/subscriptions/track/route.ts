import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { ConnectDB } from "@/app/config/db";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import { ISubscription } from "@/app/interfaces/interfaces";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get("subscriptionId");
    const email = searchParams.get("email");

    if (!subscriptionId && !email) {
      return NextResponse.json(
        { message: "Subscription ID or email is required" },
        { status: 400 }
      );
    }

    await ConnectDB();

    let subscription: ISubscription | null = null;

    // Try to find by MongoDB ObjectId first if subscriptionId is provided
    if (subscriptionId) {
      try {
        if (ObjectId.isValid(subscriptionId)) {
          subscription = await subscriptionsModel.findOne({ _id: new ObjectId(subscriptionId) });
        }

        // If not found by ObjectId, try by shipmentID
        if (!subscription) {
          subscription = await subscriptionsModel.findOne({ shipmentID: subscriptionId });
        }
      } catch (error) {
        console.error("Error finding by ID:", error);
      }
    }

    // If not found by ID or shipmentID, try by email
    if (!subscription && email) {
      subscription = await subscriptionsModel.findOne({ 
        $or: [
          { email: email },
          { giftRecipientEmail: email }
        ]
      }).sort({ createdAt: -1 }); // Get the most recent subscription for this email
    }

    if (!subscription) {
      return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { message: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}