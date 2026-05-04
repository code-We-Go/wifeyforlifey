import { NextResponse } from "next/server";
import crypto from "crypto";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import UserModel from "@/app/modals/userModel";
import { LoyaltyPointsModel } from "@/app/modals/rewardModel";
import { LoyaltyTransactionModel } from "@/app/modals/loyaltyTransactionModel";
import packageModel from "@/app/modals/packageModel";
import { DiscountModel } from "@/app/modals/Discount";
import { sendMail } from "@/lib/email";
import BostaService from "@/app/services/bostaService";
import { generateEmailBody } from "@/utils/generateOrderEmail";
import subscriptionPaymentModel from "@/app/modals/subscriptionPaymentModel";
import PendingPaymentModel from "@/app/modals/pendingPaymentModel";

// ─── Database Connection ─────────────────────────────────────────────
const loadDB = async () => {
  try {
    await ConnectDB();
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

// ─── HMAC Verification ──────────────────────────────────────────────
function verifyHmac(queryParams: Record<string, string>): boolean {
  // Skip HMAC in development for local testing (Postman, etc.)
  // if (process.env.NODE_ENV !== "production") {
  //   console.log("⏭️ Skipping HMAC verification (non-production environment)");
  //   return true;
  // }

  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  if (!hmacSecret) {
    console.warn(
      "⚠️ PAYMOB_HMAC_SECRET not configured — rejecting callback"
    );
    return false; // In production, reject if secret is missing
  }

  const receivedHmac = queryParams.hmac;
  if (!receivedHmac) {
    console.error("❌ No HMAC in callback query params");
    return false;
  }

  // Paymob HMAC fields in the exact required order
  const hmacFields = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ];

  const concatenated = hmacFields
    .map((field) => queryParams[field] || "")
    .join("");

  const calculatedHmac = crypto
    .createHmac("sha512", hmacSecret)
    .update(concatenated)
    .digest("hex");

  const isValid = calculatedHmac === receivedHmac;
  if (!isValid) {
    console.error("❌ HMAC verification failed");
    console.error("Expected:", calculatedHmac);
    console.error("Received:", receivedHmac);
  }
  return isValid;
}

// ─── POST Body HMAC Verification ────────────────────────────────────
function verifyPostHmac(obj: any, receivedHmac: string): boolean {
  // Skip HMAC in development for local testing
  if (process.env.NODE_ENV !== "production") {
    console.log("⏭️ Skipping POST HMAC verification (non-production environment)");
    return true;
  }

  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  if (!hmacSecret) {
    console.warn(
      "⚠️ PAYMOB_HMAC_SECRET not configured — rejecting callback"
    );
    return false;
  }
  if (!receivedHmac) {
    console.error("❌ No HMAC provided for POST callback");
    return false;
  }

  // For POST callbacks, extract values from the obj in the same field order
  const concatenated = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order?.id,
    obj.owner,
    obj.pending,
    obj.source_data?.pan,
    obj.source_data?.sub_type,
    obj.source_data?.type,
    obj.success,
  ]
    .map((v) => (v === undefined || v === null ? "" : String(v)))
    .join("");

  const calculatedHmac = crypto
    .createHmac("sha512", hmacSecret)
    .update(concatenated)
    .digest("hex");

  const isValid = calculatedHmac === receivedHmac;
  if (!isValid) {
    console.error("❌ POST HMAC verification failed");
  }
  return isValid;
}

