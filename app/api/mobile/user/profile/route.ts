import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import UserModel, { PACKAGE_IDS } from "@/app/modals/userModel";
import ordersModel from "@/app/modals/ordersModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import { LoyaltyTransactionModel } from "@/app/modals/loyaltyTransactionModel";
import packageModel from "@/app/modals/packageModel";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const userID = searchParams.get("userID");

    if (!userID) {
      return NextResponse.json(
        { error: "userID parameter is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return NextResponse.json(
        { error: "Invalid userID format" },
        { status: 400 }
      );
    }
    console.log(packageModel + "registerd");
    // 1. Fetch User with all subscriptions populated
    const user = await UserModel.findById(userID).populate({
      path: "subscriptions",
      populate: {
        path: "packageID",
        model: "packages",
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const email = user.email;

    // 2. Count Orders
    const ordersCount = await ordersModel.countDocuments({ email: email });

    // 3. Calculate Loyalty Points using Aggregation
    const loyaltyStats = await LoyaltyTransactionModel.aggregate([
      { $match: { email: email } },
      {
        $group: {
          _id: null,
          totalEarned: {
            $sum: {
              $cond: [{ $eq: ["$type", "earn"] }, "$amount", 0],
            },
          },
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ["$type", "spend"] }, "$amount", 0],
            },
          },
        },
      },
    ]);

    const loyaltyPoints =
      loyaltyStats.length > 0
        ? (loyaltyStats[0].totalEarned || 0) - (loyaltyStats[0].totalSpent || 0)
        : 0;

    // 4. Extract Subscription Details from the subscriptions array
    let packageName = null;
    let expiryDate = null;
    let isSubscribed = user.isSubscribed;

    // Find the active main subscription (Full Experience or Mini — non-bestie)
    const now = new Date();
    const activeSubs = ((user.subscriptions as any[]) || []).filter(
      (s: any) => s.subscribed && s.expiryDate && new Date(s.expiryDate) > now
    );

    // Main subscription: any active sub that is NOT the Wedding Planning Bestie package
    const mainSub = activeSubs.find(
      (s: any) =>
        s.packageID?._id?.toString() !== PACKAGE_IDS.WEDDING_PLANNING_BESTIE
    );

    if (mainSub && isSubscribed) {
      expiryDate = mainSub.expiryDate;
      if (mainSub.packageID) {
        packageName = mainSub.packageID.name;
      }
    }

    // Wedding Planning Bestie subscription (separate package)
    const bestieSub = activeSubs.find(
      (s: any) =>
        s.packageID?._id?.toString() === PACKAGE_IDS.WEDDING_PLANNING_BESTIE
    );

    // 5. Construct Response
    const responseData: any = {
      name:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      imageURL: user.imageURL,
      numberOfOrders: ordersCount,
      isSubscribed: isSubscribed,
      packageName: packageName,
      expiryDate: expiryDate,
      loyaltyPoints: loyaltyPoints,
      weddingDate: user.weddingDate,
      birthDate: user.birthDate,
      // Wedding Planning Bestie data (null if not subscribed to this package)
      weddingPlanningBestie: bestieSub
        ? {
            expiryDate: bestieSub.expiryDate,
            packageName: bestieSub.packageID?.name || null,
          }
        : null,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching mobile user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
