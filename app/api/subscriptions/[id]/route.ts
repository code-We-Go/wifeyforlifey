import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import subscriptionsModel from "@/app/modals/subscriptionsModel";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ConnectDB();
    
    const { id } = await params;
    const subscriptionId = id;
    
    const subscription = await subscriptionsModel.findById(subscriptionId);
    
    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subscription);
  } catch (err: any) {
    console.error("Error fetching subscription:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
