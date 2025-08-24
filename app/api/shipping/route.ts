import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";
import shippingZonesModel from "@/app/modals/shippingZones";

const loadDB = async () => {
  console.log("hna");
  await ConnectDB();
};

loadDB();

export async function GET(request: Request) {
  try {
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
