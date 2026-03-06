import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ShoppingBrandModel from "@/app/modals/shoppingBestieModel";
import UserModel from "@/app/modals/userModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import subscriptionsModel from "@/app/modals/subscriptionsModel";

interface Params {
  params: { brandId: string };
}

// ─── POST /api/shopping-bestie/[brandId]/review ───────────────────────────────
// Subscribed users only. Enforces one review per user per brand.
// Atomically pushes the review and recalculates averageRating + totalRatings.
export async function POST(request: Request, { params }: Params) {
  try {
    await ConnectDB();

    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Subscription check — look up by email in the subscriptions collection
    //    and verify expiryDate is still in the future.
    const user = await UserModel.findById(session.user.id).select(
      "email username firstName lastName"
    );
    if (!user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subscription = await subscriptionsModel.findOne({
      email: user.email,
      subscribed: true,
    }).select("expiryDate");

    const expiryDate = subscription?.expiryDate
      ? new Date(subscription.expiryDate)
      : null;

    if (!expiryDate || expiryDate <= new Date()) {
      return NextResponse.json(
        { error: "An active subscription is required to leave a review" },
        { status: 403 }
      );
    }

    // 3. Parse body
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    // 4. Check if the user has already reviewed this brand
    const brand = await ShoppingBrandModel.findOne({
      _id: params.brandId,
      isActive: true,
      "reviews.userId": session.user.id,
    });

    if (brand) {
      return NextResponse.json(
        { error: "You have already reviewed this brand" },
        { status: 409 }
      );
    }

    // 5. Build the display name for the review
    const displayName =
      user.firstName
        ? `${user.firstName}${user.lastName ? " " + user.lastName[0] + "." : ""}`
        : user.username || "Anonymous";

    // 6. Atomically push review and recompute average
    //    We use findOneAndUpdate with $push then a second update for the average,
    //    or do it in a single aggregation pipeline update (MongoDB 4.2+).
    const updatedBrand = await ShoppingBrandModel.findOneAndUpdate(
      { _id: params.brandId, isActive: true },
      [
        {
          $set: {
            reviews: {
              $concatArrays: [
                "$reviews",
                [
                  {
                    userId: { $toObjectId: session.user.id },
                    userName: displayName,
                    rating: rating,
                    comment: comment ? comment.trim() : "",
                    helpful: 0,
                    notHelpful: 0,
                    createdAt: "$$NOW",
                    updatedAt: "$$NOW",
                  },
                ],
              ],
            },
            totalRatings: { $add: ["$totalRatings", 1] },
            averageRating: {
              $round: [
                {
                  $divide: [
                    { $add: [{ $multiply: ["$averageRating", "$totalRatings"] }, rating] },
                    { $add: ["$totalRatings", 1] },
                  ],
                },
                1,
              ],
            },
          },
        },
      ],
      { new: true }
    );

    if (!updatedBrand) {
      return NextResponse.json(
        { error: "Brand not found or inactive" },
        { status: 404 }
      );
    }

    // Return the newly added review (last item in the array)
    const newReview = updatedBrand.reviews[updatedBrand.reviews.length - 1];

    return NextResponse.json(
      {
        success: true,
        review: newReview,
        averageRating: updatedBrand.averageRating,
        totalRatings: updatedBrand.totalRatings,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

// ─── GET /api/shopping-bestie/[brandId]/review ────────────────────────────────
// Returns all reviews for a brand (paginated via ?page=1&limit=10)
export async function GET(request: Request, { params }: Params) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    const brand = await ShoppingBrandModel.findOne(
      { _id: params.brandId, isActive: true },
      {
        reviews: { $slice: [skip, limit] },
        totalRatings: 1,
        averageRating: 1,
        name: 1,
      }
    );

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: brand.reviews,
        averageRating: brand.averageRating,
        totalRatings: brand.totalRatings,
        page,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
