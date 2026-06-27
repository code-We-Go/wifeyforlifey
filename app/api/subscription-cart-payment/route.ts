import { sendMail } from "@/lib/email";
import { ConnectDB } from "@/app/config/db";
import UserModel, { PACKAGE_IDS } from "@/app/modals/userModel";
import subscriptionPaymentModel from "@/app/modals/subscriptionPaymentModel";
import PendingPaymentModel from "@/app/modals/pendingPaymentModel";
import axios from "axios";
import { NextResponse } from "next/server";

const loadDB = async () => {
  await ConnectDB();
};

export async function POST(request: Request) {
  await loadDB();
  const data = await request.json();

  const isInstapay = data.cash === "instapay";
  const specialReference = isInstapay
    ? `instapay-ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    : `ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    let orderId = specialReference;
    let clientSecret = "";

    // 1. If card payment, initialize Paymob intention
    if (!isInstapay) {
      console.log("it's a carddd")
      const response = await axios.post(
        "https://accept.paymob.com/v1/intention/",
        {
          amount: data.total * 100,
          currency: "EGP",
          payment_methods: [5220324, 5220322, 5220323],
          billing_data: {
            apartment: data.apartment || "apartment",
            first_name: data.firstName || "firstName",
            last_name: data.lastName || "lastName",
            street: data.address || "street",
            building: "building",
            phone_number: data.phone || "phone",
            city: data.city || "city",
            country: data.country || "country",
            email: data.email || "email",
            floor: "floor",
            state: data.state || "state",
          },
          extras: {
            ee: "subscription",
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

      orderId = response.data.payment_keys[0].order_id;
      clientSecret = response.data.client_secret;
    }

    // 2. Loop through all subscriptions in the cart and create pending payment records
    const createdPayments = [];
    for (let idx = 0; idx < data.subscriptions.length; idx++) {
      const sub = data.subscriptions[idx];
      const subEmail = sub.isGift ? (sub.giftRecipientEmail || "") : sub.email;

      const userRecord = await UserModel.findOne({ email: subEmail }).populate({
        path: "subscriptions",
        options: { sort: { expiryDate: -1 } },
      });

      const mainSub = userRecord?.subscriptions?.find(
        (s: any) => s.packageID?.toString() !== PACKAGE_IDS.WEDDING_PLANNING_BESTIE
      ) as any;
      const fromPackageID = mainSub?.packageID || null;

      // Only bundle product cart items on the first record
      const bundledCart = idx === 0 ? data.cart : [];

      const subPayment = await subscriptionPaymentModel.create({
        paymentID: String(orderId),
        email: subEmail,
        userID: userRecord?._id,
        process: "new",
        from: fromPackageID,
        to: sub.packageId,
        packageID: sub.packageId,
        selectedDuration: sub.duration,
        subscribed: false,
        paymentMethod: data.paymentMethod,
        cart: bundledCart,

        // Apply coupon and loyalty fields to the first subscription only
        redeemedLoyaltyPoints: idx === 0 ? (data.loyalty?.redeemedPoints || 0) : 0,
        appliedDiscount: idx === 0 ? data.appliedDiscount : undefined,
        appliedDiscountAmount: idx === 0 ? data.appliedDiscountAmount : 0,

        // User info for subscription
        firstName: sub.firstName,
        lastName: sub.lastName,
        phone: sub.phone,
        whatsAppNumber: sub.whatsAppNumber,

        // Gift settings
        isGift: sub.isGift,
        giftRecipientEmail: sub.giftRecipientEmail,
        giftSenderEmail: sub.isGift ? data.email : undefined,
        giftCardName: sub.giftCardName,
        specialMessage: sub.specialMessage,

        // Shared Shipping address info
        country: data.country,
        address: data.address,
        apartment: data.apartment,
        city: data.city,
        state: data.state,
        postalZip: data.postalZip,

        // Bosta fields
        bostaCity: data.bostaCity,
        bostaCityName: data.bostaCityName,
        bostaZone: data.bostaZone,
        bostaZoneName: data.bostaZoneName,
        bostaDistrict: data.bostaDistrict,
        bostaDistrictName: data.bostaDistrictName,

        // Shared Billing address info
        billingCountry: data.billingCountry,
        billingFirstName: data.billingFirstName,
        billingLastName: data.billingLastName,
        billingAddress: data.billingAddress,
        billingApartment: data.billingApartment,
        billingPostalZip: data.billingPostalZip,
        billingCity: data.billingCity,
        billingState: data.billingState,
        billingPhone: data.billingPhone,
        billingWhatsAppNumber: data.billingWhatsAppNumber,

        // Totals allocation — first sub carries the full order totals; rest show individual price in subTotal only
        total: idx === 0 ? data.total : 0,
        subTotal: idx === 0 ? data.subTotal : sub.price,
        shipping: idx === 0 ? data.shipping : 0,
        currency: data.currency || "EGP",

        status: "pending",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        instapayReciept: data.instapayReciept,
      });

      createdPayments.push(subPayment);
    }

    // 3. Register a single PendingPaymentModel record for callback tracking
    await PendingPaymentModel.create({
      paymobOrderId: String(orderId),
      productType: "subscription",
      referenceId: createdPayments[0]._id, // Reference to the first payment record
    });

    // 4. If Instapay, send immediate notification email to the admin
    if (isInstapay) {
      const isMulti = createdPayments.length > 1;
      const subLabel = isMulti ? "Multi-Subscription" : "Subscription";

      let adminEmailBody = `
        <h2>New Pending ${subLabel} Instapay Payment Request</h2>
        <p>A new ${isMulti ? "multi-subscription" : "subscription"} has been requested with Instapay payment:</p>
        <ul>
          <li><strong>Total Amount:</strong> ${data.total} EGP</li>
          <li><strong>Instapay Screenshot:</strong> <a href="${data.instapayReciept}" target="_blank">View Screenshot</a></li>
        </ul>
        <h3>Subscription${isMulti ? "s" : ""} details:</h3>
      `;

      for (const sub of createdPayments) {
        adminEmailBody += `
          <div style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin-bottom: 12px; background-color: #f8fafc;">
            <p><strong>Package:</strong> ${sub.packageID}</p>
            <p><strong>Email:</strong> ${sub.email}</p>
            <p><strong>Name:</strong> ${sub.firstName} ${sub.lastName}</p>
            <p><strong>Phone:</strong> ${sub.phone}</p>
            <p><strong>Is Gift:</strong> ${sub.isGift ? "Yes" : "No"}</p>
            ${
              sub.isGift
                ? `<p><strong>Gift Recipient Email:</strong> ${sub.giftRecipientEmail || "N/A"}</p>
                   <p><strong>Gift Card:</strong> ${sub.giftCardName || "N/A"}</p>
                   <p><strong>Special Message:</strong> ${sub.specialMessage || "N/A"}</p>`
                : ""
            }
          </div>
        `;
      }

      await sendMail({
        to: "orders@shopwifeyforlifey.com",
        name: `NEW Pending ${subLabel} Request`,
        subject: `NEW Pending ${subLabel} Request`,
        body: adminEmailBody,
        from: "noreply@shopwifeyforlifey.com",
      });

      return NextResponse.json(
        {
          success: true,
          subscriptionId: createdPayments[0]._id.toString(),
        },
        { status: 200 }
      );
    }

    // 5. Return Paymob intention client secret token
    return NextResponse.json(
      { token: clientSecret },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Multi-subscription payment initiation error:", err);
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
