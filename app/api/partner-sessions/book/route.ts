import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import PartnerSessionModel from "@/app/modals/partnerSessionModel";
import PartnerSessionOrderModel from "@/app/modals/partnerSessionOrderModel";
import { DiscountModel } from "@/app/modals/Discount";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(req: Request) {
  try {
    await ConnectDB();
    const data = await req.json();
    const { sessionId, firstName, lastName, email, phone, discountCode } = data;
    if (!sessionId || !firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const partnerSession = await PartnerSessionModel.findById(sessionId);
    if (!partnerSession || !partnerSession.isActive) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Resolve authenticated user subscription state from NextAuth session
    const authSession = await getServerSession(authOptions);
    const hasActiveSubscription = !!authSession?.user?.isSubscribed;

    const basePrice = partnerSession.price;
    let finalPrice = basePrice;
    let appliedCode: string | undefined = undefined;
    let subscriptionDiscountAmount = 0;

    // Apply subscription discount based on session configuration (percentage)
    const subPercent = hasActiveSubscription
      ? Number(partnerSession.subscriptionDiscountPercentage || 0)
      : 0;
    let priceAfterSubscription = basePrice;
    if (hasActiveSubscription && subPercent > 0) {
      priceAfterSubscription = Math.max(
        0,
        Math.round(basePrice - (basePrice * subPercent) / 100)
      );
      subscriptionDiscountAmount = Math.max(
        0,
        basePrice - priceAfterSubscription
      );
      finalPrice = priceAfterSubscription;
    }
    if (discountCode) {
      try {
        const found = await DiscountModel.findOne({
          code: new RegExp(`^${discountCode.trim()}$`, "i"),
          isActive: true,
          redeemType: { $in: ["All"] },
        });
        if (found) {
          let priceAfterCode = basePrice;
          if (found.calculationType === "PERCENTAGE" && found.value) {
            priceAfterCode = Math.max(
              0,
              Math.round(basePrice - (basePrice * found.value) / 100)
            );
          } else if (
            found.calculationType === "FIXED_AMOUNT" &&
            typeof found.value === "number"
          ) {
            priceAfterCode = Math.max(0, Math.round(basePrice - found.value));
          } else {
            priceAfterCode = basePrice; // FREE_SHIPPING/unsupported -> no price change
          }
          // Choose the best discount (lower price) between subscription and code
          if (priceAfterCode < finalPrice) {
            finalPrice = priceAfterCode;
            appliedCode = found.code;
            // Code discount outranks subscription discount; unset subscription discount impact
            subscriptionDiscountAmount = 0;
          }
        }
      } catch {}
    }
    const profitPercentage = partnerSession.profitPercentage;
    let ourProfitAmount = 0;
    // If subscription discount is applied, it comes from our profit share
    if (hasActiveSubscription && subPercent > 0 && !appliedCode) {
      const baseProfit = Math.round((basePrice * profitPercentage) / 100);
      ourProfitAmount = Math.max(0, baseProfit - subscriptionDiscountAmount);
    } else {
      ourProfitAmount = Math.round((finalPrice * profitPercentage) / 100);
    }

    const specialReference = `partner-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;
    const order = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      {
        amount: finalPrice * 100,
        currency: "EGP",
        payment_methods: [5220324, 5220322, 5220323],
        billing_data: {
          apartment: "",
          first_name: firstName,
          last_name: lastName,
          street: "street",
          building: "building",
          phone_number: phone,
          city: "Cairo",
          country: "EG",
          email,
          floor: "floor",
          state: "Cairo",
        },
        extras: {
          ee: "partner_session",
        },
        special_reference: specialReference,
        expiration: 3600,
        notification_url: `${process.env.testUrl}api/callback`,
        redirection_url: `${process.env.testUrl}api/callback`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${process.env.PaymobSecretKey}`,
        },
      }
    );

    await PartnerSessionOrderModel.create({
      sessionId: partnerSession._id,
      sessionTitle: partnerSession.title,
      partnerName: partnerSession.partnerName,
      partnerEmail: partnerSession.partnerEmail,
      whatsappNumber: partnerSession.whatsappNumber,
      clientFirstName: firstName,
      clientLastName: lastName,
      clientEmail: email,
      clientPhone: phone,
      appliedDiscountCode: appliedCode,
      basePrice,
      finalPrice,
      subscriptionDiscountAmount,
      profitPercentage,
      ourProfitAmount,
      paymentID: order.data.payment_keys?.[0]?.order_id || undefined,
      status: "pending",
    });

    return NextResponse.json(
      { token: order.data.client_secret },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Partner session booking error", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
