import { NextResponse } from 'next/server';
import { ConnectDB } from "@/app/config/db";
import { PartnerModel } from '@/app/modals/Partner';

export async function GET(request: Request) {
  try {
    await ConnectDB();
    
    const { searchParams } = new URL(request.url);
    const fieldsParam = searchParams.get('fields');
    
    // If specific fields are requested, use select; otherwise return all
    // Note: client should pass fields comma or space separated
    const projection = fieldsParam ? fieldsParam.split(',').join(' ') : "";

    const partners = await PartnerModel.find({})
      .select(projection)
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ partners }, { status: 200 });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}