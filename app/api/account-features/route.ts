import { NextResponse } from "next/server";
import accountFeatureModel from "@/app/modals/accountFeatureModel";
import { ConnectDB } from "@/app/config/db";

export async function GET() {
  try {
    await ConnectDB();
    const features = await accountFeatureModel.find({});
    return NextResponse.json({ success: true, data: features });
  } catch (error) {
    console.error("Error fetching account features:", error);
    return NextResponse.json(
      { success: false, message: "Server error fetching features" },
      { status: 500 }
    );
  }
}
