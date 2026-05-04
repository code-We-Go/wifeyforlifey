import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";
import shippingZonesModel from "@/app/modals/shippingZones";

export async function GET(request: Request) {
  try {
    await ConnectDB();
    console.log("Fetching shipping zones...");
    const zones = await shippingZonesModel.find({}).lean();

    if (!zones) {
      return NextResponse.json(
        { message: "Shipping zones not found" },
        { status: 404 }
      );
    }

    // console.log("Zones found:", zones);
    return NextResponse.json(zones);
  } catch (err) {
    console.error("Error fetching shipping zones:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
