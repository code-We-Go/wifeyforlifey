import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/mobileAuth";
import Interaction from "@/app/modals/interactionsModel";
import User from "@/app/modals/userModel";
import { ConnectDB } from "@/app/config/db";

export async function GET(req: NextRequest) {
  try {
    const { isAuthenticated, user: authUser } = await authenticateRequest(req);

    if (!isAuthenticated || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser._id ? authUser._id.toString() : authUser.id;

    await ConnectDB();

    // Find interactions where the current user is notified
    const notifications = await Interaction.find({
      notifyUserId: userId,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("userId", "firstName lastName imageURL");
    return NextResponse.json({
      notifications,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { isAuthenticated, user: authUser } = await authenticateRequest(req);

    if (!isAuthenticated || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser._id ? authUser._id.toString() : authUser.id;
    const { notificationId, markAll } = await req.json();

    await ConnectDB();

    if (markAll) {
      // Mark all notifications as read
      await Interaction.updateMany(
        { notifyUserId: userId, read: false },
        { read: true }
      );

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    } else if (notificationId) {
      // Mark single notification as read
      await Interaction.findByIdAndUpdate(notificationId, { read: true });

      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      });
    } else {
      return NextResponse.json(
        { error: "Notification ID or markAll flag is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
