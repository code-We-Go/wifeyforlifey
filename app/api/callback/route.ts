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
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const expiryDateLifeTime = new Date();
      expiryDateLifeTime.setFullYear(expiryDateLifeTime.getFullYear() + 100);
      const subscribtions = await subscriptionsModel.countDocuments({
        subscribed: true,
      });
      console.log("lifeTime" + expiryDateLifeTime);
      // 1. Update the document and get the updated version
      const updatedSubscription = await subscriptionsModel.findOneAndUpdate(
        { paymentID: data.order },
        {
          subscribed: true,
          expiryDate: expiryDate,
          // expiryDate: subscribtions > 50 ? expiryDate : expiryDateLifeTime,
        },
        { new: true } // <-- This is important!
      );

      // 2. Populate the necessary fields
      console.log("register" + packageModel);
      const subscription = await subscriptionsModel
        .findOne({ paymentID: data.order })
        .populate({ path: "packageID", options: { strictPopulate: false } });
      if (subscription) {
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
          bonusID: "687d67f459e6ba857a54ed53",
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
