import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import mongoose from "mongoose";
import weddingPlanningVendorsModel from "@/app/modals/weddingPlanningVendors";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const subCategoryID = searchParams.get("subCategoryID");
    // Comma-separated list of subcategory IDs to fetch vendors for all subs in a category
    const subCategoryIDs = searchParams.get("subCategoryIDs");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");

    let query: any = {};

    if (subCategoryIDs) {
      console.log("subCategoryIDs", subCategoryIDs);
      // Multiple subcategory IDs — fetch vendors for all of them
      const ids = subCategoryIDs.split(",").filter(Boolean);
      const objectIds = ids.map((id) => {
        try {
          return new mongoose.Types.ObjectId(id.trim());
        } catch {
          return id.trim();
        }
      });
      query.subCategoryID = { $in: objectIds };
    } else if (subCategoryID) {
      // Single subcategory ID
      try {
        query.subCategoryID = new mongoose.Types.ObjectId(subCategoryID);
      } catch {
        query.subCategoryID = subCategoryID;
      }
    } else {
      return NextResponse.json(
        { error: "subCategoryID or subCategoryIDs is required" },
        { status: 400 }
      );
    }

    if (minPrice) {
      query.fromPrice = { $gte: Number(minPrice) };
    }
    if (maxPrice) {
      query.toPrice = { ...query.toPrice, $lte: Number(maxPrice) };
    }

    let sortQuery: any = {};
    if (sortBy === "price") {
      sortQuery.toPrice = sortOrder === "desc" ? -1 : 1;
      // Filter out vendors with no price when sorting by price to avoid "N/A" results at the top
      query.toPrice = { ...query.toPrice, $gt: 0 };
    } else {
      // Default or other sort options
      // sortQuery.visitedCount = -1;
    }

    const vendors = await weddingPlanningVendorsModel
      .find(query)
      .sort(sortQuery);
    console.log("Vendors", vendors);
    return NextResponse.json({ data: vendors });
  } catch (error) {
    console.error("Error fetching wedding planning vendors:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
