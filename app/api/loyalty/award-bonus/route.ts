import { NextRequest, NextResponse } from "next/server";
import { LoyaltyTransactionModel } from "@/app/modals/loyaltyTransactionModel";
import { ConnectDB } from "@/app/config/db";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await ConnectDB();

    const { email, bonusType } = await req.json();
    console.log(bonusType + "bonusType");
    if (!email || !bonusType) {
      return NextResponse.json(
        { error: "Email and bonusType are required" },
        { status: 400 }
      );
    }

    // ...existing code...

    // Check if user already has this bonus
    let reason;
    if (bonusType === "birthday") reason = "birthday";
    else if (bonusType === "wedding") reason = "wedding day";
    else if (bonusType === "firstname") reason = "first name";
    else if (bonusType === "lastname") reason = "last name";
    else reason = undefined;

    if (!reason) {
      return NextResponse.json(
        { error: "Invalid bonus type" },
        { status: 400 }
      );
    }

    const existingTransaction = await LoyaltyTransactionModel.findOne({
      email,
      reason,
    });

    if (existingTransaction) {
      return NextResponse.json({
        success: false,
        message: "Bonus already awarded for this event",
      });
    }

    // Define bonus IDs and amounts
    const bonusConfig = {
      birthday: {
        bonusID: new mongoose.Types.ObjectId("688a9abe251412e3502a832e"),
        reason: "birthday",
        amount: 50,
      },
      wedding: {
        bonusID: new mongoose.Types.ObjectId("68846cdd8caf791c78a876b9"),
        reason: "wedding day",
        amount: 50,
      },
      firstname: {
        bonusID: new mongoose.Types.ObjectId("689524dda20c600633716397"),
        reason: "first name",
        amount: 50,
      },
      lastname: {
        bonusID: new mongoose.Types.ObjectId("689524efa20c60063371639a"),
        reason: "last name",
        amount: 50,
      },
    };

    const config = bonusConfig[bonusType as keyof typeof bonusConfig];

    if (!config) {
      return NextResponse.json(
        { error: "Invalid bonus type" },
        { status: 400 }
      );
    }

    // Create loyalty transaction
    const transaction = new LoyaltyTransactionModel({
      email,
      type: "earn",
      reason: config.reason,
      amount: config.amount,
      bonusID: config.bonusID,
      timestamp: new Date(),
    });

    await transaction.save();

    return NextResponse.json({
      success: true,
      message: `Congratulations! You've earned ${config.amount} loyalty points for adding your ${config.reason}!`,
      points: config.amount,
    });
  } catch (error) {
    console.error("Error awarding loyalty bonus:", error);
    return NextResponse.json(
      {
        error: "Failed to award loyalty bonus",
      },
      { status: 500 }
    );
  }
}
