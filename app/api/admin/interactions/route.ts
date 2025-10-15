import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import InteractionsModel from "@/app/modals/interactionsModel";
import UserModel from "@/app/modals/userModel";
import { ConnectDB } from "@/app/config/db";

// GET - Get interactions for admin dashboard
export async function GET(request: NextRequest) {
  try {
    await ConnectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type"); // Filter by interaction type
    const userId = searchParams.get("userId"); // Filter by user
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Build query
    const query: any = {};
    
    if (type) {
      query.actionType = type;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    if (unreadOnly) {
      query.read = false;
    }

    // Get total count for pagination
    const total = await InteractionsModel.countDocuments(query);
    
    // Get interactions with pagination
    const interactions = await InteractionsModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "username firstName lastName imageURL")
      .lean();

    // Get interaction counts by type
    const interactionCounts = await InteractionsModel.aggregate([
      { $group: { _id: "$actionType", count: { $sum: 1 } } }
    ]);
    
    // Get recent activity summary
    const recentActivity = await InteractionsModel.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { 
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      success: true,
      interactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      stats: {
        interactionCounts,
        recentActivity
      }
    });
  } catch (error: any) {
    console.error("Error getting interactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Mark interactions as read
export async function PATCH(request: NextRequest) {
  try {
    await ConnectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { interactionIds } = await request.json();
    
    if (!interactionIds || !Array.isArray(interactionIds)) {
      return NextResponse.json(
        { error: "Invalid interaction IDs" },
        { status: 400 }
      );
    }

    // Mark interactions as read
    await InteractionsModel.updateMany(
      { _id: { $in: interactionIds } },
      { $set: { read: true } }
    );

    return NextResponse.json({
      success: true,
      message: `${interactionIds.length} interactions marked as read`
    });
  } catch (error: any) {
    console.error("Error updating interactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}