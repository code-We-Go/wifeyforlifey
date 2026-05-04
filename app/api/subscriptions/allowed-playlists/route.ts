import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { ConnectDB } from "@/app/config/db";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const { playlistId, subscriptionId } = await request.json();
    console.log("subscriptionId"+subscriptionId)
    
    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
      return NextResponse.json({ error: "Valid playlistId is required" }, { status: 400 });
    }

    let subscription;

    // Check if subscriptionId is provided (for mini subscription verification flow)
    if (subscriptionId) {
      if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
        return NextResponse.json({ error: "Valid subscriptionId is required" }, { status: 400 });
      }
      subscription = await subscriptionsModel.findById(subscriptionId);
    } else {
      // Otherwise, use authenticated session
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      subscription = await subscriptionsModel.findOne({ email: session.user.email, subscribed: true });
    }

    if (!subscription) {
      return NextResponse.json({ error: "Active subscription not found" }, { status: 404 });
    }

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6);

    const existingIndex = (subscription as any).allowedPlaylists?.findIndex(
      (p: any) => p.playlistID?.toString() === playlistId
    );

    if (existingIndex !== undefined && existingIndex! >= 0) {
      (subscription as any).allowedPlaylists[existingIndex].expiryDate = expiryDate;
    } else {
      (subscription as any).allowedPlaylists = [
        ...((subscription as any).allowedPlaylists || []),
        { playlistID: new mongoose.Types.ObjectId(playlistId), expiryDate },
      ];
    }

    // Set miniSubscriptionActivated to true when playlist is added
    (subscription as any).miniSubscriptionActivated = true;

    await subscription.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating allowed playlists:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
