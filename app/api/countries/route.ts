import { ConnectDB } from "@/app/config/db";
import countriesModel from "@/app/modals/countriesModel";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import shippingZones from "@/app/modals/shippingZones";

// // import clientPromise from '../../lib/mongodb';

const loadDB =async()=>{
    console.log('hna');
    await ConnectDB();
}

loadDB();

console.log("register",shippingZones)
export async function GET(request: Request) {
//     const shippingZoneId = new mongoose.Types.ObjectId('677990f0182d49dad7ebb9ee');

// const result = await countriesModel.updateMany(
//   { shipping_zone: { $ne: shippingZoneId } }, // Optional filter
//   { $set: { shipping_zone: shippingZoneId } }
// );

    try {

      const countries = await countriesModel.find({id:65}).populate('shipping_zone').sort({ name: 1 })

      if (!countries) {
        return NextResponse.json({ message: "countries not found" }, { status: 404 });
      }

    //   console.log("countries found:", countries);
      return NextResponse.json(countries);
    } catch (err) {
      console.error("Error fetching product:", err);
      return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
  }
