import { ConnectDB } from "@/app/config/db";
import subscriptionPaymentModel from "@/app/modals/subscriptionPaymentModel";
import UserModel from "@/app/modals/userModel";
import { NextResponse } from "next/server";

const loadDB = async () => {
  await ConnectDB();
};

loadDB();

export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log("Creating instapay subscription payment:", data);

    // Find user if exists
    const user = await UserModel.findOne({ email: data.email }).populate({
      path: "subscription",
      options: { strictPopulate: false },
    });

    const fromPackageID = (user?.subscription as any)?.packageID || null;

    // Create subscription payment record with "pending" status
    // This will be confirmed when admin verifies the instapay payment
    const subscriptionPayment = await subscriptionPaymentModel.create({
      paymentID: `instapay-${Date.now()}`, // Generate unique payment ID
      email: data.email,
      userID: user?._id,
      process: data.process || "new",
      from: fromPackageID,
      to: data.subscription,
      // Parity fields from subscription schema
      packageID: data.subscription,
      subscribed: false,
      redeemedLoyaltyPoints: data.loyalty?.redeemedPoints || 0,
      appliedDiscount: data.appliedDiscount,
      appliedDiscountAmount: data.appliedDiscountAmount,
      // User information
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      whatsAppNumber: data.whatsAppNumber,
      // Gift information
      isGift: data.isGift,
      giftRecipientEmail: data.giftRecipientEmail,
      specialMessage: data.specialMessage,
      giftCardName: data.giftCardName,
      // Address information
      country: data.country,
      address: data.address,
      apartment: data.apartment,
      city: data.city,
      state: data.state,
      postalZip: data.postalZip,
      // Billing information
      billingCountry: data.billingCountry,
      billingFirstName: data.billingFirstName,
      billingLastName: data.billingLastName,
      billingState: data.billingState,
      billingAddress: data.billingAddress,
      billingApartment: data.billingApartment,
      billingPostalZip: data.billingPostalZip,
      billingCity: data.billingCity,
      billingPhone: data.billingPhone,
      billingWhatsAppNumber: data.billingWhatsAppNumber,
      // Payment information
      total: data.total,
      subTotal: data.subTotal,
      shipping: data.shipping,
      currency: data.currency || "EGP",
      // Bosta fields
      bostaCity: data.bostaCity,
      bostaCityName: data.bostaCityName,
      bostaZone: data.bostaZone,
      bostaZoneName: data.bostaZoneName,
      bostaDistrict: data.bostaDistrict,
      bostaDistrictName: data.bostaDistrictName,
      // Status - pending until admin confirms instapay payment
      status: "pending",
      paymentMethod: "instapay",
    });

    console.log("Subscription payment created:", subscriptionPayment._id);

    return NextResponse.json(
      {
        success: true,
        subscriptionId: subscriptionPayment._id.toString(),
        message: "Subscription payment record created successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating instapay subscription:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create subscription payment",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
