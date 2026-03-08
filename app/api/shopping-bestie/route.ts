import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ShoppingBrandModel from "@/app/modals/shoppingBestieModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

// ─── GET /api/shopping-bestie ─────────────────────────────────────────────────
// Public: returns all active brands with computed reviewCount + averageRating.
// Uses aggregation to compute stats from the reviews array without sending
// the full reviews payload to the client.
export async function GET(request: Request) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const sort = searchParams.get("sort"); // "rating" | "clicks"

    const matchStage: Record<string, any> = { isActive: true };
    if (category && category !== "All") {
      matchStage.category = category;
    }

    // Determine sort — we can now sort by the computed averageRating
    let sortStage: Record<string, 1 | -1>;
    if (sort === "visits") {
      sortStage = { clicks: -1 };
    } else if (sort === "rating") {
      sortStage = { averageRating: -1, reviewCount: -1 };
    } else {
      sortStage = { isFeatured: -1, averageRating: -1 };
    }

    const brands = await ShoppingBrandModel.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
          averageRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              {
                $round: [{ $avg: "$reviews.rating" }, 1],
              },
              0,
            ],
          },
        },
      },
      // Strip the full reviews array — loaded on demand when a card is expanded
      { $project: { reviews: 0 } },
      { $sort: sortStage },
    ]);

    return NextResponse.json({ success: true, data: brands }, { status: 200 });
  } catch (error) {
    console.error("Error fetching shopping brands:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

// ─── POST /api/shopping-bestie ────────────────────────────────────────────────
// Admin-only: create a new brand
// export async function POST(request: Request) {
//   try {
//     await ConnectDB();

//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id || session?.user?.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await request.json();
//     const {
//       name,
//       logo,
//       category,
//       subCategory,
//       description,
//       link,
//       tags,
//       isFeatured,
//     } = body;

//     if (!name || !category || !subCategory || !description || !link) {
//       return NextResponse.json(
//         { error: "Missing required fields: name, category, subCategory, description, link" },
//         { status: 400 }
//       );
//     }

//     const brand = await ShoppingBrandModel.create({
//       name,
//       logo: logo || "",
//       category,
//       subCategory,
//       description,
//       link,
//       tags: tags || [],
//       isFeatured: isFeatured || false,
//     });

//     return NextResponse.json({ success: true, data: brand }, { status: 201 });
//   } catch (error) {
//     console.error("Error creating shopping brand:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to create brand" },
//       { status: 500 }
//     );
//   }
// }
