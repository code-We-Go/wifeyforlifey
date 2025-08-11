import { NextResponse } from "next/server";
import banners from "@/app/modals/bannersModel";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  //   await dbConnect();
  const bannersData = await banners.findOne();
  console.log(bannersData, "bannersData in GET");
  return NextResponse.json({
    bannersData: bannersData,
  });
}
