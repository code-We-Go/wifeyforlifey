import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/utils/mongodb";
import FavoritesModel from "@/app/modals/favoritesModel";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { ConnectDB } from "@/app/config/db";

// POST /api/favorites/[id]/click - Increment click count for a favorite
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    console.log("theID" + id);
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    // Connect to database
    await ConnectDB();

    // Increment click count
    const updatedFavorite = await FavoritesModel.findByIdAndUpdate(
      id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    if (!updatedFavorite) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      clickCount: updatedFavorite.clickCount,
    });
  } catch (error) {
    console.error("Error incrementing click count:", error);
    return NextResponse.json(
      { error: "Failed to update click count" },
      { status: 500 }
    );
  }
}
