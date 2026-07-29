import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import mongoose from "mongoose";
import weddingPlanningVendorsModel from "@/app/modals/weddingPlanningVendors";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    // Migration helper: convert single subCategoryID or link to array for legacy DB records
    try {
      await weddingPlanningVendorsModel.updateMany(
        { subCategoryID: { $exists: true, $not: { $type: "array" } } },
        [{ $set: { subCategoryID: ["$subCategoryID"] } }]
      );
      await weddingPlanningVendorsModel.updateMany(
        { link: { $exists: true, $not: { $type: "array" } } },
        [{ $set: { link: ["$link"] } }]
      );
    } catch (migErr) {
      console.warn("Legacy migration warning:", migErr);
    }

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
      const ids = subCategoryIDs.split(",").filter(Boolean);
      const objectIds = ids.map((id) => {
        try {
          return new mongoose.Types.ObjectId(id.trim());
        } catch {
          return id.trim();
        }
      });
      // Matches document if ANY of the selected subCategoryIDs match in the array or scalar field
      query.subCategoryID = { $in: objectIds };
    } else if (subCategoryID) {
      try {
        const objId = new mongoose.Types.ObjectId(subCategoryID);
        query.subCategoryID = { $in: [objId, subCategoryID] };
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
      query.toPrice = { ...query.toPrice, $gt: 0 };
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

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const body = await request.json();

    const {
      name,
      fromPrice,
      toPrice,
      link,
      images,
      coverImage,
      package: pkg,
      notes,
      subCategoryID,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Vendor business name is required" },
        { status: 400 }
      );
    }

    // Process link into array of strings
    let linksArray: string[] = [];
    if (Array.isArray(link)) {
      linksArray = link.map((l) => String(l).trim()).filter(Boolean);
    } else if (typeof link === "string" && link.trim()) {
      linksArray = [link.trim()];
    }

    // Process subCategoryID into array of ObjectIds
    let subCategoryIDsArray: any[] = [];
    if (Array.isArray(subCategoryID)) {
      subCategoryIDsArray = subCategoryID.map((id: any) => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch {
          return id;
        }
      });
    } else if (subCategoryID) {
      try {
        subCategoryIDsArray = [new mongoose.Types.ObjectId(subCategoryID)];
      } catch {
        subCategoryIDsArray = [subCategoryID];
      }
    }

    const newVendor = await weddingPlanningVendorsModel.create({
      name: name.trim(),
      fromPrice: fromPrice ? Number(fromPrice) : undefined,
      toPrice: toPrice ? Number(toPrice) : undefined,
      link: linksArray,
      images: Array.isArray(images) ? images : [],
      coverImage: coverImage ? coverImage.trim() : undefined,
      package: pkg ? pkg.trim() : undefined,
      notes: notes ? notes.trim() : undefined,
      subCategoryID: subCategoryIDsArray,
      active: false, // Inactive by default until approved by admin
      visitedCount: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Vendor request submitted successfully and is pending review.",
        data: newVendor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating vendor request:", error);
    return NextResponse.json(
      { error: "Failed to submit vendor request. Please try again." },
      { status: 500 }
    );
  }
}

