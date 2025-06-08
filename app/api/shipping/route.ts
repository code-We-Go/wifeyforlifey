import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongodb';


const loadDB =async()=>{
    console.log('hna');
    await ConnectDB();
}

loadDB();

export async function GET(request: Request) {
    const client = await clientPromise;
    const db = client.db('mamilk'); // Replace with your database name

    try {
      console.log("zonezzzz")
      const zones = await db.collection('shipping_zones').find({})
      .toArray();
  
      if (!zones) {
        return NextResponse.json({ message: "Products not found" }, { status: 404 });
      }
  
      // console.log("Zones found:", zones);
      return NextResponse.json(zones);
    } catch (err) {
      console.error("Error fetching product:", err);
      return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
  }