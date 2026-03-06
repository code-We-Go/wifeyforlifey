import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";
import subscriptionPaymentModel from "@/app/modals/subscriptionPaymentModel";

async function syncToBrevo(
  contact: { email: string; phone?: string; firstName?: string; lastName?: string },
  listId: number,
  brevoApiKey: string,
  tag: string
) {
  // Build attributes — only include SMS if it looks like a phone number
  const attributes: Record<string, string> = {};
  if (contact.firstName) attributes.FIRSTNAME = contact.firstName;
  if (contact.lastName) attributes.LASTNAME = contact.lastName;
  if (contact.phone) {
    const digits = contact.phone.replace(/\D/g, ""); // strip any non-digit chars
    let normalised: string;
    if (contact.phone.startsWith("+")) {
      // Already has country code (e.g. +201114369978)
      normalised = `+${digits}`;
    } else if (digits.startsWith("20") && digits.length === 12) {
      // Already has country code without + (e.g. 201114369978)
      normalised = `+${digits}`;
    } else if (digits.startsWith("0")) {
      // Egyptian local format: 01XXXXXXXXX → +201XXXXXXXXX
      normalised = `+20${digits.slice(1)}`;
    } else {
      // Fallback: assume Egypt
      normalised = `+20${digits}`;
    }
    attributes.SMS = normalised;
  }

  const payload = {
    email: contact.email,
    ...(Object.keys(attributes).length > 0 && { attributes }),
    listIds: [listId],
    updateEnabled: true,
  };

  console.log(`[expire-orders][${tag}] Brevo payload →`, JSON.stringify(payload));

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": brevoApiKey,
    },
    body: JSON.stringify(payload),
  });

  let body: any;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }

  if (!res.ok) {
    console.error(`[expire-orders][${tag}] Brevo error ${res.status} for ${contact.email}:`, body);
  } else {
    console.log(`[expire-orders][${tag}] Brevo OK for ${contact.email}:`, body);
  }

  return { email: contact.email, status: res.status, body };
}

export async function GET() {
  await ConnectDB();

  const now = new Date();
  const brevoResults: { subscriptions: any[]; orders: any[] } = {
    subscriptions: [],
    orders: [],
  };

  // ── Subscriptions: expire pending payments ────────────────────────────────

  const expiredPayments = await subscriptionPaymentModel
    .find({ status: "pending", expiresAt: { $lt: now } })
    .select("email phone firstName lastName");

  const result = await subscriptionPaymentModel.updateMany(
    { status: "pending", expiresAt: { $lt: now } },
    { $set: { status: "failed" } }
  );

  console.log(`[expire-orders] expiredPayments found: ${expiredPayments.length}`);

  if (expiredPayments.length > 0) {
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      const settled = await Promise.allSettled(
        expiredPayments.map((payment: any) =>
          syncToBrevo(
            {
              email: payment.email,
              phone: payment.phone,
              firstName: payment.firstName,
              lastName: payment.lastName,
            },
            10,
            brevoApiKey,
            "subscription"
          )
        )
      );
      brevoResults.subscriptions = settled.map((s) =>
        s.status === "fulfilled" ? s.value : { error: String(s.reason) }
      );
    } else {
      console.warn("[expire-orders] BREVO_API_KEY is not set");
    }
  }

  // ── Orders: expire pending payments ──────────────────────────────────────

  const expiredOrders = await ordersModel
    .find({ payment: "pending", expiresAt: { $lt: now } })
    .select("email phone firstName lastName");

  const ordersResult = await ordersModel.updateMany(
    { payment: "pending", expiresAt: { $lt: now } },
    { $set: { payment: "failed" } }
  );

  console.log(`[expire-orders] expiredOrders found: ${expiredOrders.length}`);

  if (expiredOrders.length > 0) {
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      const settled = await Promise.allSettled(
        expiredOrders.map((order: any) =>
          syncToBrevo(
            {
              email: order.email,
              phone: order.phone,
              firstName: order.firstName,
              lastName: order.lastName,
            },
            11,
            brevoApiKey,
            "order"
          )
        )
      );
      brevoResults.orders = settled.map((s) =>
        s.status === "fulfilled" ? s.value : { error: String(s.reason) }
      );
    } else {
      console.warn("[expire-orders] BREVO_API_KEY is not set");
    }
  }

  return NextResponse.json({
    subscriptionsUpdated: result.modifiedCount,
    ordersUpdated: ordersResult.modifiedCount,
    brevoResults, // ← now visible in the API response for debugging
  });
}