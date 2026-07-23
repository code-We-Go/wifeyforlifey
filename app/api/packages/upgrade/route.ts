import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import packageModel from "@/app/modals/packageModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import UserModel from "@/app/modals/userModel";
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

    // Fetch target package first
    const targetPackage = await packageModel.findById(targetPackageId);
    if (!targetPackage) {
      return NextResponse.json({ error: "Target package not found" }, { status: 404 });
    }

    // Get user subscriptions from UserModel populated with packageID details
    const userDoc = await UserModel.findOne({ email: user.email }).populate({
      path: "subscriptions",
      populate: { path: "packageID" },
    });

    const activeSubscriptions =
      userDoc?.subscriptions?.filter((sub: any) => sub.subscribed) || [];

    if (!activeSubscriptions || activeSubscriptions.length === 0) {
      return NextResponse.json({ error: "No active subscription found to upgrade from" }, { status: 400 });
    }

    // Match subscription whose package belongs to the same family via slug or partOf
    let currentSubscription = activeSubscriptions.find((sub: any) => {
      const currentPkg = sub.packageID;
      if (!currentPkg) return false;

      if (targetPackage.slug && currentPkg.slug && targetPackage.slug === currentPkg.slug) return true;
      if (targetPackage.partOf && currentPkg.partOf && targetPackage.partOf === currentPkg.partOf) return true;
      if (targetPackage.slug && currentPkg.partOf && targetPackage.slug === currentPkg.partOf) return true;
      if (targetPackage.partOf && currentPkg.slug && targetPackage.partOf === currentPkg.slug) return true;
      return false;
    });

    // Fallback if no specific slug/partOf match was found
    if (!currentSubscription) {
      currentSubscription = activeSubscriptions[0];
    }

    const currentPackage = currentSubscription.packageID;
    if (!currentPackage) {
      return NextResponse.json({ error: "Current package details not found" }, { status: 404 });
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
