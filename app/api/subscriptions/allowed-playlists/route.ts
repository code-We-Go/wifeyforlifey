import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { ConnectDB } from "@/app/config/db";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { playlistId } = await request.json();
    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
      return NextResponse.json({ error: "Valid playlistId is required" }, { status: 400 });
    }

    const subscription = await subscriptionsModel.findOne({ email: session.user.email, subscribed: true });
    if (!subscription) {
      return NextResponse.json({ error: "Active subscription not found" }, { status: 404 });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 45);

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

    await subscription.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}