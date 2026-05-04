import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import PartnerSessionModel from "@/app/modals/partnerSessionModel";

export async function GET() {
  try {
    await ConnectDB();

    const sessions = await PartnerSessionModel.find({ isActive: true });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error("Error fetching partner sessions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
