import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { ConnectDB } from "@/app/config/db";
import UserModel from "@/app/modals/userModel";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email?.trim().toLowerCase();

    const body = await request.json();
    const {
      email: bodyEmail,
      firstName,
      lastName,
      whatsAppNumber,
      preferredLanguage,
      weddingDay,
    } = body;

    const email = sessionEmail || (bodyEmail ? bodyEmail.trim().toLowerCase() : null);

    if (!email) {
      return NextResponse.json(
        { error: "Authentication required or email must be provided" },
        { status: 401 }
      );
    }

    if (!whatsAppNumber || !whatsAppNumber.trim()) {
      return NextResponse.json(
        { error: "WhatsApp number is required" },
        { status: 400 }
      );
    }

    await ConnectDB();

    const cleanWhatsApp = whatsAppNumber.trim();
    const lang = preferredLanguage === "ar" ? "ar" : "en";

    const updateFields: any = {
      whatsAppNumber: cleanWhatsApp,
      preferredLanguage: lang,
      onboardingCompleted: true,
    };

    if (firstName && firstName.trim()) {
      updateFields.firstName = firstName.trim();
    }
    if (lastName && lastName.trim()) {
      updateFields.lastName = lastName.trim();
    }
    if (weddingDay) {
      const parsedDate = new Date(weddingDay);
      if (!isNaN(parsedDate.getTime())) {
        updateFields.weddingDate = parsedDate;
      }
    }

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const existingShipping = existingUser.shippingData || {};
    updateFields.shippingData = {
      ...existingShipping,
      whatsAppNumber: cleanWhatsApp,
      phone: existingShipping.phone || cleanWhatsApp,
      firstName: updateFields.firstName || existingShipping.firstName || existingUser.firstName || "",
      lastName: updateFields.lastName || existingShipping.lastName || existingUser.lastName || "",
      email: email,
    };

    const updatedUser = await UserModel.findOneAndUpdate(
      { email },
      { $set: updateFields },
      { new: true }
    ).select("-password");

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        whatsAppNumber: updatedUser.whatsAppNumber,
        preferredLanguage: updatedUser.preferredLanguage,
        weddingDate: updatedUser.weddingDate,
        onboardingCompleted: updatedUser.onboardingCompleted,
      },
    });
  } catch (error: any) {
    console.error("Error in onboarding API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

