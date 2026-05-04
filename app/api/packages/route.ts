import mongoose from "mongoose";
import packageModel from "@/app/modals/packageModel";
import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";

const loadDB = async () => {
  await ConnectDB();
};

loadDB();


// READ - GET
export async function GET(req: Request) {
  await ConnectDB();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const all = searchParams.get("all") === "true";
  const active = searchParams.get("active");
  const limit = all ? 0 : 10;
  const skip = all ? 0 : (page - 1) * limit;
  const packageID = searchParams.get("packageID");
  const slug = searchParams.get("slug");

  try {
    if (packageID) {
      // Fetch a single package by ID
      const singlePackage = await packageModel.findById(packageID);
      if (!singlePackage) {
        return NextResponse.json({ error: "Package not found" }, { status: 404 });
      }
      return NextResponse.json({ data: singlePackage }, { status: 200 });
    }
    // Create search query
    const searchQuery: any = {};

    if (search) {
      searchQuery.name = { $regex: search, $options: "i" };
    }
//for testing
    if (active !== null) {
      searchQuery.active = active === "true";
    }

    if (slug) {
      searchQuery.slug = slug;
    }

    // Get total count with search filter
    const totalPackages = await packageModel.countDocuments(searchQuery);

    // Get packages with search filter and proper sorting
    const packages = await packageModel
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        data: packages,
        total: totalPackages,
        currentPage: page,
        totalPages: all ? 1 : Math.ceil(totalPackages / limit),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 },
    );
  }
}


