import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import UserModel from "@/app/modals/userModel";
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
    // 1. Fetch User
    const user = await UserModel.findById(userID).populate({
      path: "subscription",
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

    // 4. Extract Subscription Details
    let packageName = null;
    let expiryDate = null;
    let isSubscribed = user.isSubscribed;

    if (user.subscription && isSubscribed) {
      // user.subscription is populated
      const sub = user.subscription as any; // Type assertion since we populated it
      expiryDate = sub.expiryDate;

      if (sub.packageID) {
        packageName = sub.packageID.name;
      }
    }

    // 5. Construct Response
    const responseData = {
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
