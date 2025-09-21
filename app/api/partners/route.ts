import { NextResponse } from 'next/server';
import { ConnectDB } from "@/app/config/db";
import { PartnerModel } from '@/app/modals/Partner';

export async function GET() {
  try {
    await ConnectDB();
    
    const partners = await PartnerModel.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ partners }, { status: 200 });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}