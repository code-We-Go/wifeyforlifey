import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ShoppingBrandModel from "@/app/modals/shoppingBestieModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
// Register models so $lookup can resolve them by collection name
import "@/app/modals/shoppingSubcategoriesModel";
import "@/app/modals/shoppingCategoriesModel";

// ─── GET /api/shopping-bestie ─────────────────────────────────────────────────
// Public: returns active + approved brands with computed reviewCount,
// averageRating, and fully populated subCategoryDocs (each with its parent
// category). A brand can belong to many sub-categories / categories.
export async function GET(request: Request) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // filter by category name
    const sort = searchParams.get("sort");          // "rating" | "visits"

    // Base match — only active AND admin-approved brands
    const matchStage: Record<string, any> = { isActive: true, approved: true };

    // Sort stage
    let sortStage: Record<string, 1 | -1>;
    if (sort === "visits") {
      sortStage = { clicks: -1 };
    } else if (sort === "rating") {
      sortStage = { averageRating: -1, reviewCount: -1 };
    } else {
      sortStage = { isFeatured: -1, averageRating: -1 };
    }

    const pipeline: any[] = [
      { $match: matchStage },

      // ── Compute review stats ─────────────────────────────────────────────
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
          averageRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.rating" }, 1] },
              0,
            ],
          },
        },
      },

      // ── Strip reviews array — loaded on demand per card ──────────────────
      { $project: { reviews: 0 } },

      // ── Step 1: Convert subCategories string array to ObjectIds ──────────
      {
        $addFields: {
          subCatsParsed: {
            $map: {
              input: { $ifNull: ["$subCategories", []] },
              as: "idStr",
              in: {
                $cond: [
                  {
                    $and: [
                      { $eq: [{ $type: "$$idStr" }, "string"] },
                      { $eq: [{ $strLenCP: "$$idStr" }, 24] },
                    ],
                  },
                  { $toObjectId: "$$idStr" },
                  "$$idStr", // keep as is (could be native ObjectId already)
                ],
              },
            },
          },
        },
      },

      // ── Step 2: Lookup ShoppingSubcategory documents ─────────────────────
      {
        $lookup: {
          from: "shoppingsubcategories",
          localField: "subCatsParsed",
          foreignField: "_id",
          as: "_subCatDocs",
        },
      },

      // ── Step 3: Fast Lookup ShoppingCategory for each subcat ──────────────
      { $unwind: { path: "$_subCatDocs", preserveNullAndEmptyArrays: true } },

      // Convert the nested categoryId from string to ObjectId robustly
      {
        $addFields: {
          "_subCatDocs.categoryIdObjectId": {
            $cond: [
              {
                $and: [
                  { $eq: [{ $type: "$_subCatDocs.categoryId" }, "string"] },
                  { $eq: [{ $strLenCP: "$_subCatDocs.categoryId" }, 24] },
                ],
              },
              { $toObjectId: "$_subCatDocs.categoryId" },
              "$_subCatDocs.categoryId", // fallback (in case it's ALREADY an ObjectId)
            ],
          },
        },
      },

      {
        $lookup: {
          from: "shoppingcategories",
          localField: "_subCatDocs.categoryIdObjectId",
          foreignField: "_id",
          as: "_catDoc",
        },
      },

      // $catDoc is an array (lookup always returns array); take first element
      {
        $addFields: {
          "_subCatDocs.categoryName": {
            $ifNull: [
              { $arrayElemAt: ["$_catDoc.name", 0] },
              "Uncategorised",
            ],
          },
          "_subCatDocs.categorySlug": {
            $ifNull: [
              { $arrayElemAt: ["$_catDoc.slug", 0] },
              "",
            ],
          },
        },
      },

      { $project: { _catDoc: 0 } },

      // ── Step 3: Re-group brands, collecting enriched subcat docs ──────────
      {
        $group: {
          _id: "$_id",
          // Restore all scalar fields
          name:          { $first: "$name" },
          logo:          { $first: "$logo" },
          description:   { $first: "$description" },
          link:          { $first: "$link" },
          tags:          { $first: "$tags" },
          clicks:        { $first: "$clicks" },
          isFeatured:    { $first: "$isFeatured" },
          isActive:      { $first: "$isActive" },
          approved:      { $first: "$approved" },
          submittedBy:   { $first: "$submittedBy" },
          createdAt:     { $first: "$createdAt" },
          updatedAt:     { $first: "$updatedAt" },
          reviewCount:   { $first: "$reviewCount" },
          averageRating: { $first: "$averageRating" },
          subCategories: { $first: "$subCategories" },
          // Collect all enriched sub-category documents
          subCategoryDocs: {
            $push: {
              $cond: [
                // Only push if the subcat doc actually exists (preserveNullAndEmpty guard)
                { $gt: [{ $type: "$_subCatDocs._id" }, "missing"] },
                {
                  _id:          "$_subCatDocs._id",
                  name:         "$_subCatDocs.name",
                  slug:         "$_subCatDocs.slug",
                  categoryId:   "$_subCatDocs.categoryId",
                  categoryName: "$_subCatDocs.categoryName",
                  categorySlug: "$_subCatDocs.categorySlug",
                },
                "$$REMOVE",
              ],
            },
          },
        },
      },

      // ── Step 4: Derive helper arrays for easy UI filtering ─────────────────
      // categories: deduplicated list of category names this brand belongs to
      // subCategoryNames: list of subCategory names (for display on the card)
      {
        $addFields: {
          categories: {
            $reduce: {
              input: "$subCategoryDocs",
              initialValue: [],
              in: {
                $cond: [
                  { $in: ["$$this.categoryName", "$$value"] },
                  "$$value",
                  { $concatArrays: ["$$value", ["$$this.categoryName"]] },
                ],
              },
            },
          },
          subCategoryNames: "$subCategoryDocs.name",
        },
      },

      // ── Optional category filter ───────────────────────────────────────────
      ...(category && category !== "All"
        ? [{ $match: { categories: category } }]
        : []),

      { $sort: sortStage },
    ];

    const brands = await ShoppingBrandModel.aggregate(pipeline);

    return NextResponse.json({ success: true, data: brands }, { status: 200 });
  } catch (error) {
    console.error("Error fetching shopping brands:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

// ─── POST /api/shopping-bestie ─────────────────────────────────────────────────
// User-submitted brand suggestion. Created as approved: false.
export async function POST(request: Request) {
  try {
    await ConnectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, link, subCategories, tags, logo } = body;

    if (!name ||  !link || !subCategories || subCategories.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields (name, link, subCategories)" },
        { status: 400 }
      );
    }

    const newBrand = await ShoppingBrandModel.create({
      name,
      description,
      link,
      subCategories,
      tags: tags || [],
      logo,
      approved: false, // Must be approved by admin
      submittedBy: session.user.id,
      isActive: true,
    });

    return NextResponse.json(
      { success: true, data: newBrand, message: "Brand submitted for approval" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting brand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit brand" },
      { status: 500 }
    );
  }
}
