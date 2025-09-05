import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";

// Connect to database
const loadDB = async () => {
  await ConnectDB();
};

loadDB();

// Bosta webhook status mapping
const BOSTA_STATUS_MAPPING: { [key: string]: string } = {
  PENDING: "pending",
  PICKED_UP: "confirmed",
  IN_TRANSIT: "shipped",
  OUT_FOR_DELIVERY: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "cancelled",
  EXCEPTION: "pending",
};

interface BostaWebhookPayload {
  _id: string;
  trackingNumber: string;
  state: string;
  type:
    | "SEND"
    | "EXCHANGE"
    | "CUSTOMER_RETURN_PICKUP"
    | "RTO"
    | "SIGN_AND_RETURN"
    | "FXF_SEND";
  cod?: string; // only in Delivered state
  timeStamp: string;
  isConfirmedDelivery: boolean;
  deliveryPromiseDate: string; // DD-MM-YYYY format
  exceptionReason?: string; // only in Exception state
  exceptionCode?: string; // only in Exception state
  businessReference: string;
  numberOfAttempts: string;
}

export async function POST(request: Request) {
  try {
    const payload: BostaWebhookPayload = await request.json();

    console.log("Received Bosta webhook:", {
      _id: payload._id,
      trackingNumber: payload.trackingNumber,
      state: payload.state,
      type: payload.type,
      businessReference: payload.businessReference,
      timeStamp: payload.timeStamp,
      isConfirmedDelivery: payload.isConfirmedDelivery,
    });

    // Validate required fields
    if (!payload.businessReference || !payload.state) {
      return NextResponse.json(
        { error: "Missing required fields: businessReference or state" },
        { status: 400 }
      );
    }

    // Map Bosta status to our order status
    const orderStatus =
      BOSTA_STATUS_MAPPING[payload.state.toUpperCase()] || "pending";

    // Find order by businessReference (which should be the order ID)
    const order = await ordersModel.findById(payload.businessReference);

    if (!order) {
      // If order not found, check subscriptions
      const subscription = await subscriptionsModel.findById(payload.businessReference);
      
      if (!subscription) {
        return NextResponse.json(
          {
            error: `Order or subscription not found for businessReference: ${payload.businessReference}`,
          },
          { status: 404 }
        );
      }
      
      // Update subscription status
      await subscriptionsModel.findByIdAndUpdate(
        payload.businessReference,
        { status: orderStatus },
        { new: true }
      );

      console.log(
        `Subscription ${payload.businessReference} updated to status: ${orderStatus}`,
        new Date().toISOString()
      );

      return NextResponse.json({
        success: true,
        message: "Subscription status updated successfully",
        subscriptionId: payload.businessReference,
        newStatus: orderStatus,
      });
    }

    // Update the order
    const updatedOrder = await ordersModel.findByIdAndUpdate(
      payload.businessReference,
      {
        status: orderStatus,
        shipmentID: payload._id,
        updatedAt: new Date(),
      },
      { new: true }
    );

    console.log(
      `Order ${payload.businessReference} updated to status: ${orderStatus}`,
      {
        trackingNumber: payload.trackingNumber,
        bostaState: payload.state,
        deliveryAttempts: payload.numberOfAttempts,
      }
    );

    // You can add additional logic here, such as:
    // - Sending email notifications to customers
    // - Updating inventory
    // - Logging delivery events
    // - Triggering other business processes

    return NextResponse.json(
      {
        success: true,
        message: "Order status updated successfully",
        orderId: payload.businessReference,
        newStatus: orderStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bosta webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle GET requests (for webhook verification if needed)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: "Bosta webhook endpoint is active" },
    { status: 200 }
  );
}
