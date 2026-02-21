import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";
import subscriptionPaymentModel from "@/app/modals/subscriptionPaymentModel";

export async function GET() {
  await ConnectDB();

  const now = new Date();

  const result = await subscriptionPaymentModel.updateMany(
    {
      status: "pending",
      expiresAt: { $lt: now },
    },
    {
      $set: { paymentStatus: "failed" },
    }
  );

  return NextResponse.json({
    updated: result.modifiedCount,
  });
}