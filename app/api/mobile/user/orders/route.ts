import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";
import UserModel from "@/app/modals/userModel";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const userID = searchParams.get("userID");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

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

    // Get user email to find orders
    const user = await UserModel.findById(userID);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const skip = (page - 1) * limit;

    // Fetch orders
    const orders = await ordersModel
      .find({ email: user.email })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("orderID total currency status payment createdAt cart isMob shipmentID");

    const totalOrders = await ordersModel.countDocuments({ email: user.email });

    return NextResponse.json({
      orders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        pages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