// ─── Partner Session Handler ─────────────────────────────────────────
async function handlePartnerSession(
  paymobOrderId: string,
  referenceId: string,
  isSuccess: boolean
) {
  const PartnerSessionOrderModel = (
    await import("@/app/modals/partnerSessionOrderModel")
  ).default;

  const partnerOrder = await PartnerSessionOrderModel.findById(referenceId);
  if (!partnerOrder) {
    console.error(
      `Partner session order not found for referenceId: ${referenceId}`
    );
    return { success: false, redirect: "payment/failed" };
  }

  if (!isSuccess) {
    partnerOrder.status = "failed";
    await partnerOrder.save();
    return { success: false, redirect: "payment/failed" };
  }

  partnerOrder.status = "paid";
  await partnerOrder.save();

  // Send confirmation emails
  try {
    const { sendMail } = await import("@/lib/email");
    const { SessionBookingPartnerMail } = await import(
      "@/utils/SessionBookingPartnerMail"
    );
    const body = SessionBookingPartnerMail(
      partnerOrder.sessionTitle,
      partnerOrder.clientFirstName,
      partnerOrder.clientLastName,
      partnerOrder.clientEmail,
      partnerOrder.clientPhone
    );
    await sendMail({
      to: partnerOrder.partnerEmail,
      subject: "New Session Confirmed",
      name: partnerOrder.partnerName,
      body,
      from: "partners@shopwifeyforlifey.com",
    });
    await sendMail({
      to: "orders@shopwifeyforlifey.com",
      subject: "New Session Confirmed",
      name: partnerOrder.partnerName,
      body,
      from: "partners@shopwifeyforlifey.com",
    });
  } catch (e) {
    console.error("Failed to send partner confirmation email", e);
  }

  return {
    success: true,
    redirect: `payment/success?session=true&orderId=${partnerOrder._id}`,
  };
}

