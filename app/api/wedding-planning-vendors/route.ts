import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import weddingPlanningVendorsModel from "@/app/modals/weddingPlanningVendors";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const subCategoryID = searchParams.get("subCategoryID");

    if (!subCategoryID) {
      return NextResponse.json(
        { error: "subCategoryID is required" },
        { status: 400 }
      );
    }

    const vendors = await weddingPlanningVendorsModel
      .find({ subCategoryID, active: true })
      .sort({ visitedCount: -1 });

    return NextResponse.json({ data: vendors });
  } catch (error) {
    console.error("Error fetching wedding planning vendors:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
