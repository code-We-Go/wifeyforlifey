import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import UserModel from "@/app/modals/userModel";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();

    const body = await request.json();
    const { userID, pushToken, tags } = body;

    if (!userID || !pushToken) {
      return NextResponse.json(
        { error: "userID and pushToken parameters are required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return NextResponse.json(
        { error: "Invalid userID format" },
        { status: 400 }
      );
    }

    const updateData: any = { pushToken: pushToken };
    if (tags && Array.isArray(tags)) {
      updateData.tags = tags;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userID,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Push token updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating push token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
