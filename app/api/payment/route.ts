import { sendMail } from "@/lib/email";
import { generateEmailBody } from "@/utils/generateOrderEmail";
// import { generateEmailInstaBody } from "@/app/utils/generateOrderInstaEmail";
import { ConnectDB } from "@/app/config/db";
import ordersModel from "@/app/modals/ordersModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import axios from "axios";
import { NextResponse } from "next/server";

const loadDB = async () => {
    console.log('hna');
    await ConnectDB();
}

loadDB();

export async function POST(request: Request) {
    const data = await request.json();
    console.log( 'paymentData' +data.total);
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
    const items =await data.cart
    console.log('items'+items.length)

    if(data.cash==="cash"){
      const res = await ordersModel.create({ 
        email:data.email,
         orderID:''
        ,country: data.country,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        apartment: data.apartment,
        postalZip: data.postalZip,
        city: data.city ,
        state:data.state ,
        phone:data.phone ,
        cash: data.cash, // Payment method: Cash or not
        cart: items,
        subTotal:data.subTotal,
        shipping:data.shipping,
        total: data.total,
        billingCountry: data.billingCountry,
        billingFirstName: data.billingFirstName,
        billingState:data.billingState,
        billingLastName: data.billingLastName,
        billingEmail: data.billingEmail,
        billingPhone: data.billingPhone,
        billingAddress: data.billingAddress,
        billingApartment: data.billingApartment, 
        billingPostalZip: data.billingPostalZip, 
      })
      console.log('orderID' + res._id)
      console.log(data.subTotal)
      console.log(data.shipping)
      console.log(data.state)
                  await sendMail({
                      to: `${data.email}`,
                      from:"orders@shopwifeyforlifey.com",
                      name: "Order Confirmation",
                      subject: "Order Confirmation",
                      body:generateEmailBody(items,data.firstName,data.lastName,data.phone,data.email, data.total,data.subTotal,data.shipping,data.currency,data.address,res._id,data.cash,data.country,data.state,data.city,data.postalZip,data.apartment)
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
      return NextResponse.json({token:'wiig'}, { status: 200 })
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
    else if(data.cash ==="card"){
      console.log("amount" + data.total)
    try {
      const specialReference = `ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
console.log(specialReference);
console.log("firstDebug" + data.subscription )
if(data.subscription === "theWifeyExperience"){
  const order = await axios.post(
    'https://accept.paymob.com/v1/intention/',
    {
      "amount": data.total*1000,
      "currency": "EGP",
      "payment_methods": [5173616],
      // "items": [
      //   {
      //     "name": "Item name",
      //     "amount": 2000,
      //     "description": "Item description",
      //     "quantity": 1
      //   }
      // ],
      "billing_data": {
        "apartment": data.appartment,
        "first_name": data.firstName,
        "last_name": data.lastName,
        "street": "street",
        "building": "building",
        "phone_number": data.phone,
        "city": data.city,
        "country": data.country,
        "email": data.email,
        "floor": "floor",
        "state": data.state
      },
      "extras": {
        "ee": "subscription"
      },
      "special_reference": specialReference,
      "expiration": 3600,
      "notification_url": `${process.env.testUrl}api/callback`,
      "redirection_url": `${process.env.testUrl}api/callback`
    }, // Request body
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.PaymobSecretKey}`
      }
    }
  );
  console.log('order'+JSON.stringify(order.data, null, 2))
  console.log('orderData'+order.data.payment_keys[0].order_id)
  
  await subscriptionsModel.create({ paymentID: order.data.payment_keys[0].order_id,email:data.email })
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
  return NextResponse.json({token:order.data.client_secret}, { status: 200 })
}
else{
  const order = await axios.post(
    'https://accept.paymob.com/v1/intention/',
    {
      "amount": data.total*1000,
      "currency": "EGP",
      "payment_methods": [5173616],
      // "items": [
      //   {
      //     "name": "Item name",
      //     "amount": 2000,
      //     "description": "Item description",
      //     "quantity": 1
      //   }
      // ],
      "billing_data": {
        "apartment": data.appartment,
        "first_name": data.firstName,
        "last_name": data.lastName,
        "street": "street",
        "building": "building",
        "phone_number": data.phone,
        "city": data.city,
        "country": data.country,
        "email": data.email,
        "floor": "floor",
        "state": data.state
      },
      "extras": {
        "ee": 22
      },
      "special_reference": specialReference,
      "expiration": 3600,
      "notification_url": `${process.env.testUrl}api/callback`,
      "redirection_url": `${process.env.testUrl}api/callback`
    }, // Request body
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.PaymobSecretKey}`
      }
    }
  );
  console.log('order'+JSON.stringify(order.data, null, 2))
  console.log('orderData'+order.data.payment_keys[0].order_id)
  console.log('orderID '+order.data.payment_keys[0].order_id)
  console.log('subTotal '+order.data.payment_keys[0].order_id)
  
  await ordersModel.create({ 
    email:data.email,
     orderID:order?order.data.payment_keys[0].order_id:''
    ,country: data.country,
    firstName: data.firstName,
    lastName: data.lastName,
    address: data.address,
    apartment: data.apartment,
    postalZip: data.postalZip,
    city: data.city ,
    state:data.state ,
    phone:data.phone ,
    cash: data.cash, // Payment method: Cash or not
    cart: items,
    total: data.total,
    subTotal:data.subTotal,
    billingCountry: data.billingCountry,
    billingFirstName: data.billingFirstName,
    billingState:data.billingState,
    billingLastName: data.billingLastName,
    billingEmail: data.billingEmail,
    billingPhone: data.billingPhone,
    billingAddress: data.billingAddress,
    billingApartment: data.billingApartment, 
    billingPostalZip: data.billingPostalZip, 
  })
  return NextResponse.json({token:order.data.client_secret}, { status: 200 })
}

      

      

        // return NextResponse.json({token:payment.data.token}, { status: 200 })
      }
    catch(error:any){
        console.error(error);
                return NextResponse.json({ message: 'Internal server error please try again later', error: error.message }, { status: 500 });

    }
  }

}