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

    let orderData = order.toObject ? order.toObject() : { ...order };
    if (!orderData.sessionType && orderData.sessionId) {
      try {
        const PartnerSessionModel = (
          await import("@/app/modals/partnerSessionModel")
        ).default;
        const s = await PartnerSessionModel.findById(orderData.sessionId).select("sessionType");
        if (s && s.sessionType) {
          orderData.sessionType = s.sessionType;
        }
      } catch {}
    }

    return NextResponse.json({ order: orderData });
  } catch (error) {
    console.error("Failed to fetch partner order", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