// ─── Subscription Handler ────────────────────────────────────────────
async function handleSubscription(
  paymobOrderId: string,
  referenceId: string,
  isSuccess: boolean
) {
  // Ensure packageModel is registered for populate
  console.log("registering" + packageModel);

  const paymentOp = await subscriptionPaymentModel
    .findById(referenceId)
    .populate({ path: "to", options: { strictPopulate: false } })
    .populate({ path: "from", options: { strictPopulate: false } });

  if (!paymentOp) {
    console.error(
      `Subscription payment not found for referenceId: ${referenceId}`
    );
    return { success: false, redirect: "payment/failed" };
  }

  if (!isSuccess) {
    await subscriptionPaymentModel.findByIdAndUpdate(paymentOp._id, {
      status: "failed",
    });
    return { success: false, redirect: "payment/failed" };
  }

  console.log("=== SUBSCRIPTION PAYMENT OP ===");
  console.log("paymentOp.to._id:", (paymentOp as any)?.to?._id?.toString());
  console.log("paymentOp.isGift:", paymentOp.isGift);
  console.log("paymentOp.email:", paymentOp.email);

  const isUpgradeProcess = paymentOp?.process === "upgrade";

  // Compute expiry for subscription based on package duration
  const expiryDate = new Date();
  const targetPackage = paymentOp.to as any;
  const pkgId = targetPackage?._id?.toString();

  const durationToUse = paymentOp.selectedDuration ?? targetPackage?.duration;

  if (typeof durationToUse === "number" && durationToUse > 0) {
    expiryDate.setMonth(expiryDate.getMonth() + durationToUse);
  } else if (pkgId === "68bf6ae9c4d5c1af12cdcd37") {
    // Mini subscription: expiry is now
  } else if (pkgId === "687396821b4da119eb1c13fe") {
    // Legacy fallback
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  } else if (pkgId === "6965e63c6df4503dda02c12b") {
    // Legacy fallback
    expiryDate.setMonth(expiryDate.getMonth() + 6);
  }

  // For gifts, use recipient email for account linkage and loyalty
  const subscriptionEmail =
    paymentOp.isGift && paymentOp.giftRecipientEmail
      ? paymentOp.giftRecipientEmail
      : paymentOp.email;
  console.log("subscriptionEmail:", subscriptionEmail);

  // Build subscription data
  const subscriptionData: any = {
    paymentID: paymobOrderId,
    email: subscriptionEmail,
    packageID: paymentOp.to,
    selectedDuration: paymentOp.selectedDuration,
    subscribed: true,
    expiryDate,
    status: "confirmed",
    process: paymentOp.process,
    redeemedLoyaltyPoints: paymentOp.redeemedLoyaltyPoints,
    appliedDiscount: paymentOp.appliedDiscount,
    appliedDiscountAmount: paymentOp.appliedDiscountAmount,
    // User info
    firstName: paymentOp.firstName,
    lastName: paymentOp.lastName,
    phone: paymentOp.phone,
    whatsAppNumber: paymentOp.whatsAppNumber,
    // Gift info
    isGift: paymentOp.isGift,
    giftRecipientEmail: paymentOp.giftRecipientEmail,
    specialMessage: paymentOp.specialMessage,
    giftCardName: paymentOp.giftCardName,
    // Address info
    country: paymentOp.country,
    address: paymentOp.address,
    apartment: paymentOp.apartment,
    city: paymentOp.city,
    state: paymentOp.state,
    postalZip: paymentOp.postalZip,
    // Billing info
    billingCountry: paymentOp.billingCountry,
    billingFirstName: paymentOp.billingFirstName,
    billingLastName: paymentOp.billingLastName,
    billingState: paymentOp.billingState,
    billingAddress: paymentOp.billingAddress,
    billingApartment: paymentOp.billingApartment,
    billingPostalZip: paymentOp.billingPostalZip,
    billingCity: paymentOp.billingCity,
    billingPhone: paymentOp.billingPhone,
    // Payment info
    total: paymentOp.total,
    subTotal: paymentOp.subTotal,
    shipping: paymentOp.shipping,
    currency: paymentOp.currency,
    // Bosta fields
    bostaCity: paymentOp.bostaCity,
    bostaCityName: paymentOp.bostaCityName,
    bostaZone: paymentOp.bostaZone,
    bostaZoneName: paymentOp.bostaZoneName,
    bostaDistrict: paymentOp.bostaDistrict,
    bostaDistrictName: paymentOp.bostaDistrictName,
  };

  // For NEW subscriptions only: pull the package cost and store it on the record
  if (paymentOp.process === "new" && typeof targetPackage?.cost === "number") {
    subscriptionData.cost = targetPackage.cost;
    console.log(`[handleSubscription] Storing package cost on new subscription: ${targetPackage.cost}`);
  }

  // Always create a new subscription document (preserves history)
  const created = await subscriptionsModel.create(subscriptionData);
  let updatedSub: any = created;
  await UserModel.findOneAndUpdate(
    { email: subscriptionEmail },
    {
      isSubscribed: true,
      $push: { subscriptions: created._id },
    }
  );

  // Ensure package is populated for downstream logic
  if (updatedSub?._id) {
    updatedSub = await subscriptionsModel.findById(updatedSub._id).populate({
      path: "packageID",
      options: { strictPopulate: false },
    });
  }

  // Loyalty earn for subscription
  if (
    updatedSub?.packageID &&
    typeof (updatedSub.packageID as any).price === "number"
  ) {
    await LoyaltyTransactionModel.create({
      email: subscriptionEmail,
      type: "earn",
      reason: "subscription",
      amount: isUpgradeProcess
        ? Math.max(
            0,
            ((paymentOp.to as any)?.price || 0) -
              ((paymentOp.from as any)?.price || 0)
          )
        : (updatedSub.packageID as any).price,
      bonusID: isUpgradeProcess
        ? "69e35eba75941926796f40ce"
        : (updatedSub.packageID as any)?._id?.toString() ===
          "68bf6ae9c4d5c1af12cdcd37"
        ? "68c176b69c1ff0a2ad779c2d"
        : "687d67f459e6ba857a54ed53",
    });
  }

  if (paymentOp.redeemedLoyaltyPoints > 0) {
    await LoyaltyTransactionModel.create({
      email: subscriptionEmail,
      type: "spend",
      reason: "subscription",
      amount: paymentOp.redeemedLoyaltyPoints,
    });
  }

  // Discount usage
  if (paymentOp.appliedDiscount && paymentOp.appliedDiscountAmount) {
    await DiscountModel.findByIdAndUpdate(paymentOp.appliedDiscount, {
      $inc: { usageCount: 1 },
    });
  }

  // Bosta integration (skip for upgrade)
  try {
    if (updatedSub?._id && process.env.BOSTA_API && !isUpgradeProcess) {
      const bostaService = new BostaService();
      const webhookUrl = `https://www.shopwifeyforlifey.com/api/webhooks/bosta`;
      const deliveryPayload = bostaService.createDeliveryPayload(
        updatedSub,
        webhookUrl
      );
      console.log(
        "Creating Bosta delivery for subscription:",
        updatedSub._id
      );
      const bostaResult = await bostaService.createDelivery(deliveryPayload);
      console.log("bostaResult" + JSON.stringify(bostaResult));
      if (bostaResult.success && bostaResult.data) {
        await subscriptionsModel.findByIdAndUpdate(updatedSub._id, {
          shipmentID: bostaResult.data._id,
          status: "confirmed",
        });
        console.log(
          "Bosta delivery created successfully:",
          bostaResult.data.trackingNumber
        );
      } else {
        console.error("Failed to create Bosta delivery:", bostaResult.error);
      }
    } else if (isUpgradeProcess) {
      console.log(
        "Skipping Bosta delivery for upgrade process:",
        updatedSub?._id
      );
    }
  } catch (bostaError) {
    console.error("Bosta integration error:", bostaError);
  }

  // Send email notifications
  try {
    if (updatedSub) {
      await sendMail({
        to: "orders@shopwifeyforlifey.com",
        name: "NEW BESTIEEE",
        subject: "NEW BESTIEEEE",
        body: `
          <h2>New Subscription Notification</h2>
          <p>A new subscription has been successfully created:</p>
          <ul>
            <li><strong>Email:</strong> ${updatedSub.email}</li>
            ${
              updatedSub.isGift
                ? `<li><strong>Gift:</strong> Yes</li>
            <li><strong>Gift Recipient Email:</strong> ${
              updatedSub.giftRecipientEmail || "N/A"
            }</li>
            <li><strong>Special Message:</strong> ${
              updatedSub.specialMessage || "N/A"
            }</li>
             <li><strong>Gift Card:</strong> ${
               updatedSub.giftCardName || "N/A"
             }</li>`
                : ""
            }
            <li><strong>Package:</strong> ${
              (updatedSub.packageID as any)?.name || "N/A"
            }</li>
            <li><strong>First Name:</strong> ${
              updatedSub.firstName || "N/A"
            }</li>
            <li><strong>Last Name:</strong> ${
              updatedSub.lastName || "N/A"
            }</li>
            <li><strong>Phone:</strong> ${updatedSub.phone || "N/A"}</li>
            <li><strong>Country:</strong> ${
              updatedSub.country || "N/A"
            }</li>
          </ul>
        `,
        from: "noreply@shopwifeyforlifey.com",
      });
      console.log("Subscription notification email sent successfully");

      // Gift flow
      if (updatedSub.isGift) {
        const { giftMail } = await import("@/utils/giftMail");
        const firstName = updatedSub.firstName || "Wifey";
        await sendMail({
          to: updatedSub.email,
          name: firstName,
          subject: "Thank You for Your Gift Purchase! 🎁",
          body: giftMail(updatedSub._id.toString()),
          from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
        });
        console.log("Gift email sent successfully to", updatedSub.email);
      } else if (paymentOp.process === "new") {
        // Welcome emails based on package ID
        if (
          (updatedSub.packageID as any)?._id &&
          (updatedSub.packageID as any)._id.toString() ===
            "687396821b4da119eb1c13fe"
        ) {
          const firstName = updatedSub.firstName || "Wifey";
          const { generateWelcomeEmail } = await import(
            "@/utils/FullExperienceEmail"
          );
          await sendMail({
            to: updatedSub.email,
            name: firstName,
            subject:
              "You're in, beautiful! Welcome to the Wifeys community 💗",
            body: generateWelcomeEmail(firstName, updatedSub),
            from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
          });
          const brevoApiKey = process.env.BREVO_API_KEY;
          if (brevoApiKey) {
            await fetch("https://api.brevo.com/v3/contacts", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "api-key": brevoApiKey,
              },
              body: JSON.stringify({
                email: updatedSub.email,
                listIds: [5],
                updateEnabled: true,
              }),
            });
          }
          console.log(
            "Welcome email sent successfully to",
            updatedSub.email
          );
        } else if (
          (updatedSub.packageID as any)?._id &&
          (updatedSub.packageID as any)._id.toString() ===
            "68bf6ae9c4d5c1af12cdcd37"
        ) {
          const firstName = updatedSub.firstName || "Wifey";
          const { generateMiniExperienceMail } = await import(
            "@/utils/MiniExperienceEmail"
          );
          await sendMail({
            to: updatedSub.email,
            name: firstName,
            subject: "Welcome to the Mini Wifey Experience! 💕",
            body: generateMiniExperienceMail(firstName, updatedSub),
            from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
          });
          const brevoApiKey = process.env.BREVO_API_KEY;
          if (brevoApiKey) {
            await fetch("https://api.brevo.com/v3/contacts", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "api-key": brevoApiKey,
              },
              body: JSON.stringify({
                email: updatedSub.email,
                listIds: [4],
                updateEnabled: true,
              }),
            });
          }
          console.log(
            "Mini Experience email sent successfully to",
            updatedSub.email
          );
        }
      }
    }
  } catch (emailError) {
    console.error(
      "Failed to send subscription notification email:",
      emailError
    );
  }

  // Link user account (ensure subscription is in the array)
  const subscribedUser = updatedSub?._id
    ? await UserModel.findOneAndUpdate(
        { email: subscriptionEmail },
        { isSubscribed: true, $addToSet: { subscriptions: updatedSub._id } }
      )
    : null;

  // Mark payment operation as confirmed
  await subscriptionPaymentModel.findByIdAndUpdate(paymentOp._id, {
    status: "confirmed",
  });

  // Determine redirect
  if (
    (updatedSub?.packageID as any)?._id?.toString() ===
    "68bf6ae9c4d5c1af12cdcd37"
  ) {
    return {
      success: true,
      redirect: `payment/success?subscription=mini${
        subscribedUser ? "&account=true" : ""
      }`,
    };
  }
  return {
    success: true,
    redirect: `payment/success?subscription=true${
      subscribedUser ? "&account=true" : ""
    }`,
  };
}

