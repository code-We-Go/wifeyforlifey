import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import UserModel from "@/app/modals/userModel";
import { LoyaltyPointsModel } from "@/app/modals/rewardModel";
import { LoyaltyTransactionModel } from "@/app/modals/loyaltyTransactionModel";
import { register } from "node:module";
import packageModel from "@/app/modals/packageModel";
import { DiscountModel } from "@/app/modals/Discount";
import { sendMail } from "@/lib/email";
import BostaService from "@/app/services/bostaService";
import { generateEmailBody } from "@/utils/generateOrderEmail";
import subscriptionPaymentModel from "@/app/modals/subscriptionPaymentModel";

// Ensure database is connected
const loadDB = async () => {
  try {
    await ConnectDB();
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};
loadDB();

// Handle GET requests
export async function GET(request: Request) {
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
    const isSuccess = data.success === "true";

    // Perform your logic with the GET data here
    if (isSuccess) {
      try {
        const { default: PartnerSessionOrderModel } = await import(
          "@/app/modals/partnerSessionOrderModel"
        );
        const partnerOrder = await PartnerSessionOrderModel.findOne({
          paymentID: data.order,
        });
        if (partnerOrder) {
          partnerOrder.status = "paid";
          await partnerOrder.save();
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
          } catch (e) {
            console.error("Failed to send partner confirmation email", e);
          }
          return NextResponse.redirect(
            `${process.env.testUrl}payment/success?session=true&orderId=${partnerOrder._id}`
          );
        }
      } catch (e) {
        console.error("Partner session order check failed", e);
      }
      console.log("registering" + packageModel);
      // First, check if this payment corresponds to an upgrade/renew operation
      const paymentOp = await subscriptionPaymentModel
        .findOne({ paymentID: data.order })
        .populate({ path: "to", options: { strictPopulate: false } })
        .populate({ path: "from", options: { strictPopulate: false } });

      console.log("PaymentOp found:", !!paymentOp);
      if (paymentOp) {
        console.log("=== PAYMENT OP PATH ===");
        console.log("paymentOp.to._id:", (paymentOp as any)?.to?._id?.toString());
        console.log("paymentOp.isGift:", paymentOp.isGift);
        console.log("paymentOp.giftRecipientEmail:", paymentOp.giftRecipientEmail);
        console.log("paymentOp.email:", paymentOp.email);
        
        // Compute expiry for subscription based on package duration
        const expiryDate = new Date();
        if ((paymentOp.to as any)?.duration === "0") {
          // Mini subscription or special case: expiry is now
        } else {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }

        // For gifts, use recipient email for account linkage and loyalty
        const subscriptionEmail =
          paymentOp.isGift && paymentOp.giftRecipientEmail
            ? paymentOp.giftRecipientEmail
            : paymentOp.email;
        console.log("subscriptionEmail (paymentOp path):", subscriptionEmail);
        // Update user's subscription to the new package (upgrade) or extend (renew), using full details from paymentOp
        const user = await UserModel.findOne({ email: subscriptionEmail });
        const subscriptionData: any = {
          paymentID: data.order,
          email: subscriptionEmail,
          packageID: paymentOp.to,
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

        let updatedSub: any = null;
        if (user?.subscription) {
          console.log("have subscription");
          updatedSub = await subscriptionsModel.findByIdAndUpdate(
            user.subscription._id,
            subscriptionData,
            { new: true }
          );
          // Fallback: if existing reference is stale/missing, create fresh
          if (!updatedSub) {
            console.log("no updated Sub");
            updatedSub = await subscriptionsModel.create(subscriptionData);
            await UserModel.findOneAndUpdate(
              { email: subscriptionEmail },
              { isSubscribed: true, subscription: updatedSub._id }
            );
          }
        } else {
          // If user has no subscription, create one and attach it
          const created = await subscriptionsModel.create(subscriptionData);
          updatedSub = created;
          await UserModel.findOneAndUpdate(
            { email: subscriptionEmail },
            { isSubscribed: true, subscription: created._id }
          );
        }
        // Ensure package is populated for downstream logic (emails, loyalty, bosta)
        if (updatedSub?._id) {
          updatedSub = await subscriptionsModel
            .findById(updatedSub._id)
            .populate({
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
            amount: (updatedSub.packageID as any).price,
            bonusID:
              (updatedSub.packageID as any).duration === "0"
                ? "68c176b69c1ff0a2ad779c2d"
                : "687d67f459e6ba857a54ed53",
          });
        }

        // Discount usage from payment operation
        if (paymentOp.appliedDiscount && paymentOp.appliedDiscountAmount) {
          await DiscountModel.findByIdAndUpdate(paymentOp.appliedDiscount, {
            $inc: { usageCount: 1 },
          });
        }

        // Bosta integration for subscription deliveries (skip for upgrade)
        try {
          const isUpgradeProcess = paymentOp?.process === "upgrade";
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
            const bostaResult = await bostaService.createDelivery(
              deliveryPayload
            );
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
              console.error(
                "Failed to create Bosta delivery:",
                bostaResult.error
              );
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

        // Send email notifications similar to original new subscription flow
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

            // If it's a gift, send gift email to purchaser
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
                const recipientEmail = updatedSub.email;
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
                  recipientEmail
                );
              } else if (
                (updatedSub.packageID as any)?._id &&
                (updatedSub.packageID as any)._id.toString() ===
                  "68bf6ae9c4d5c1af12cdcd37"
              ) {
                const recipientEmail = updatedSub.email;
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
                  recipientEmail
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

        // Use payment operation discount fields already handled; link user account
        const subscribedUser = updatedSub?._id
          ? await UserModel.findOneAndUpdate(
              { email: subscriptionEmail },
              { isSubscribed: true, subscription: updatedSub._id }
            )
          : null;

        // Mark payment operation as confirmed
        await subscriptionPaymentModel.findByIdAndUpdate(paymentOp._id, {
          status: "confirmed",
        });

        // Redirect to success; mini vs normal based on package duration and account linkage
        if ((updatedSub?.packageID as any)?.duration === "0") {
          return NextResponse.redirect(
            `${process.env.testUrl}payment/success?subscription=mini${
              subscribedUser ? "&account=true" : ""
            }`
          );
        }
        return NextResponse.redirect(
          `${process.env.testUrl}payment/success?subscription=true${
            subscribedUser ? "&account=true" : ""
          }`
        );
      }

      // Get the subscription to check package details
      console.log("Checking subscription for order ID:", data.order);
      let subscription = null;
      if (data.order) {
        subscription = await subscriptionsModel
          .findOne({ paymentID: data.order })
          .populate({ path: "packageID", options: { strictPopulate: false } });
      }

      if (subscription) {
        console.log("=== LEGACY SUBSCRIPTION PATH ===");
        console.log("Subscription found for ID:", data.order, subscription._id);
        console.log("subscription.packageID._id:", subscription.packageID?._id?.toString());
        console.log("subscription.isGift:", subscription.isGift);
        console.log("subscription.giftRecipientEmail:", subscription.giftRecipientEmail);
        console.log("subscription.email:", subscription.email);
        
        const expiryDate = new Date();

        // Check if it's a gift subscription
        if (subscription?.isGift) {
          // For gifts, keep expiry date as current time (now)
          console.log(
            "Gift subscription detected - setting expiry to current time"
          );
        }
        // Check if package exists and has a duration of 0
        else if (
          subscription?.packageID &&
          (subscription.packageID as any).duration === "0"
        ) {
          // If duration is 0, set expiryDate to current time (now)
          // No need to modify expiryDate as it's already set to now
          console.log(
            "Package with duration 0 detected - setting expiry to current time"
          );
        } else {
          // Default: set expiry to 1 year from now
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }

        // Determine which email to use for the subscription
        const subscriptionEmail =
          subscription.isGift && subscription.giftRecipientEmail
            ? subscription.giftRecipientEmail
            : subscription.email;
        console.log("subscriptionEmail (legacy path):", subscriptionEmail);

        // 1. Update the document and get the updated version
        console.log("register" + packageModel);
        const updateSubscription = await subscriptionsModel
          .findOneAndUpdate(
            { paymentID: data.order },
            {
              subscribed: true,
              expiryDate: expiryDate,
            },
            { new: true } // <-- This is important!
          )
          .populate({ path: "packageID", options: { strictPopulate: false } });

        if (
          subscription?.packageID &&
          typeof subscription.packageID.price === "number"
        ) {
          const loyaltyBonus = await LoyaltyTransactionModel.create({
            email: subscriptionEmail, // Use the determined email (gift recipient or normal)
            type: "earn",
            reason: "subscription",
            amount: subscription.packageID.price,
            bonusID:
              subscription.packageID.duration === "0"
                ? "68c176b69c1ff0a2ad779c2d"
                : "687d67f459e6ba857a54ed53",
          });
        } else {
          console.error(
            "Cannot create loyalty transaction: packageID or price is missing",
            {
              hasPackageID: !!subscription?.packageID,
              packageIDValue: subscription?.packageID,
            }
          );
        }

        // Log for debugging
        try {
          const paymentOpLegacy = await subscriptionPaymentModel.findOne({
            paymentID: data.order,
          });
          const isUpgradeLegacy = paymentOpLegacy?.process === "upgrade";
          if (process.env.BOSTA_API && !isUpgradeLegacy) {
            const bostaService = new BostaService();

            // Default pickup address (you should configure this in your environment)
            // const pickupAddress: BostaAddress = {
            //   city: process.env.BOSTA_PICKUP_CITY || "Cairo",
            //   zoneId: process.env.BOSTA_PICKUP_ZONE_ID || "NQz5sDOeG",
            //   districtId: process.env.BOSTA_PICKUP_DISTRICT_ID || "aiJudRHeOt",
            //   firstLine:
            //     process.env.BOSTA_PICKUP_ADDRESS || "Your Business Address",
            //   secondLine: process.env.BOSTA_PICKUP_ADDRESS_2 || "",
            //   buildingNumber: process.env.BOSTA_PICKUP_BUILDING || "123",
            //   floor: process.env.BOSTA_PICKUP_FLOOR || "1",
            //   apartment: process.env.BOSTA_PICKUP_APARTMENT || "1",
            // };

            // // Default return address
            // const returnAddress: BostaAddress = {
            //   city: process.env.BOSTA_RETURN_CITY || "Cairo",
            //   zoneId: process.env.BOSTA_RETURN_ZONE_ID || "NQz5sDOeG",
            //   districtId: process.env.BOSTA_RETURN_DISTRICT_ID || "aiJudRHeOt",
            //   firstLine:
            //     process.env.BOSTA_RETURN_ADDRESS || "Your Return Address",
            //   secondLine: process.env.BOSTA_RETURN_ADDRESS_2 || "",
            //   buildingNumber: process.env.BOSTA_RETURN_BUILDING || "123",
            //   floor: process.env.BOSTA_RETURN_FLOOR || "1",
            //   apartment: process.env.BOSTA_RETURN_APARTMENT || "1",
            // };

            const webhookUrl = `https://www.shopwifeyforlifey.com/api/webhooks/bosta`;

            const deliveryPayload = bostaService.createDeliveryPayload(
              subscription,
              // pickupAddress,
              // returnAddress,
              webhookUrl
            );

            console.log("Creating Bosta delivery for order:", subscription._id);
            const bostaResult = await bostaService.createDelivery(
              deliveryPayload
            );
            // console.log("bostaResult" + bostaResult);
            console.log("bostaResult" + JSON.stringify(bostaResult));
            if (bostaResult.success && bostaResult.data) {
              // Update order with shipment ID
              console.log("shipmentID" + bostaResult.data._id);
              await subscriptionsModel.findByIdAndUpdate(subscription._id, {
                shipmentID: bostaResult.data._id,
                status: "confirmed",
              });
              console.log(
                "Bosta delivery created successfully:",
                bostaResult.data.trackingNumber
              );
            } else {
              console.error(
                "Failed to create Bosta delivery:",
                bostaResult.error
              );
              // Don't fail the order creation if Bosta fails
            }
          } else if (isUpgradeLegacy) {
            console.log(
              "Skipping Bosta delivery for upgrade process:",
              subscription._id
            );
          }
        } catch (bostaError) {
          console.error("Bosta integration error:", bostaError);
          // Don't fail the order creation if Bosta fails
        }
        // Send email notification for new subscription
        try {
          await sendMail({
            to: "orders@shopwifeyforlifey.com",
            name: "NEW BESTIEEE",
            subject: "NEW BESTIEEEE",
            body: `
              <h2>New Subscription Notification</h2>
              <p>A new subscription has been successfully created:</p>
              <ul>
                <li><strong>Email:</strong> ${subscription.email}</li>
                ${
                  subscription.isGift
                    ? `<li><strong>Gift:</strong> Yes</li>
                <li><strong>Gift Recipient Email:</strong> ${
                  subscription.giftRecipientEmail || "N/A"
                }</li>
                <li><strong>Special Message:</strong> ${
                  subscription.specialMessage || "N/A"
                }</li>
                 <li><strong>Gift Card:</strong> ${
                   subscription.giftCardName || "N/A"
                 }</li>`
                    : ""
                }
                <li><strong>Package:</strong> ${
                  subscription.packageID?.name || "N/A"
                }</li>
                <li><strong>First Name:</strong> ${
                  subscription.firstName || "N/A"
                }</li>
                <li><strong>Last Name:</strong> ${
                  subscription.lastName || "N/A"
                }</li>
                <li><strong>Phone:</strong> ${subscription.phone || "N/A"}</li>
                <li><strong>Country:</strong> ${
                  subscription.country || "N/A"
                }</li>
              </ul>
            `,
            from: "noreply@shopwifeyforlifey.com",
          });
          console.log("Subscription notification email sent successfully");
          console.log(subscription.packageID._id.toString());

          // If it's a gift, send gift email first
          if (subscription.isGift) {
            // Import the gift email template
            const { giftMail } = await import("@/utils/giftMail");
            const firstName = subscription.firstName || "Wifey";

            await sendMail({
              to: subscription.email, // Send to the gift purchaser
              name: firstName,
              subject: "Thank You for Your Gift Purchase! 🎁",
              body: giftMail(subscription._id.toString()),
              from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
            });

            console.log("Gift email sent successfully to", subscription.email);
          } else {
            // Only send welcome emails for NEW subscriptions
            const paymentOpLegacy = await subscriptionPaymentModel.findOne({
              paymentID: data.order,
            });
            if (!paymentOpLegacy || paymentOpLegacy.process === "new") {
              // Send welcome email to the subscriber if packageID matches 687396821b4da119eb1c13fe
              if (
                subscription.packageID._id &&
                subscription.packageID._id.toString() ===
                  "687396821b4da119eb1c13fe"
              ) {
                console.log("fullExp");
                const recipientEmail = subscription.email;
                const firstName = subscription.firstName || "Wifey";

                // Import the welcome email template
                const { generateWelcomeEmail } = await import(
                  "@/utils/FullExperienceEmail"
                );

                await sendMail({
                  to: subscription.email,
                  name: firstName,
                  subject:
                    "You're in, beautiful! Welcome to the Wifeys community 💗",
                  body: generateWelcomeEmail(firstName, subscription),
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
                      email: subscription.email,
                      listIds: [5],
                      updateEnabled: true,
                    }),
                  });
                }

                console.log(
                  "Welcome email sent successfully to",
                  recipientEmail
                );
              } else if (
                subscription.packageID._id &&
                subscription.packageID._id.toString() ===
                  "68bf6ae9c4d5c1af12cdcd37"
              ) {
                const recipientEmail = subscription.email;
                const firstName = subscription.firstName || "Wifey";

                // Import the Mini Experience email template
                const { generateMiniExperienceMail } = await import(
                  "@/utils/MiniExperienceEmail"
                );

                await sendMail({
                  to: subscription.email,
                  name: firstName,
                  subject: "Welcome to the Mini Wifey Experience! 💕",
                  body: generateMiniExperienceMail(firstName, subscription),
                  from: "Wifey For Lifey <orders@shopwifeyforlifey.com>",
                });
                const brevoApiKey2 = process.env.BREVO_API_KEY;
                if (brevoApiKey2) {
                  await fetch("https://api.brevo.com/v3/contacts", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Accept: "application/json",
                      "api-key": brevoApiKey2,
                    },
                    body: JSON.stringify({
                      email: subscription.email,
                      listIds: [4],
                      updateEnabled: true,
                    }),
                  });
                }

                console.log(
                  "Mini Experience email sent successfully to",
                  recipientEmail
                );
              }
            } else {
              console.log(
                "Skipping welcome emails for upgrade/renew process:",
                paymentOpLegacy?.process
              );
            }
          }
        } catch (emailError) {
          console.error(
            "Failed to send subscription notification email:",
            emailError
          );
        }
        // const loyaltyBonus = await LoyaltyTransactionModel.create({
        //   email: subscriptionEmail, // Use the determined email (gift recipient or normal)
        //   type: "earn",
        //   reason: "subscription",
        //   amount: subscription.packageID.price,
        //   bonusID:
        //     subscription.packageID.duration === "0"
        //       ? "68c176b69c1ff0a2ad779c2d"
        //       : "687d67f459e6ba857a54ed53",
        // });
        // Use the subscription document's discount fields to increment usage
        if (
          updateSubscription?.appliedDiscountAmount &&
          updateSubscription.appliedDiscount
        ) {
          await DiscountModel.findByIdAndUpdate(
            updateSubscription.appliedDiscount,
            {
              $inc: { usageCount: 1 },
            }
          );
        }
        const subscribedUser = await UserModel.findOneAndUpdate(
          { email: subscriptionEmail },
          { isSubscribed: true, subscription: subscription._id }
        );
        if (subscribedUser) {
          // Check if this is a mini subscription (duration = "0")
          if (
            subscription.packageID &&
            subscription.packageID.duration === "0"
          ) {
            return NextResponse.redirect(
              `${process.env.testUrl}payment/success?subscription=mini&account=true`
            );
          }
          return NextResponse.redirect(
            `${process.env.testUrl}payment/success?subscription=true&account=true`
          );
        } else {
          // Check if this is a mini subscription (duration = "0")
          if (
            subscription.packageID &&
            subscription.packageID.duration === "0"
          ) {
            return NextResponse.redirect(
              `${process.env.testUrl}payment/success?subscription=mini`
            );
          }
          return NextResponse.redirect(
            `${process.env.testUrl}payment/success?subscription=true`
          );
        }
      } else {
        console.log("Order2ID" + data.order);
        console.log("Transaction Successful, redirecting to /success...");
        const res = await ordersModel.findOneAndUpdate(
          { orderID: data.order },
          { payment: "confirmed" }
        );

        if (!res) {
          console.error(`Order not found for ID: ${data.order}`);
          return NextResponse.redirect(`${process.env.testUrl}payment/failed`);
        }

        try {
          if (process.env.BOSTA_API) {
            const bostaService = new BostaService();

            // Default pickup address (you should configure this in your environment)
            // const pickupAddress: BostaAddress = {
            //   city: process.env.BOSTA_PICKUP_CITY || "Cairo",
            //   zoneId: process.env.BOSTA_PICKUP_ZONE_ID || "NQz5sDOeG",
            //   districtId: process.env.BOSTA_PICKUP_DISTRICT_ID || "aiJudRHeOt",
            //   firstLine:
            //     process.env.BOSTA_PICKUP_ADDRESS || "Your Business Address",
            //   secondLine: process.env.BOSTA_PICKUP_ADDRESS_2 || "",
            //   buildingNumber: process.env.BOSTA_PICKUP_BUILDING || "123",
            //   floor: process.env.BOSTA_PICKUP_FLOOR || "1",
            //   apartment: process.env.BOSTA_PICKUP_APARTMENT || "1",
            // };

            // // Default return address
            // const returnAddress: BostaAddress = {
            //   city: process.env.BOSTA_RETURN_CITY || "Cairo",
            //   zoneId: process.env.BOSTA_RETURN_ZONE_ID || "NQz5sDOeG",
            //   districtId: process.env.BOSTA_RETURN_DISTRICT_ID || "aiJudRHeOt",
            //   firstLine:
            //     process.env.BOSTA_RETURN_ADDRESS || "Your Return Address",
            //   secondLine: process.env.BOSTA_RETURN_ADDRESS_2 || "",
            //   buildingNumber: process.env.BOSTA_RETURN_BUILDING || "123",
            //   floor: process.env.BOSTA_RETURN_FLOOR || "1",
            //   apartment: process.env.BOSTA_RETURN_APARTMENT || "1",
            // };

            const webhookUrl = `https://www.shopwifeyforlifey.com/api/webhooks/bosta`;

            const deliveryPayload = bostaService.createDeliveryPayload(
              res,
              // pickupAddress,
              // returnAddress,
              webhookUrl
            );

            console.log("Creating Bosta delivery for order:", res._id);
            const bostaResult = await bostaService.createDelivery(
              deliveryPayload
            );
            // console.log("bostaResult" + bostaResult);
            console.log("bostaResult" + JSON.stringify(bostaResult));
            if (bostaResult.success && bostaResult.data) {
              // Update order with shipment ID
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
              console.error(
                "Failed to create Bosta delivery:",
                bostaResult.error
              );
              // Don't fail the order creation if Bosta fails
            }
          }
        } catch (bostaError) {
          console.error("Bosta integration error:", bostaError);
          // Don't fail the order creation if Bosta fails
        }
        // Send order confirmation email to customer
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

        // Send a copy to orders@shopwifeyforlifey.com
        // await sendMail({
        //   to: "orders@shopwifeyforlifey.com",
        //   from: "noreply@shopwifeyforlifey.com",
        //   name: "New Order Notification",
        //   subject: `New Order #${res._id} - ${res.firstName} ${res.lastName}`,
        //   body: generateEmailBody(
        //     res.cart,
        //     res.firstName,
        //     res.lastName,
        //     res.phone,
        //     res.email,
        //     res.total,
        //     res.subTotal,
        //     res.shipping,
        //     res.currency,
        //     res.address,
        //     res._id,
        //     res.cash,
        //     res.country,
        //     res.state,
        //     res.city,
        //     res.postalZip,
        //     res.apartment
        //   ),
        // });
        // If it's a gift, send gift email to purchaser
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
// we need here if they are same email to skip this one because loyalty points are already added
        const loyalty = await LoyaltyTransactionModel.create({
          email:
            res.isGift && res.giftRecipientEmail
              ? res.giftRecipientEmail
              : res.email,
          type: "earn",
          reason: "purchase",
          amount: res.redeemedLoyaltyPoints,
        });
        if (res.appliedDiscountAmount > 0) {
          await DiscountModel.findByIdAndUpdate(data.appliedDiscount, {
            $inc: { usageCount: 1 },
          });
        }
      }
      //Update the order status with orderId here
      return NextResponse.redirect(`${process.env.testUrl}payment/success`);
    } else {
      // Mark subscription payment operation as failed if exists
      try {
        const failedOp = await subscriptionPaymentModel.findOne({
          paymentID: data.order,
        });
        if (failedOp) {
          await subscriptionPaymentModel.findByIdAndUpdate(failedOp._id, {
            status: "failed",
          });
        }
      } catch (e) {
        console.error("Failed to mark subscription payment as failed", e);
      }
      const res = await ordersModel.findOneAndUpdate(
        { orderID: data.order },
        { payment: "failed" }
      );
      console.log("Transaction Failed, redirecting to /failure...");
      return NextResponse.redirect(`${process.env.testUrl}payment/failed`);
    }
    // if (isSuccess) {
    //     console.log("Transaction Successful, redirecting to /success...");
    //     return NextResponse.redirect(new URL("/", request.url));
    // } else {
    //     console.log("Transaction Failed, redirecting to /failure...");
    //     return NextResponse.redirect(new URL("/pages/about", request.url));
    // }
    // return NextResponse.json({ message: "GET Callback handled successfully", data });
  } catch (error) {
    console.error("Error handling GET request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Handle POST requests
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("POST Callback Received:", data);
    console.log("item" + data.obj.order.currency);

    // Perform your logic with the POST data here
    return NextResponse.json({ message: "POST Callback handled successfully" });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
