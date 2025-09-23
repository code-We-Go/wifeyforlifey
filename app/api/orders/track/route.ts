import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";
import { IOrder } from "@/app/interfaces/interfaces";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    await ConnectDB();

    // Try to find by MongoDB ObjectId first
    let order: IOrder | null = null;
    try {
      if (ObjectId.isValid(orderId)) {
        order = await ordersModel.findOne({ _id: new ObjectId(orderId) });
      }
    } catch (error) {
      console.error("Error finding by ObjectId:", error);
    }

    // If not found by ObjectId, try by orderID
    if (!order) {
      order = await ordersModel.findOne({ orderID: orderId });
    }

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Failed to fetch order status" },
      { status: 500 }
    );
  }
}
