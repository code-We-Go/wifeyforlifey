import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import Popup from "@/models/Popup";

export async function GET(req: NextRequest) {
  try {
    await ConnectDB();
    
    // Find the active popup
    const activePopup = await Popup.findOne({ active: true });
    
    if (!activePopup) {
      return NextResponse.json({ 
        success: false, 
        message: "No active popup found" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      popup: activePopup 
    });
  } catch (error) {
    console.error("Error fetching popup:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch popup" 
    }, { status: 500 });
  }
}