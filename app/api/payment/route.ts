import { sendMail } from "@/lib/email";
import { generateEmailBody } from "@/utils/generateOrderEmail";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import axios from "axios";
import { NextResponse } from "next/server";
import productsModel from "@/app/modals/productsModel";
import { LoyaltyTransactionModel } from "@/app/modals/loyaltyTransactionModel";
import { DiscountModel } from "@/app/modals/Discount";
import BostaService, { BostaAddress } from "@/app/services/bostaService";

const loadDB = async () => {
  console.log("hna");
  await ConnectDB();
};

loadDB();

async function decreaseStock(cart: any[]) {
  // product(variants)=>variant (attribures)=>attribute
  for (const item of cart) {
    const product = await productsModel.findById(item.productId);
    if (!product) {
      console.log("note");
      console.log(
        `Product not found: ${item.productId}, but continuing execution`
      );
      continue; // Skip this item but continue processing other items
    }
    console.log("productFound");
    // Find the variation with matching color
    const variatiant = product.variations.find(
      (v: any) => v.name === item.variant.name
    );

    if (!variatiant) {
      console.log(
        `Variant not found: ${item.variant.name}, but continuing execution`
      );
      continue; // Skip this item but continue processing other items
    }
    console.log("variantFound");
    const attribute = variatiant.attributes.find(
      (a: any) => a.name === item.attributes.name
    );
    console.log("attributesFound");

    // Find the size within the variation

    // Check if enough stock is available
    if (attribute?.stock < item.quantity) {
      console.log("stock problem");
      console.log(
        `Insufficient stock for ${item.productId}, but continuing execution`
      );
      continue; // Skip this item but continue processing other items
    }

    // Decrease stock
    attribute.stock -= item.quantity;

    // Save the updated product
    await product.save();
  }
}

