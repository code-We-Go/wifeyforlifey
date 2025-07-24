import { sendMail } from "@/lib/email";
import { generateEmailBody } from "@/utils/generateOrderEmail";
// import { generateEmailInstaBody } from "@/app/utils/generateOrderInstaEmail";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import axios from "axios";
import { NextResponse } from "next/server";
import productsModel from "@/app/modals/productsModel";
import { LoyaltyTransactionModel } from "@/app/modals/loyaltyTransactionModel";
import { DiscountModel } from "@/app/modals/Discount";

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
      return NextResponse.json(
        { error: `Product not found: ${item.productId}` },
        { status: 404 }
      );
    }
    console.log("productFound");
    // Find the variation with matching color
    const variatiant = product.variations.find(
      (v: any) => v.name === item.variant.name
    );

    if (!variatiant) {
      return NextResponse.json(
        { error: ` variant not found: ${item.color}` },
        { status: 404 }
      );
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
      return NextResponse.json(
        {
          error: `Insufficient stock for ${item.productID} )`,
        },
        { status: 400 }
      );
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
    try {
      await decreaseStock(items); // <-- Decrease stock before order creation
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
        city: data.city,
        state: data.state,
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
      await sendMail({
        to: `${data.email}`,
        from: "orders@shopwifeyforlifey.com",
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
            payment_methods: [5173616],
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

        await subscriptionsModel.create({
          paymentID: order.data.payment_keys[0].order_id,
          email: data.email,
          packageID: data.subscription,
          redeemedLoyaltyPoints: data.loyalty.redeemedPoints,
          appliedDiscount: data.appliedDiscount,
          appliedDiscountAmount: data.appliedDiscountAmount,
        });
        // await ordersModel.create({
        //   email:data.email,
        //    orderID:order?order.data.payment_keys[0].order_id:''
        //   ,country: data.country,
        //   firstName: data.firstName,
        //   lastName: data.lastName,
        //   address: data.address,
        //   apartment: data.apartment,
        //   postalZip: data.postalZip,
        //   city: data.city ,
        //   state:data.state ,
        //   phone:data.phone ,
        //   cash: data.cash, // Payment method: Cash or not
        //   cart: items,
        //   total: data.total,
        //   subTotal:data.subTotal,
        //   billingCountry: data.billingCountry,
        //   billingFirstName: data.billingFirstName,
        //   billingState:data.billingState,
        //   billingLastName: data.billingLastName,
        //   billingEmail: data.billingEmail,
        //   billingPhone: data.billingPhone,
        //   billingAddress: data.billingAddress,
        //   billingApartment: data.billingApartment,
        //   billingPostalZip: data.billingPostalZip,
        // })
        return NextResponse.json(
          { token: order.data.client_secret },
          { status: 200 }
        );
      } else {
        const order = await axios.post(
          "https://accept.paymob.com/v1/intention/",
          {
            amount: data.total * 100,
            currency: "EGP",
            payment_methods: [5173616],
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
          city: data.city,
          state: data.state,
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