// ─── Order Handler ───────────────────────────────────────────────────
async function handleOrder(
  paymobOrderId: string,
  referenceId: string,
  isSuccess: boolean
) {
  if (!isSuccess) {
    await ordersModel.findByIdAndUpdate(referenceId, { payment: "failed" });
    return { success: false, redirect: "payment/failed" };
  }

  const res = await ordersModel.findByIdAndUpdate(
    referenceId,
    { payment: "confirmed" },
    { new: true }
  );

  if (!res) {
    console.error(`Order not found for referenceId: ${referenceId}`);
    return { success: false, redirect: "payment/failed" };
  }

  // Bosta integration
  try {
    if (process.env.BOSTA_API) {
      const bostaService = new BostaService();
      const webhookUrl = `https://www.shopwifeyforlifey.com/api/webhooks/bosta`;
      const deliveryPayload = bostaService.createDeliveryPayload(
        res,
        webhookUrl
      );
      console.log("Creating Bosta delivery for order:", res._id);
      const bostaResult = await bostaService.createDelivery(deliveryPayload);
      console.log("bostaResult" + JSON.stringify(bostaResult));
      if (bostaResult.success && bostaResult.data) {
        console.log("shipmentID" + bostaResult.data._id);
        await ordersModel.findByIdAndUpdate(res._id, {
          shipmentID: bostaResult.data._id,
          status: "confirmed",
        });
        console.log(
          "Bosta delivery created successfully:",
          bostaResult.data.trackingNumber
        );
      } else {
        console.error("Failed to create Bosta delivery:", bostaResult.error);
      }
    }
  } catch (bostaError) {
    console.error("Bosta integration error:", bostaError);
  }

  // Send order confirmation email
  await sendMail({
    to: `${res.email}, orders@shopwifeyforlifey.com`,
    name: res.firstName + " " + res.lastName,
    subject: "Order Confirmation",
    body: generateEmailBody(
      res.cart,
      res.firstName,
      res.lastName,
      res.phone,
      res.email,
      res.total,
      res.subTotal,
      res.shipping,
      res.currency,
      res.address,
      res._id,
      res.cash,
      res.country,
      res.state,
      res.city,
      res.postalZip,
      res.apartment
    ),
    from: "orders@shopwifeyforlifey.com",
  });

  // Gift email
  if (res.isGift) {
    console.log("isGift" + res.isGift);
    const { giftMail } = await import("@/utils/giftMail");
    await sendMail({
      to: res.email,
      name: res.firstName,
      subject: "Thank You for Your Gift Purchase! 🎁",
      body: giftMail(res._id.toString()),
      from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
    });
  }

  // Loyalty earn — BUG FIX: use subTotal (purchase amount), not redeemedLoyaltyPoints
  const loyaltyEmail =
    res.isGift && res.giftRecipientEmail
      ? res.giftRecipientEmail
      : res.email;
  await LoyaltyTransactionModel.create({
    email: loyaltyEmail,
    type: "earn",
    reason: "purchase",
    amount: res.subTotal,
  });

  if (res.redeemedLoyaltyPoints > 0) {
    await LoyaltyTransactionModel.create({
      email: loyaltyEmail,
      type: "spend",
      reason: "purchase",
      amount: res.redeemedLoyaltyPoints,
    });
  }

  // Discount usage — BUG FIX: use res.appliedDiscount (from the order document)
  if (res.appliedDiscountAmount > 0 && res.appliedDiscount) {
    await DiscountModel.findByIdAndUpdate(res.appliedDiscount, {
      $inc: { usageCount: 1 },
    });
  }

  return { success: true, redirect: "payment/success" };
}

