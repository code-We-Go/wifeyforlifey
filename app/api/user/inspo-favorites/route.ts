import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/mobileAuth";
import UserModel from "@/app/modals/userModel";
import { ConnectDB } from "@/app/config/db";
import InspoModel from "@/app/modals/insposModel";

export async function GET(req: NextRequest) {
  try {
    const { isAuthenticated, user: authUser, authType } = await authenticateRequest(req);

    if (!isAuthenticated || !authUser?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await ConnectDB();

    let user = authUser;
    if (authType === "session") {
      user = await UserModel.findOne({ email: authUser.email });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const favorites = Array.isArray(user.inspoFavorites)
      ? user.inspoFavorites
      : [];

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Error fetching inspo favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspo favorites" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { isAuthenticated, user: authUser, authType } = await authenticateRequest(req);

    if (!isAuthenticated || !authUser?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await ConnectDB();

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { imagePublicId } = body;

    if (!imagePublicId || typeof imagePublicId !== "string") {
      return NextResponse.json(
        { error: "imagePublicId is required" },
        { status: 400 }
      );
    }

    // Always fetch a fresh Mongoose document so .save() works for all auth types.
    // JWT auth returns a plain JS object (via toObject()) which lacks .save().
    const user = await UserModel.findOne({ email: authUser.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentFavorites = Array.isArray(user.inspoFavorites)
      ? user.inspoFavorites
      : [];

    const exists = currentFavorites.includes(imagePublicId);
    const updatedFavorites = exists
      ? currentFavorites.filter((id: string) => id !== imagePublicId)
      : [...currentFavorites, imagePublicId];

    user.inspoFavorites = updatedFavorites;

    try {
      await user.save();
    } catch (saveError) {
      console.error("Error saving user favorites:", saveError);
      return NextResponse.json(
        { error: "Failed to save favorites" },
        { status: 500 }
      );
    }

    try {
      const incValue = exists ? -1 : 1;
      await InspoModel.updateMany(
        { "sections.images.public_id": imagePublicId },
        {
          $inc: {
            "sections.$[].images.$[img].favoriteCount": incValue,
          },
        },
        {
          arrayFilters: [{ "img.public_id": imagePublicId }],
        }
      );
    } catch (error) {
      console.error("Error updating inspo favoriteCount:", error);
      // Non-critical — still return success since the user's favorites were saved
    }

    return NextResponse.json({
      favorites: updatedFavorites,
      favorited: !exists,
    });
  } catch (error: any) {
    console.error("Error updating inspo favorites:", error);
    return NextResponse.json(
      { 
        error: "Failed to update inspo favorites", 
        details: error?.message || error?.toString() || "Unknown error" 
      },
      { status: 500 }
    );
  }
}
