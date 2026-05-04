import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/mobileAuth";
import { connectToDatabase } from "@/utils/mongodb";
import FavoritesModel from "@/app/modals/favoritesModel";
import UserModel from "@/app/modals/userModel";
import { ConnectDB } from "@/app/config/db";
import subscriptionsModel from "@/app/modals/subscriptionsModel";

// GET /api/favorites - Get all favorites for the current user
export async function GET(req: NextRequest) {
  await ConnectDB();
  // Connect to database
  try {
    // Check authentication
    const {
      isAuthenticated,
      user: authUser,
      authType,
    } = await authenticateRequest(req);

    if (!isAuthenticated || !authUser) {
      console.warn("[favorites] Unauthenticated request");
      return NextResponse.json(
        { error: "You must be logged in to view favorites" },
        { status: 401 }
      );
    }
    
    console.log(`[favorites] Auth OK — email: ${authUser.email}, authType: ${authType}`);
    
    console.log("register" + subscriptionsModel);

    let user = authUser;
    const subscription = await subscriptionsModel.findOne({ email: user.email })
    // if (authType === "session") {
    //   console.log(`[favorites] DB user lookup — found: ${!!user}, subscription: ${JSON.stringify(subscription)}`);
    // }

    if (!user) {
      console.warn(`[favorites] User not found in DB for email: ${authUser.email}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has subscription
    const expiryDate = subscription.expiryDate
      ? new Date(subscription.expiryDate)
      : null;

    console.log(`[favorites] Subscription expiryDate: ${expiryDate}, now: ${new Date()}, valid: ${!!expiryDate && expiryDate > new Date()}`);

    if (!expiryDate || !(expiryDate > new Date())) {
      console.warn(`[favorites] Subscription expired or missing for: ${authUser.email}`);
      return NextResponse.json(
        { error: "You need a subscription to access favorites" },
        { status: 403 }
      );
    }

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

    console.log(`[favorites] DB query: ${JSON.stringify(query)}`);

    // Fetch favorites
    const favorites = await FavoritesModel.find(query).sort({ createdAt: -1 });

    console.log(`[favorites] Found ${favorites.length} favorite(s) for: ${authUser.email}`);

    if (favorites.length === 0) {
      // Extra diagnostic: count ALL documents in the collection ignoring the query
      const totalInCollection = await FavoritesModel.countDocuments({});
      console.warn(`[favorites] 0 results returned — total docs in collection: ${totalInCollection}, query used: ${JSON.stringify(query)}`);
    }

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("[favorites] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}
