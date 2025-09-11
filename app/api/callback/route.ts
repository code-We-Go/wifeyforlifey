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
  try {
    const { searchParams } = new URL(request.url);
    const data: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      data[key] = value;
    });

    console.log("GET Callback Received:", data);
    const isSuccess = data.success === "true";

    // Perform your logic with the GET data here
    if (isSuccess) {
      // Get the subscription to check package details
      let subscription = await subscriptionsModel
        .findOne({ paymentID: data.order })
        .populate({ path: "packageID", options: { strictPopulate: false } });

      // Set expiry date based on package duration
      const expiryDate = new Date();

      // Check if package exists and has a duration of 0
      if (
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

      // 1. Update the document and get the updated version
      subscription = await subscriptionsModel.findOneAndUpdate(
        { paymentID: data.order },
        {
          subscribed: true,
          expiryDate: expiryDate,
        },
        { new: true } // <-- This is important!
      );
      console.log("register" + packageModel);
      if (
        subscription?.packageID &&
        typeof subscription.packageID.price === "number"
      ) {
        const loyaltyBonus = await LoyaltyTransactionModel.create({
          email: subscription.email,
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
      if (subscription) {
        try {
          if (process.env.BOSTA_API && process.env.BOSTA_BEARER_TOKEN) {
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
        } catch (emailError) {
          console.error(
            "Failed to send subscription notification email:",
            emailError
          );
        }
        const loyaltyBonus = await LoyaltyTransactionModel.create({
          email: subscription.email,
          type: "earn",
          reason: "subscription",
          amount: subscription.packageID.price,
          bonusID:
            subscription.packageID.duration === "0"
              ? "68c176b69c1ff0a2ad779c2d"
              : "687d67f459e6ba857a54ed53",
        });
        if (subscription.appliedDiscountAmount > 0) {
          await DiscountModel.findByIdAndUpdate(data.appliedDiscount, {
            $inc: { usageCount: 1 },
          });
        }
        const subscribedUser = await UserModel.findOneAndUpdate(
          { email: subscription.email },
          { isSubscribed: true, subscription: subscription._id }
        );
        if (subscribedUser) {
          return NextResponse.redirect(
            `${process.env.testUrl}payment/success?subscription=true&account=true`
          );
        } else {
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
        try {
          if (process.env.BOSTA_API && process.env.BOSTA_BEARER_TOKEN) {
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
          to: res.email,
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
        await sendMail({
          to: "orders@shopwifeyforlifey.com",
          from: "noreply@shopwifeyforlifey.com",
          name: "New Order Notification",
          subject: `New Order #${res._id} - ${res.firstName} ${res.lastName}`,
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
        });
        const loyalty = await LoyaltyTransactionModel.create({
          email: res.email,
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
