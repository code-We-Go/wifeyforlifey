import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import PartnerSessionOrderModel from "@/app/modals/partnerSessionOrderModel";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await ConnectDB();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    let order = null;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await PartnerSessionOrderModel.findById(orderId);
    }
    if (!order) {
      order = await PartnerSessionOrderModel.findOne({ paymentID: String(orderId) });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Failed to fetch partner order", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

