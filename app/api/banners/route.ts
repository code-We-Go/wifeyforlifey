import { NextResponse } from "next/server";
import banners from "@/app/modals/bannersModel";
import dbConnect from "@/lib/mongodb";
import { ConnectDB } from "@/app/config/db";

export async function GET() {
  await ConnectDB();
  
  //   await dbConnect();
  const bannersData = await banners.findOne();
  console.log(bannersData, "bannersData in GET");
  return NextResponse.json({
    bannersData: bannersData,
  });
}