// ─── Core Callback Processing ────────────────────────────────────────
async function processCallback(paymobOrderId: string, isSuccess: boolean) {
  console.log("==========================================");
  console.log("🔍 Processing callback for order:", paymobOrderId);
  console.log("Success:", isSuccess);
  console.log("==========================================");

  // Atomic claim: grab any record in pending, failed, or processing state.
  // "confirmed" is the only terminal success state — everything else is
  // (re-)claimable so we handle retries, stuck serverless functions, and
  // out-of-order Paymob webhooks in a single pass.
  const claimableStatuses = ["pending", "failed"];
  const pendingPayment = await PendingPaymentModel.findOneAndUpdate(
    {
      paymobOrderId: String(paymobOrderId),
      status: { $in: claimableStatuses },
    },
    { status: "processing" },           // atomically mark as in-progress
    { new: true }
  );

  if (!pendingPayment) {
    // Either no record exists, or it's already confirmed.
    const existing = await PendingPaymentModel.findOne({
      paymobOrderId: String(paymobOrderId),
    });

    if (!existing) {
      console.error(
        `❌ No PendingPayment found for Paymob order: ${paymobOrderId}`
      );
      return { success: false, redirect: "payment/failed" };
    }

    // Record is "confirmed" — return the appropriate success redirect
    console.log(
      `⏭️ Payment already confirmed (order: ${paymobOrderId}), skipping`
    );
    if (existing.productType === "partner_session") {
      return {
        success: true,
        redirect: `payment/success?session=true&orderId=${existing.referenceId}`,
      };
    } else if (existing.productType === "subscription") {
      return { success: true, redirect: "payment/success?subscription=true" };
    } else {
      return { success: true, redirect: "payment/success" };
    }
  }

  console.log(
    `📦 Product type: ${pendingPayment.productType}, Reference: ${pendingPayment.referenceId}`
  );

  let result: { success: boolean; redirect: string };

  try {
    switch (pendingPayment.productType) {
      case "partner_session":
        result = await handlePartnerSession(
          paymobOrderId,
          pendingPayment.referenceId.toString(),
          isSuccess
        );
        break;
      case "subscription":
        result = await handleSubscription(
          paymobOrderId,
          pendingPayment.referenceId.toString(),
          isSuccess
        );
        break;
      case "order":
        result = await handleOrder(
          paymobOrderId,
          pendingPayment.referenceId.toString(),
          isSuccess
        );
        break;
      default:
        console.error(
          `Unknown product type: ${pendingPayment.productType}`
        );
        result = { success: false, redirect: "payment/failed" };
    }

    // Mark PendingPayment as processed
    await PendingPaymentModel.findByIdAndUpdate(pendingPayment._id, {
      status: isSuccess ? "confirmed" : "failed",
      processedAt: new Date(),
    });

    return result;
  } catch (error) {
    console.error("Error processing callback:", error);
    // Mark as failed so we can investigate
    await PendingPaymentModel.findByIdAndUpdate(pendingPayment._id, {
      status: "failed",
      processedAt: new Date(),
    });
    return { success: false, redirect: "payment/failed" };
  }
}

