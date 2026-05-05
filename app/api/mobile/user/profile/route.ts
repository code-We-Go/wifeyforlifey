import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/mobileAuth";
import { ConnectDB } from "@/app/config/db";
import UserModel, { PACKAGE_IDS } from "@/app/modals/userModel";
import ordersModel from "@/app/modals/ordersModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import { LoyaltyTransactionModel } from "@/app/modals/loyaltyTransactionModel";
import packageModel from "@/app/modals/packageModel";
import mongoose from "mongoose";
import playlistModel from "@/app/modals/playlistModel";

export async function GET(request: NextRequest) {
  
  try {
    await ConnectDB();

    // 1. Authenticate Request
    const auth = await authenticateRequest(request);
    
    // We can still use userID from query as a fallback or for admin purposes, 
    // but primary source for mobile is the token
    const { searchParams } = new URL(request.url);
    const queryUserID = searchParams.get("userID");
    
    let user = auth.user;

    // If not authenticated via token and no query ID, return error
    if (!user && !queryUserID) {
      return NextResponse.json(
        { error: "Authentication required or userID parameter missing" },
        { status: 401 }
      );
    }

    // Determine the user ID to fetch (prioritize queryUserID if provided)
    const targetUserID = queryUserID || user?._id;

    if (!mongoose.Types.ObjectId.isValid(targetUserID)) {
      return NextResponse.json(
        { error: "Invalid userID format" },
        { status: 400 }
      );
    }

    // Always (re)fetch the user with specific population selection to ensure 
    // only the 'important features' are returned.
    user = await UserModel.findById(targetUserID).populate({
      path: "subscriptions",
      select: "subscribed expiryDate allowedPlaylists miniSubscriptionActivated packageID",
      populate: [
        {
          path: "packageID",
          model: "packages",
          select: "name packagePlaylists accessAllPlaylists packageInspos accessAllInspos packagePartners accessAllPartners",
        },
        {
          path: "allowedPlaylists.playlistID",
          model: "playlists",
          select: "name",
        }
      ]
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

    // 4. Construct Response
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
      loyaltyPoints: loyaltyPoints,
      weddingDate: user.weddingDate,
      birthDate: user.birthDate,
      isSubscribed: user.isSubscribed,
      subscriptions: user.subscriptions,
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
