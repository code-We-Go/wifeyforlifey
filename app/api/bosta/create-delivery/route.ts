import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";
import BostaService, { BostaAddress } from "@/app/services/bostaService";

// Connect to database
const loadDB = async () => {
  await ConnectDB();
};

loadDB();

// Default pickup and return addresses (you should configure these)
const DEFAULT_PICKUP_ADDRESS: BostaAddress = {
  city: "Cairo",
  zoneId: "NQz5sDOeG", // You'll need to get actual zone IDs from Bosta
  districtId: "aiJudRHeOt", // You'll need to get actual district IDs from Bosta
  firstLine: "Your Business Address",
  secondLine: "Near landmark",
  buildingNumber: "123",
  floor: "1",
  apartment: "1",
};

const DEFAULT_RETURN_ADDRESS: BostaAddress = {
  city: "Cairo",
  zoneId: "NQz5sDOeG",
  districtId: "aiJudRHeOt",
  firstLine: "Your Return Address",
  secondLine: "Return location",
  buildingNumber: "123",
  floor: "1",
  apartment: "1",
};

export async function POST(request: Request) {
  try {
    const { orderId, pickupAddress, returnAddress } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await ordersModel.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order already has a shipment
    if (order.shipmentID) {
      return NextResponse.json(
        { error: "Order already has a shipment", shipmentID: order.shipmentID },
        { status: 400 }
      );
    }

    // Initialize Bosta service
    const bostaService = new BostaService();

    // Create webhook URL
    const webhookUrl = `${
      process.env.baseUrl || "http://localhost:3000"
    }/api/webhooks/bosta`;

    // Create delivery payload
    const deliveryPayload = bostaService.createDeliveryPayload(
      order,
      webhookUrl
    );

    console.log("Creating Bosta delivery for order:", orderId);
    console.log("Delivery payload:", JSON.stringify(deliveryPayload, null, 2));

    // Create delivery with Bosta
    const result = await bostaService.createDelivery(deliveryPayload);

    if (!result.success) {
      console.error("Failed to create Bosta delivery:", result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Update order with shipment ID
    const updatedOrder = await ordersModel.findByIdAndUpdate(
      orderId,
      {
        shipmentID: result.data?.deliveryId,
        status: "confirmed", // Update status to confirmed when shipment is created
      },
      { new: true }
    );

    console.log("Bosta delivery created successfully:", result.data);

    return NextResponse.json(
      {
        success: true,
        message: "Delivery created successfully",
        shipmentData: result.data,
        orderId: orderId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Create delivery error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check delivery status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await ordersModel.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        orderId: order._id,
        shipmentID: order.shipmentID,
        status: order.status,
        hasShipment: !!order.shipmentID,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get delivery status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
