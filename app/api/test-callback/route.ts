import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import PendingPaymentModel from "@/app/modals/pendingPaymentModel";
import ordersModel from "@/app/modals/ordersModel";
import subscriptionPaymentModel from "@/app/modals/subscriptionPaymentModel";

/**
 * Test endpoint to inspect PendingPayment records and create test records
 * for testing the REAL callback with Postman.
 * ONLY available in development mode.
 *
 * ─── INSPECT ────────────────────────────────────────────────────────
 *   GET /api/test-callback
 *     → Lists all PendingPayment records (summary of pending/confirmed/failed)
 *
 *   GET /api/test-callback?paymobOrderId=XXXXX
 *     → Shows the PendingPayment record for a specific Paymob order ID
 *
 * ─── CREATE TEST RECORD ─────────────────────────────────────────────
 *   POST /api/test-callback
 *     Body: {
 *       "paymobOrderId": "498875386",
 *       "productType": "order" | "subscription" | "partner_session",
 *       "referenceId": "MongoDB _id of the actual order/subscription/partnerSessionOrder"
 *     }
 *     → Creates a PendingPayment record so you can test the REAL callback:
 *       GET http://localhost:3000/api/callback?success=true&order=498875386
 *
 * ─── AUTO-DETECT FROM DB ────────────────────────────────────────────
 *   POST /api/test-callback
 *     Body: { "paymobOrderId": "498875386" }
 *     → Auto-searches orders, subscriptionPayments, and partnerSessionOrders
 *       to find the matching record and creates the PendingPayment for you.
 *
 * ─── RESET (re-test) ───────────────────────────────────────────────
 *   POST /api/test-callback
 *     Body: { "paymobOrderId": "498875386", "reset": true }
 *     → Resets an existing PendingPayment back to "pending" so you can
 *       test the real callback again.
 */

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const paymobOrderId = searchParams.get("paymobOrderId");

    if (paymobOrderId) {
      const record = await PendingPaymentModel.findOne({
        paymobOrderId: String(paymobOrderId),
      });

      if (!record) {
        return NextResponse.json(
          {
            error: "Not found",
            message: `No PendingPayment found for paymobOrderId: ${paymobOrderId}`,
            hint: "Use POST /api/test-callback to create one, then test the real callback with Postman.",
            example: {
              step1_create: {
                method: "POST",
                url: "/api/test-callback",
                body: { paymobOrderId: paymobOrderId },
              },
              step2_test: {
                method: "GET (Postman)",
                url: `/api/callback?success=true&order=${paymobOrderId}`,
              },
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        record,
        testWith: `GET /api/callback?success=true&order=${record.paymobOrderId}`,
      });
    }

    // List all records
    const allRecords = await PendingPaymentModel.find()
      .sort({ createdAt: -1 })
      .limit(50);

    const summary = {
      total: allRecords.length,
      pending: allRecords.filter((r) => r.status === "pending").length,
      confirmed: allRecords.filter((r) => r.status === "confirmed").length,
      failed: allRecords.filter((r) => r.status === "failed").length,
    };

    return NextResponse.json({
      summary,
      records: allRecords.map((r) => ({
        paymobOrderId: r.paymobOrderId,
        productType: r.productType,
        referenceId: r.referenceId,
        status: r.status,
        processedAt: r.processedAt,
        created: r.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    await ConnectDB();
    const data = await request.json();
    const { paymobOrderId, productType, referenceId, reset } = data;

    if (!paymobOrderId) {
      return NextResponse.json(
        {
          error: "Missing paymobOrderId",
          usage: [
            '1. Auto-detect: POST { "paymobOrderId": "498875386" }',
            '2. Manual:      POST { "paymobOrderId": "498875386", "productType": "order", "referenceId": "..." }',
            '3. Reset:       POST { "paymobOrderId": "498875386", "reset": true }',
          ],
        },
        { status: 400 }
      );
    }

    // ── RESET: set an existing record back to "pending" for re-testing ──
    if (reset) {
      const existing = await PendingPaymentModel.findOne({
        paymobOrderId: String(paymobOrderId),
      });
      if (!existing) {
        return NextResponse.json(
          { error: `No PendingPayment found for ${paymobOrderId}` },
          { status: 404 }
        );
      }
      existing.status = "pending";
      existing.processedAt = null;
      await existing.save();
      return NextResponse.json({
        message: "✅ Reset to pending — you can test the real callback again",
        testWith: `GET /api/callback?success=true&order=${paymobOrderId}`,
        record: existing,
      });
    }

    // Check if already exists
    const existing = await PendingPaymentModel.findOne({
      paymobOrderId: String(paymobOrderId),
    });
    if (existing) {
      return NextResponse.json({
        message: "PendingPayment already exists for this order ID",
        record: existing,
        testWith: `GET /api/callback?success=true&order=${paymobOrderId}`,
        hint: existing.status !== "pending"
          ? 'Use POST { "paymobOrderId": "...", "reset": true } to reset it for re-testing'
          : "Ready to test!",
      });
    }

    // ── MANUAL: user provided productType and referenceId ──
    if (productType && referenceId) {
      const record = await PendingPaymentModel.create({
        paymobOrderId: String(paymobOrderId),
        productType,
        referenceId,
      });
      return NextResponse.json({
        message: "✅ PendingPayment created — now test the real callback",
        testWith: `GET /api/callback?success=true&order=${paymobOrderId}`,
        record,
      });
    }

    // ── AUTO-DETECT: search across all tables to find this payment ──
    console.log(`🔍 Auto-detecting payment for order ID: ${paymobOrderId}`);

    // 1. Check partnerSessionOrders
    const PartnerSessionOrderModel = (
      await import("@/app/modals/partnerSessionOrderModel")
    ).default;
    const partnerOrder = await PartnerSessionOrderModel.findOne({
      paymentID: paymobOrderId,
    });
    if (partnerOrder) {
      const record = await PendingPaymentModel.create({
        paymobOrderId: String(paymobOrderId),
        productType: "partner_session",
        referenceId: partnerOrder._id,
      });
      return NextResponse.json({
        message: "✅ Found in PartnerSessionOrders — PendingPayment created",
        detected: { collection: "PartnerSessionOrders", id: partnerOrder._id },
        testWith: `GET /api/callback?success=true&order=${paymobOrderId}`,
        record,
      });
    }

    // 2. Check subscriptionPayments
    const subPayment = await subscriptionPaymentModel.findOne({
      paymentID: paymobOrderId,
    });
    if (subPayment) {
      const record = await PendingPaymentModel.create({
        paymobOrderId: String(paymobOrderId),
        productType: "subscription",
        referenceId: subPayment._id,
      });
      return NextResponse.json({
        message: "✅ Found in subscriptionPayments — PendingPayment created",
        detected: { collection: "subscriptionPayments", id: subPayment._id },
        testWith: `GET /api/callback?success=true&order=${paymobOrderId}`,
        record,
      });
    }

    // 3. Check orders (orderID field)
    const order = await ordersModel.findOne({
      $or: [
        { orderID: paymobOrderId },
        { orderID: Number(paymobOrderId) },
      ],
    });
    if (order) {
      const record = await PendingPaymentModel.create({
        paymobOrderId: String(paymobOrderId),
        productType: "order",
        referenceId: order._id,
      });
      return NextResponse.json({
        message: "✅ Found in orders — PendingPayment created",
        detected: { collection: "orders", id: order._id },
        testWith: `GET /api/callback?success=true&order=${paymobOrderId}`,
        record,
      });
    }

    return NextResponse.json(
      {
        error: "Could not find this payment in any table",
        searched: [
          "PartnerSessionOrders (paymentID)",
          "subscriptionPayments (paymentID)",
          "orders (orderID)",
        ],
        hint: "Provide productType and referenceId manually, or check if the order ID is correct.",
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Test callback error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
