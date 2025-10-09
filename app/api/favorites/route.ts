import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/utils/mongodb";
import FavoritesModel from "@/app/modals/favoritesModel";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { ConnectDB } from "@/app/config/db";

// GET /api/favorites - Get all favorites for the current user
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to view favorites" },
        { status: 401 }
      );
    }

    // Check if user has subscription
    const { user } = session;
    if (!(user.subscriptionExpiryDate! > new Date())) {
      return NextResponse.json(
        { error: "You need a subscription to access favorites" },
        { status: 403 }
      );
    }

    // Connect to database
    await ConnectDB();

    // Get query parameters for filtering
    const url = new URL(req.url);
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const category = url.searchParams.get("category");
    const subCategory = url.searchParams.get("subCategory");

    // Build query
    const query: any = {};

    // Add price filter if provided
    if (minPrice || maxPrice) {
      query.$or = [];

      // Case 1: maxPrice is 0 or not set, so price is the actual price
      const priceQuery: any = {};
      if (minPrice) priceQuery.$gte = Number(minPrice);
      if (maxPrice) priceQuery.$lte = Number(maxPrice);

      if (Object.keys(priceQuery).length > 0) {
        // For items where maxPrice is 0 or not set
        query.$or.push({
          $and: [
            { price: priceQuery },
            { $or: [{ maxPrice: 0 }, { maxPrice: { $exists: false } }] },
          ],
        });

        // For items with a price range (where maxPrice > 0)
        query.$or.push({
          $and: [
            { price: { $gte: minPrice ? Number(minPrice) : 0 } },
            {
              maxPrice: {
                $gt: 0,
                $lte: maxPrice ? Number(maxPrice) : Number.MAX_SAFE_INTEGER,
              },
            },
          ],
        });
      }
    }

    // Add category filter if provided
    if (category && category !== "All") {
      query.category = category;
    }

    // Add subCategory filter if provided
    if (subCategory && subCategory !== "All") {
      query.subCategory = subCategory;
    }

    // Fetch favorites
    const favorites = await FavoritesModel.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}
