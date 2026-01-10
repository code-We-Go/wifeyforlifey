import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import { LoyaltyTransactionModel } from "@/app/modals/loyaltyTransactionModel";
import UserModel from "@/app/modals/userModel";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const userID = searchParams.get("userID");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

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

    // Get user email to find transactions
    const user = await UserModel.findById(userID);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const skip = (page - 1) * limit;

    // Fetch transactions
    const transactions = await LoyaltyTransactionModel
      .find({ email: user.email })
      .sort({ timestamp: -1, createdAt: -1 }) // Sort by timestamp descending
      .skip(skip)
      .limit(limit)
      .populate("bonusID", "title description"); // Populate bonus details if available

    const totalTransactions = await LoyaltyTransactionModel.countDocuments({ email: user.email });

    // Calculate current balance (optional, but nice to have in list view context too)
    // We already have this in profile, but maybe good for verification.
    // I'll skip calculating balance here to keep it fast, just returning history.

    return NextResponse.json({
      transactions,
      pagination: {
        total: totalTransactions,
        page,
        limit,
        pages: Math.ceil(totalTransactions / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching loyalty transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
