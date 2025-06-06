// import { sendMail } from "@/app/lib/email";
// import { generateEmailBody } from "@/app/utils/generateOrderEmail";
// import { ConnectDB } from "@/app/config/db";
// import ordersModel from "@/app/modals/ordersModel";
// import productsModel from "@/app/modals/productsModel"; // Import productsModel
// import axios from "axios";
// import { NextResponse } from "next/server";

// const loadDB = async () => {
//     console.log('hna');
//     await ConnectDB();
// }

// loadDB();

// export async function POST(request: Request) {
//     try {
//         const data = await request.json();
//         console.log('paymentData' + data.total);
//         console.log('subTotal' + data.subTotal);

//         // Map cart items to order items
//         const items = await data.cart.map((item: any) => {
//             return {
//                 productId: item.productId,
//                 productName: item.productName,
//                 price: item.price,
//                 quantity: item.quantity,
//                 color: item.color,
//                 imageUrl: item.imageUrl,
//                 size: item.size
//             }
//         });

//         // Update stock for each item in cart
//         for (const item of items) {
//             const product = await productsModel.findById(item.productId);
//             if (!product) {
//                 return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
//             }

//             // Find the variation with matching color
//             const variation = product.variations.find(
//                 (v: any) => v.color === item.color
//             );
            
//             if (!variation) {
//                 return NextResponse.json({ error: `Color variation not found: ${item.color}` }, { status: 404 });
//             }

//             // Find the size within the variation
//             const size = variation.sizes.find(
//                 (s: any) => s.name === item.size
//             );

//             if (!size) {
//                 return NextResponse.json({ error: `Size not found: ${item.size}` }, { status: 404 });
//             }

//             // Check if enough stock is available
//             if (size.stock < item.quantity) {
//                 return NextResponse.json({ 
//                     error: `Insufficient stock for ${item.productName} (${item.color}, ${item.size})` 
//                 }, { status: 400 });
//             }

//             // Decrease stock
//             size.stock -= item.quantity;

//             // Save the updated product
//             await product.save();
//         }

//         // Create order after stock updates
//         const res = await ordersModel.create({
//             email: data.email,
//             orderID: '',
//             country: data.country,
//             firstName: data.name,
//             lastName: data.lastName,
//             address: data.address,
//             apartment: data.apartment,
//             postalZip: data.postalZip,
//             city: data.city,
//             state: data.state,
//             phone: data.phone,
//             cash: data.cash,
//             cart: items,
//             subTotal: data.subTotal,
//             total: data.total,
//             currency: data.currency,
//             billingCountry: data.billingCountry,
//             billingFirstName: data.billingFirstName,
//             billingState: data.billingState,
//             billingLastName: data.billingLastName,
//             billingEmail: data.billingEmail,
//             billingPhone: data.billingPhone,
//             billingAddress: data.billingAddress,
//             billingApartment: data.billingApartment,
//             billingPostalZip: data.billingPostalZip,
//         });

//         // Send confirmation email
//         await sendMail({
//             to: `${data.email}`,
//             name: "Order Confirmation",
//             subject: "Order Confirmation",
//             body: generateEmailBody(
//                 items,
//                 data.name,
//                 data.phone,
//                 data.email,
//                 data.total,
//                 data.subTotal,
//                 data.shipping,
//                 data.address,
//                 res._id,
//                 data.state
//             )
//         });

//         return NextResponse.json({ token: 'wiig' }, { status: 200 });

//     } catch (error) {
//         console.error('Error processing order:', error);
//         return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//     }
// }