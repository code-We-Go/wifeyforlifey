import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import packageModel from "@/app/modals/packageModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import { authenticateRequest } from "@/app/lib/mobileAuth";

export async function GET(req: Request) {
  try {
    await ConnectDB();
    const { searchParams } = new URL(req.url);
    const targetPackageId = searchParams.get("targetPackageId");

    if (!targetPackageId) {
      return NextResponse.json({ error: "targetPackageId is required" }, { status: 400 });
    }

    const { user, isAuthenticated } = await authenticateRequest(req);
    if (!isAuthenticated || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current subscription
    const currentSubscription = await subscriptionsModel.findOne({
      email: user.email,
      subscribed: true,
    });

    if (!currentSubscription) {
      return NextResponse.json({ error: "No active subscription found to upgrade from" }, { status: 400 });
    }

    const currentPackage = await packageModel.findById(currentSubscription.packageID);
    const targetPackage = await packageModel.findById(targetPackageId);

    if (!currentPackage || !targetPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const currentPrice = currentPackage.price || 0;
    const targetPrice = targetPackage.price || 0;
    
    let difference = targetPrice - currentPrice;
    if (difference < 0) difference = 0; // Avoid negative prices if downgrade

    return NextResponse.json({ 
      success: true, 
      difference, 
      currentPackage: currentPackage.name, 
      targetPackage: targetPackage.name 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error calculating upgrade difference:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
