import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ShoppingBrandModel from "@/app/modals/shoppingBestieModel";
import UserModel from "@/app/modals/userModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import mongoose from "mongoose";

interface Params {
  params: Promise<{ brandId: string }>;
}

// ─── POST /api/shopping-bestie/[brandId]/review ───────────────────────────────
// Subscribed users only. Enforces one review per user per brand.
export async function POST(request: Request, { params }: Params) {
  const { brandId } = await params;
  try {
    await ConnectDB();
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Subscription check removed — allow all account holders to review
    const user = await UserModel.findById(session.user.id).select(
      "email username firstName lastName"
    );
    if (!user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Parse body
    const body = await request.json();
    const { rating, comment, images } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    // 4. Check if the user has already reviewed this brand
    const brand = await ShoppingBrandModel.findOne({
      _id: brandId,
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
        ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
        : user.username || "Anonymous";

    // 6. Push the new review (aggregation pipeline to concat safely)
    const updatedBrand = await ShoppingBrandModel.findOneAndUpdate(
      { _id: brandId, isActive: true },
      [
        {
          $set: {
            reviews: {
              $concatArrays: [
                "$reviews",
                [
                  {
                    _id: new mongoose.Types.ObjectId(),
                    userId: { $toObjectId: session.user.id },
                    userName: displayName,
                    rating: rating,
                    comment: comment ? comment.trim() : "",
                    images: Array.isArray(images) ? images : [],
                    helpful: [],
                    notHelpful: [],
                    createdAt: "$$NOW",
                    updatedAt: "$$NOW",
                  },
                ],
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

    // Compute stats from the updated reviews array
    const allReviews = updatedBrand.reviews;
    const totalRatings = allReviews.length;
    const averageRating =
      totalRatings > 0
        ? Math.round((allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalRatings) * 10) / 10
        : 0;

    // Return the newly added review (last item in the array)
    const newReview = allReviews[allReviews.length - 1];

    return NextResponse.json(
      {
        success: true,
        review: newReview,
        averageRating,
        totalRatings,
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
      const { brandId } = await params;


    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    const brand = await ShoppingBrandModel.findOne(
      { _id: brandId, isActive: true },
      { reviews: { $slice: [skip, limit] }, name: 1 }
    );

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Compute stats from sliced reviews (best-effort for pagination)
    const totalRatings = brand.reviews.length;
    const averageRating =
      totalRatings > 0
        ? Math.round((brand.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalRatings) * 10) / 10
        : 0;

    // Collect ALL user IDs: review authors + all voters
    const reviewerIds = brand.reviews.map((r: any) => r.userId).filter(Boolean);
    const voterIds = brand.reviews.flatMap((r: any) => [
      ...(r.helpful || []),
      ...(r.notHelpful || []),
    ]).filter(Boolean);
    const allUserIds = Array.from(new Set([...reviewerIds, ...voterIds].map((id: any) => id.toString())));

    const users = allUserIds.length
      ? await UserModel.find({ _id: { $in: allUserIds } }).select("_id firstName lastName username")
      : [];
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

    // Helper: resolve a userId to a display name object
    const resolveVoter = (id: any) => {
      const uid = id?.toString();
      const u = userMap.get(uid);
      if (!u) return { userId: uid, displayName: "Anonymous" };
      const name =
        u.firstName
          ? `${u.firstName}${u.lastName ? " " + u.lastName : ""}`
          : u.username || "Anonymous";
      return { userId: uid, displayName: name };
    };

    const enrichedReviews = brand.reviews.map((r: any) => {
      const plain = r.toObject ? r.toObject() : { ...r };
      // Reviewer name
      const reviewerUser = userMap.get(plain.userId?.toString());
      if (reviewerUser) {
        plain.firstName = reviewerUser.firstName || "";
        plain.lastName = reviewerUser.lastName || "";
      }
      // Resolve voter arrays to named objects
      plain.helpfulVoters = (plain.helpful || []).map(resolveVoter);
      plain.notHelpfulVoters = (plain.notHelpful || []).map(resolveVoter);
      return plain;
    });

    return NextResponse.json(
      {
        success: true,
        data: enrichedReviews,
        averageRating,
        totalRatings,
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
