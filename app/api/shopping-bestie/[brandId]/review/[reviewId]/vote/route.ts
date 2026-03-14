import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ShoppingBrandModel from "@/app/modals/shoppingBestieModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import mongoose from "mongoose";

interface Params {
  params: Promise<{ brandId: string; reviewId: string }>;
}

// ─── POST /api/shopping-bestie/[brandId]/review/[reviewId]/vote ───────────────
// Authenticated users can toggle a helpful / notHelpful vote on a review.
// - If the user hasn't voted: adds their userId to the chosen array ($addToSet)
//   and removes it from the opposite array ($pull) so only one vote is active.
// - If the user already voted the same way: removes their vote ($pull) — toggle off.
// Body: { vote: "helpful" | "notHelpful" }
// Returns the updated helpful / notHelpful counts (array lengths).
export async function POST(request: Request, { params }: Params) {
  try {
    await ConnectDB();

    const { brandId, reviewId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { vote } = body;

    if (vote !== "helpful" && vote !== "notHelpful") {
      return NextResponse.json(
        { error: 'vote must be "helpful" or "notHelpful"' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const reviewObjId = new mongoose.Types.ObjectId(reviewId);

    // Check current state — has this user already voted this way?
    const brand = await ShoppingBrandModel.findOne(
      { _id: brandId, isActive: true },
      { reviews: { $elemMatch: { _id: reviewObjId } } }
    );

    if (!brand || !brand.reviews?.length) {
      return NextResponse.json(
        { error: "Brand or review not found" },
        { status: 404 }
      );
    }

    const review = brand.reviews[0];
    const alreadyVoted = (review[vote] as mongoose.Types.ObjectId[]).some(
      (id) => id.equals(userId)
    );

    const chosenField = `reviews.$.${vote}`;
    const oppositeField =
      vote === "helpful" ? "reviews.$.notHelpful" : "reviews.$.helpful";

    let updateOp: object;

    if (alreadyVoted) {
      // Toggle off — remove the vote
      updateOp = { $pull: { [chosenField]: userId } };
    } else {
      // Add vote on chosen side, remove from opposite (switch vote)
      updateOp = {
        $addToSet: { [chosenField]: userId },
        $pull: { [oppositeField]: userId },
      };
    }

    const updated = await ShoppingBrandModel.findOneAndUpdate(
      { _id: brandId, isActive: true, "reviews._id": reviewObjId },
      updateOp,
      { new: true, select: "reviews" }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Brand or review not found" },
        { status: 404 }
      );
    }

    const updatedReview = updated.reviews.find(
      (r: any) => r._id.toString() === reviewId
    );

    return NextResponse.json({
      success: true,
      helpful: updatedReview?.helpful?.length ?? 0,
      notHelpful: updatedReview?.notHelpful?.length ?? 0,
      userVote: alreadyVoted ? null : vote, // null means vote was withdrawn
    });
  } catch (error) {
    console.error("Error voting on review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register vote" },
      { status: 500 }
    );
  }
}