export async function POST(request: Request) {
  const data = await request.json();
  console.log("paymentData" + data.total);
  // console.log('here'+process.env.PaymobApiKey)
  // const items =await data.cart.map((item: any) => {
  //   return {
  //    "productId": item.productId,
  //    "productName": item.productName ,
  //    "price": item.price,
  //      "quantity": item.quantity,
  //     "color":item.color,
  //     "imageUrl":item.imageUrl

  //   }
  // });
  const items = await data.cart;
  console.log("items" + items.length);

  if (data.cash === "cash") {
    console.log("BOSTACHECK" + data.bostaZone);
    try {
      // await decreaseStock(items); // <-- Decrease stock before order creation
      console.log("redeemedLoyaltyPoints" + data.loyalty.redeemedPoints);
      console.log("appliedDiscount" + data.appliedDiscount);
      const res = await ordersModel.create({
        email: data.email,
        orderID: "",
        country: data.country,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        apartment: data.apartment,
        postalZip: data.postalZip,
        city: data.bostaCityName,
        state: data.bostaZoneName,
        phone: data.phone,
        redeemedLoyaltyPoints: data.loyalty.redeemedPoints,
        appliedDiscount: data.appliedDiscount,
        appliedDiscountAmount: data.appliedDiscountAmount,
        cash: data.cash, // Payment method: Cash or not
        cart: items,
        subTotal: data.subTotal,
        shipping: data.shipping,
        total: data.total,
        billingCountry: data.billingCountry,
        billingFirstName: data.billingFirstName,
        billingState: data.billingState,
        billingLastName: data.billingLastName,
        billingEmail: data.billingEmail,
        billingPhone: data.billingPhone,
        billingAddress: data.billingAddress,
        billingApartment: data.billingApartment,
        billingPostalZip: data.billingPostalZip,
        bostaCity: data.bostaCity,
        bostaCityName: data.bostaCityName,
        bostaZone: data.bostaZone || "",
        bostaZoneName: data.bostaZoneName || "",
        bostaDistrict: data.bostaDistrict || "",
        bostaDistrictName: data.bostaDistrictName || "",
      });

      const loyalty = await LoyaltyTransactionModel.create({
        email: data.email,
        type: "earn",
        reason: "purchase",
        amount: data.subTotal,
      });
      if (data.loyalty.redeemedPoints > 0) {
        const loyalty = await LoyaltyTransactionModel.create({
          email: data.email,
          type: "spend",
          reason: "purchase",
          amount: data.loyalty.redeemedPoints,
        });
      }
      if (data.appliedDiscountAmount > 0) {
        await DiscountModel.findByIdAndUpdate(data.appliedDiscount, {
          $inc: { usageCount: 1 },
        });
      }
      console.log("orderID" + res._id);
      console.log(data.subTotal);
      console.log(data.shipping);
      console.log(data.state);

      // Create Bosta delivery if enabled
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

      await sendMail({
        to: `${data.email}, orders@shopwifeyforlifey.com`,
        from: "noreply@shopwifeyforlifey.com",
        name: "Order Confirmation",
        subject: "Order Confirmation",
        body: generateEmailBody(
          items,
          data.firstName,
          data.lastName,
          data.phone,
          data.email,
          data.total,
          data.subTotal,
          data.shipping,
          data.currency,
          data.address,
          res._id,
          data.cash,
          data.country,
          data.state,
          data.city,
          data.postalZip,
          data.apartment
        ),
        // body: `<a href=${verificationLink}> click here to verify your account</a>`,
        //   body: compileWelcomeTemplate("Vahid", "youtube.com/@sakuradev"),
      });

      // await sendMail({
      //     to: "anchuva.store@gmail.com",
      //     name: "Order Confirmation",
      //     subject: "Order Confirmation",
      //     body:generateEmailBody(items,data.firstName,data.lastName,data.phone,data.email, data.total,data.subTotal,data.shipping,data.currency,data.address,res._id,data.cash,data.country,data.state,data.city,data.postalZip,data.apartment)
      //     // body: `<a href=${verificationLink}> click here to verify your account</a>`,
      //     //   body: compileWelcomeTemplate("Vahid", "youtube.com/@sakuradev"),
      // });
      return NextResponse.json({ token: "wiig" }, { status: 200 });
    } catch (err: any) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
  }
  // else if(data.cash==="instapay"){
  //   const res = await ordersModel.create({
  //     email:data.email,
  //      orderID:''
  //     ,country: data.country,
  //     firstName: data.firstName,
  //     lastName: data.lastName,
  //     address: data.address,
  //     apartment: data.apartment,
  //     postalZip: data.postalZip,
  //     city: data.city ,
  //     state:data.state ,
  //     phone:data.phone ,
  //     cash: data.cash, // Payment method: Cash or not
  //     cart: items,
  //     total: data.total,
  //     billingCountry: data.billingCountry,
  //     billingFirstName: data.billingFirstName,
  //     billingState:data.billingState,
  //     billingLastName: data.billingLastName,
  //     billingEmail: data.billingEmail,
  //     billingPhone: data.billingPhone,
  //     billingAddress: data.billingAddress,
  //     billingApartment: data.billingApartment,
  //     billingPostalZip: data.billingPostalZip,
  //   })
  //   console.log('orderID' + res._id)
  //   console.log(data.subTotal)
  //   console.log(data.shipping)
  //   console.log(data.state)
  //               await sendMail({
  //                   to: `${data.email}, anchuva.store@gmail.com`,
  //                   name: "Order Confirmation",
  //                   subject: "Order Confirmation",
  //                   body:generateEmailInstaBody(items,data.firstName,data.lastName,data.phone,data.email, data.total,data.subTotal,data.shipping,data.currency,data.address,res._id,data.cash,data.country,data.state,data.city,data.postalZip,data.apartment)
  //                   // body: `<a href=${verificationLink}> click here to verify your account</a>`,
  //                   //   body: compileWelcomeTemplate("Vahid", "youtube.com/@sakuradev"),
  //               });
  //   return NextResponse.json({token:'wiig'}, { status: 200 })
  // }
  else if (data.cash === "card") {
    console.log("amount" + data.total);
    try {
      const specialReference = `ref-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;
      console.log(specialReference);
      console.log("firstDebug" + data.subscription);
      if (data.subscription) {
        const order = await axios.post(
          "https://accept.paymob.com/v1/intention/",
          {
            amount: data.total * 100,
            currency: "EGP",
            payment_methods: [5220324, 5220322, 5220323],
            // "items": [
            //   {
            //     "name": "Item name",
            //     "amount": 2000,
            //     "description": "Item description",
            //     "quantity": 1
            //   }
            // ],
            billing_data: {
              apartment: data.appartment,
              first_name: data.firstName,
              last_name: data.lastName,
              street: "street",
              building: "building",
              phone_number: data.phone,
              city: data.city,
              country: data.country,
              email: data.email,
              floor: "floor",
              state: data.state,
            },
            extras: {
              ee: "subscription",
            },
            special_reference: specialReference,
            expiration: 3600,
            notification_url: `${process.env.testUrl}api/callback`,
            redirection_url: `${process.env.testUrl}api/callback`,
          }, // Request body
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${process.env.PaymobSecretKey}`,
            },
          }
        );
        console.log("order" + JSON.stringify(order.data, null, 2));
        console.log("orderData" + order.data.payment_keys[0].order_id);

        if (data.process === "upgrade") {
        }
        // else if (data.process==="new")
        else {
          await subscriptionsModel.create({
            paymentID: order.data.payment_keys[0].order_id,
            email: data.email,
            packageID: data.subscription,
            redeemedLoyaltyPoints: data.loyalty.redeemedPoints,
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
            // Address information
            country: data.country,
            address: data.address,
            apartment: data.apartment,
            city: data.bostaCityName,
            state: data.bostaZoneName,
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
            // Payment information
            total: data.total,
            subTotal: data.subTotal,
            shipping: data.shipping,
            currency: data.currency,
            cash: data.cash,
            bostaCity: data.bostaCity,
            bostaCityName: data.bostaCityName,
            bostaZone: data.bostaZone,
            bostaZoneName: data.bostaZoneName,
            bostaDistrict: data.bostaDistrict,
            bostaDistrictName: data.bostaDistrictName,
            giftCardName: data.giftCardName,
          });

          return NextResponse.json(
            { token: order.data.client_secret },
            { status: 200 }
          );
        }
      } else {
        const order = await axios.post(
          "https://accept.paymob.com/v1/intention/",
          {
            amount: data.total * 100,
            currency: "EGP",
            payment_methods: [5220324, 5220322, 5220323],
            // "items": [
            //   {
            //     "name": "Item name",
            //     "amount": 2000,
            //     "description": "Item description",
            //     "quantity": 1
            //   }
            // ],
            billing_data: {
              apartment: data.appartment,
              first_name: data.firstName,
              last_name: data.lastName,
              street: "street",
              building: "building",
              phone_number: data.phone,
              city: data.city,
              country: data.country,
              email: data.email,
              floor: "floor",
              state: data.state,
            },
            extras: {
              subtotal: data.subtotal, // e.g., total without delivery
            },
            special_reference: specialReference,
            expiration: 3600,
            notification_url: `${process.env.testUrl}api/callback`,
            redirection_url: `${process.env.testUrl}api/callback`,
          }, // Request body
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${process.env.PaymobSecretKey}`,
            },
          }
        );
        console.log("order" + JSON.stringify(order.data, null, 2));
        console.log("orderData" + order.data.payment_keys[0].order_id);
        console.log("orderID " + order.data.payment_keys[0].order_id);
        console.log("subTotal " + order.data.payment_keys[0].order_id);
        await decreaseStock(items); // <-- Decrease stock before order creation

        await ordersModel.create({
          email: data.email,
          orderID: order ? order.data.payment_keys[0].order_id : "",
          country: data.country,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          apartment: data.apartment,
          postalZip: data.postalZip,
          city: data.bostaCityName,
          state: data.bostaZoneName,
          phone: data.phone,
          cash: data.cash, // Payment method: Cash or not
          cart: items,
          total: data.total,
          subTotal: data.subTotal,
          redeemedLoyaltyPoints: data.loyalty.redeemedPoints,
          appliedDiscount: data.appliedDiscount,
          appliedDiscountAmount: data.appliedDiscountAmount,
          billingCountry: data.billingCountry,
          billingFirstName: data.billingFirstName,
          billingState: data.billingState,
          billingLastName: data.billingLastName,
          billingEmail: data.billingEmail,
          billingPhone: data.billingPhone,
          billingAddress: data.billingAddress,
          billingApartment: data.billingApartment,
          billingPostalZip: data.billingPostalZip,
          bostaCity: data.bostaCity,
          bostaCityName: data.bostaCityName,
          bostaZone: data.bostaZone || "",
          bostaZoneName: data.bostaZoneName || "",
          bostaDistrict: data.bostaDistrict || "",
          bostaDistrictName: data.bostaDistrictName || "",
        });
        return NextResponse.json(
          { token: order.data.client_secret },
          { status: 200 }
        );
      }

      // return NextResponse.json({token:payment.data.token}, { status: 200 })
    } catch (error: any) {
      console.error(error);
      return NextResponse.json(
        {
          message: "Internal server error please try again later",
          error: error.message,
        },
        { status: 500 }
      );
    }
  }
}
