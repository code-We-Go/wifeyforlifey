import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import PartnerSessionModel from "@/app/modals/partnerSessionModel";
import PartnerSessionOrderModel from "@/app/modals/partnerSessionOrderModel";
import { DiscountModel } from "@/app/modals/Discount";
import PendingPaymentModel from "@/app/modals/pendingPaymentModel";
import axios from "axios";
import { PACKAGE_IDS } from "@/app/modals/userModel";
import { authenticateRequest } from "@/app/lib/mobileAuth";

export async function POST(req: Request) {
  try {
    await ConnectDB();
    const data = await req.json();
    const { sessionId, firstName, lastName, email, phone, discountCode, variantIndex } = data;
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

    // Resolve variant details if variantIndex is provided
    let sessionTitle = partnerSession.title;
    let variantTitle: string | undefined = undefined;
    let variantDuration: number | undefined = undefined;
    let basePrice = Number(partnerSession.price) || 0;

    if (
      typeof variantIndex === "number" &&
      partnerSession.variants &&
      partnerSession.variants[variantIndex]
    ) {
      const variant = partnerSession.variants[variantIndex];
      variantTitle = variant.title;
      variantDuration = variant.duration;
      sessionTitle = variant.title || partnerSession.title;
      // Variant price takes absolute priority over base session price
      if (variant.price !== undefined && variant.price !== null && !isNaN(Number(variant.price))) {
        basePrice = Number(variant.price);
      }
    }

    // Resolve authenticated user subscription state from NextAuth session or mobile token
    const { isAuthenticated, user: authUser } = await authenticateRequest(req);
    let hasActiveSubscription = false;
    if (isAuthenticated && authUser && authUser.isSubscribed) {
      const packageId =
        authUser.subscription?.packageId?.toString() ||
        authUser.subscriptions?.[0]?.packageID?.toString();
      const isMini =
        packageId === PACKAGE_IDS.MINI ||
        packageId === PACKAGE_IDS.MINI_WEDDING;

      const expiry = authUser.subscriptionExpiryDate;
      if (!isMini && expiry) {
        hasActiveSubscription = new Date(expiry).getTime() > Date.now();
      } else {
        hasActiveSubscription = false;
      }
    }

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
          redeemType: { $in: ["All", "Sessions"] },
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

    if (finalPrice <= 0) {
      finalPrice = 0;
    }

    const profitPercentage = partnerSession.profitPercentage || 0;
    let ourProfitAmount = 0;
    // If subscription discount is applied, it comes from our profit share
    if (finalPrice === 0) {
      ourProfitAmount = 0;
    } else if (hasActiveSubscription && subPercent > 0 && !appliedCode) {
      const baseProfit = Math.round((basePrice * profitPercentage) / 100);
      ourProfitAmount = Math.max(0, baseProfit - subscriptionDiscountAmount);
    } else {
      ourProfitAmount = Math.round((finalPrice * profitPercentage) / 100);
    }

    const sessionMeetingLink =
      (partnerSession.meetingLink && partnerSession.meetingLink.trim()) ||
      (partnerSession.link && partnerSession.link.trim()) ||
      "";

    // ─── Free Session Flow (finalPrice === 0) ───────────────────────────
    if (finalPrice === 0) {
      const freeOrder = await PartnerSessionOrderModel.create({
        sessionId: partnerSession._id,
        sessionTitle,
        partnerName: partnerSession.partnerName,
        partnerEmail: partnerSession.partnerEmail,
        whatsappNumber: partnerSession.whatsappNumber,
        clientFirstName: firstName,
        clientLastName: lastName,
        clientEmail: email,
        clientPhone: phone,
        appliedDiscountCode: appliedCode,
        basePrice,
        finalPrice: 0,
        subscriptionDiscountAmount,
        profitPercentage,
        ourProfitAmount: 0,
        paymentID: "FREE",
        variantTitle,
        variantDuration,
        link: sessionMeetingLink,
        meetingLink: sessionMeetingLink,
        status: "paid",
      });

      // Send confirmation emails
      try {
        const { sendMail } = await import("@/lib/email");
        const { SessionBookingPartnerMail } = await import(
          "@/utils/SessionBookingPartnerMail"
        );
        const body = SessionBookingPartnerMail(
          sessionTitle,
          firstName,
          lastName,
          email,
          phone
        );
        await sendMail({
          to: partnerSession.partnerEmail,
          subject: "New Session Confirmed",
          name: partnerSession.partnerName,
          body,
          from: "partners@shopwifeyforlifey.com",
        });
        await sendMail({
          to: "orders@shopwifeyforlifey.com",
          subject: "New Session Confirmed",
          name: partnerSession.partnerName,
          body,
          from: "partners@shopwifeyforlifey.com",
        });
      } catch (e) {
        console.error("Failed to send partner confirmation email for free booking", e);
      }

      const redirectTarget = sessionMeetingLink
        ? sessionMeetingLink
        : partnerSession.whatsappNumber
        ? `https://wa.me/${String(partnerSession.whatsappNumber).replace(/[^0-9]/g, "")}`
        : "";

      return NextResponse.json(
        {
          success: true,
          isFree: true,
          link: redirectTarget,
          orderId: freeOrder._id,
        },
        { status: 200 }
      );
    }

    // ─── Paid Session Flow (Paymob) ─────────────────────────────────────
    const specialReference = `partner-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;
    const order = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      {
        amount: finalPrice * 100,
        currency: "EGP",
        payment_methods: [5220324, 5220322, 5220323, 5613242],
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
      sessionTitle,
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
      variantTitle,
      variantDuration,
      link: sessionMeetingLink,
      meetingLink: sessionMeetingLink,
      status: "pending",
    });

    // Register in PendingPayment for callback lookup
    const createdPartnerOrder = await PartnerSessionOrderModel.findOne({
      paymentID: order.data.payment_keys?.[0]?.order_id,
    });
    if (createdPartnerOrder && order.data.payment_keys?.[0]?.order_id) {
      await PendingPaymentModel.create({
        paymobOrderId: String(order.data.payment_keys[0].order_id),
        productType: "partner_session",
        referenceId: createdPartnerOrder._id,
      });
    }

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
