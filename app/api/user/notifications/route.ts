import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/mobileAuth";
import InteractionsModel from "@/app/modals/interactionsModel";
import UserModel from "@/app/modals/userModel";
import videoModel from "@/app/modals/videoModel";
import { ConnectDB } from "@/app/config/db";
import mongoose from "mongoose";

// GET - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    await ConnectDB();
    const { isAuthenticated, user: authUser, authType } = await authenticateRequest(request);

    if (!isAuthenticated || !authUser?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user
    let user = authUser;
    if (authType === "session") {
      user = await UserModel.findOne({ email: authUser.email });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userId = user._id;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Find videos created by this user
    const userVideos = await videoModel.find({ userId: userId }).select('_id');
    const userVideoIds = userVideos.map(video => video._id);

    // Build query to find interactions related to user's content
    // This includes likes/comments on user's videos and replies to user's comments
    const query: any = {
      $or: [
        // Interactions on user's videos
        { parentId: { $in: userVideoIds } },
        // Interactions on user's comments
        { targetId: { $in: userVideoIds } }
      ],
      // Exclude user's own interactions
      userId: { $ne: userId.toString() }
    };
    
    if (unreadOnly) {
      query.read = false;
    }

    // Get total count for pagination
    const total = await InteractionsModel.countDocuments(query);
    
    // Get notifications with pagination
    const notifications = await InteractionsModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "username firstName lastName imageURL")
      .lean();

    // Get unread count
    const unreadCount = await InteractionsModel.countDocuments({
      ...query,
      read: false
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Error getting notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    await ConnectDB();
    const { isAuthenticated, user: authUser, authType } = await authenticateRequest(request);

    if (!isAuthenticated || !authUser?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user
    let user = authUser;
    if (authType === "session") {
      user = await UserModel.findOne({ email: authUser.email });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { notificationIds } = await request.json();
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Invalid notification IDs" },
        { status: 400 }
      );
    }

    // Find videos created by this user
    const userVideos = await videoModel.find({ userId: user._id }).select('_id');
    const userVideoIds = userVideos.map(video => video._id.toString());

    // Mark notifications as read (only if they belong to this user's content)
    const result = await InteractionsModel.updateMany(
      { 
        _id: { $in: notificationIds },
        $or: [
          { parentId: { $in: userVideoIds } },
          { targetId: { $in: userVideoIds } }
        ]
      },
      { $set: { read: true } }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error: any) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
