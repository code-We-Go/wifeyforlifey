import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";
import subscriptionPaymentModel from "@/app/modals/subscriptionPaymentModel";

export async function GET() {
  await ConnectDB();

  const now = new Date();

  // Find the matching documents first so we have their contact details
  const expiredPayments = await subscriptionPaymentModel
    .find({
      status: "pending",
      expiresAt: { $lt: now },
    })
    .select("email phone firstName lastName");

  // Now mark them all as failed
  const result = await subscriptionPaymentModel.updateMany(
    {
      status: "pending",
      expiresAt: { $lt: now },
    },
    {
      $set: { status: "failed" },
    }
  );

  // If any were updated, sync them to Brevo list [9]
  if (expiredPayments.length > 0) {
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      await Promise.allSettled(
        expiredPayments.map((payment: any) =>
          fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "api-key": brevoApiKey,
            },
            body: JSON.stringify({
              email: payment.email,
              attributes: {
                FIRSTNAME: payment.firstName || "",
                LASTNAME: payment.lastName || "",
                SMS: payment.phone || "",
              },
              listIds: [9],
              updateEnabled: true,
            }),
          })
        )
      );
    }
  }

  return NextResponse.json({
    updated: result.modifiedCount,
  });
}