// CORS headers for cross-origin API calls (e.g. from dashboard)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ─── OPTIONS Handler (CORS Preflight) ────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// ─── GET Handler (Transaction Response Callback — browser redirect) ──
export async function GET(request: Request) {
  await loadDB();

  console.log("==========================================");
  console.log("🚀 CALLBACK ROUTE HIT - GET REQUEST");
  console.log("==========================================");

  try {
    const { searchParams } = new URL(request.url);
    const data: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      data[key] = value;
    });

    console.log("GET Callback Received:", data);
    console.log("Order ID:", data.order);
    console.log("Success:", data.success);

    // HMAC verification
    // if (!verifyHmac(data)) {
    //   console.error("❌ HMAC verification failed — rejecting callback");
    //   return NextResponse.redirect(`${process.env.testUrl}payment/failed`);
    // }

    const isSuccess = data.success === "true";
    const paymobOrderId = data.order;

    if (!paymobOrderId) {
      console.error("❌ No order ID in callback");
      // If it's an API call, return JSON with CORS headers
      if (searchParams.get("json") === "true") {
        return NextResponse.json(
          { success: false, message: "No order ID in callback" },
          { status: 400, headers: corsHeaders }
        );
      }
      return NextResponse.redirect(`${process.env.testUrl}payment/failed`);
    }

    const result = await processCallback(paymobOrderId, isSuccess);

    // If it's an API call (like from the dashboard or mobile), return JSON instead of a redirect
    // We check for Accept header, CORS mode, or an explicit json=true parameter
    const isApiCall = 
      request.headers.get("accept")?.includes("application/json") || 
      request.headers.get("sec-fetch-mode") === "cors" ||
      searchParams.get("json") === "true";

    if (isApiCall) {
      return NextResponse.json(
        {
          success: result.success,
          redirect: result.redirect,
          message: "GET Callback handled successfully",
        },
        { headers: corsHeaders }
      );
    }

    return NextResponse.redirect(
      `${process.env.testUrl}${result.redirect}`
    );
  } catch (error) {
    console.error("Error handling GET request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ─── POST Handler (Transaction Processed Callback — server-to-server) ─
export async function POST(request: Request) {
  await loadDB();

  try {
    const body = await request.json();
    console.log("POST Callback Received:", JSON.stringify(body, null, 2));

    const obj = body.obj;
    if (!obj) {
      console.error("❌ No obj in POST callback body");
      return NextResponse.json(
        { error: "Invalid callback payload" },
        { status: 400 }
      );
    }

    // HMAC verification for POST
    const { searchParams } = new URL(request.url);
    // const hmacFromQuery = searchParams.get("hmac") || body.hmac || "";
    // if (!verifyPostHmac(obj, hmacFromQuery)) {
    //   console.error("❌ POST HMAC verification failed — rejecting callback");
    //   return NextResponse.json(
    //     { error: "HMAC verification failed" },
    //     { status: 403 }
    //   );
    // }

    const isSuccess = obj.success === true;
    const paymobOrderId = String(obj.order?.id || obj.order);

    if (!paymobOrderId) {
      console.error("❌ No order ID in POST callback");
      return NextResponse.json(
        { error: "Missing order ID" },
        { status: 400 }
      );
    }

    console.log(
      `POST callback — order: ${paymobOrderId}, success: ${isSuccess}`
    );

    const result = await processCallback(paymobOrderId, isSuccess);

    return NextResponse.json({
      message: "POST Callback handled successfully",
      processed: result.success,
      productType: result.redirect,
    });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
