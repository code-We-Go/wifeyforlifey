import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import WeddingTimelineModel from "@/app/modals/WeddingTimeline";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    await ConnectDB();
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const action = url.searchParams.get("action");

    // If token is provided, fetch shared timeline (public access)
    if (token) {
      const timeline = await WeddingTimelineModel.findOne({
        shareToken: token,
      });

      if (!timeline) {
        return NextResponse.json(
          { error: "Timeline not found" },
          { status: 404 }
        );
      }

      // Return only the necessary data for viewing
      return NextResponse.json(
        {
          success: true,
          data: {
            zaffaTime: timeline.zaffaTime,
            events: timeline.events,
          },
        },
        { status: 200 }
      );
    }

    // If action is 'share', return the share URL for authenticated user
    if (action === "share") {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const timeline = await WeddingTimelineModel.findOne({
        userId: session.user.id,
      });

      if (!timeline) {
        return NextResponse.json(
          { error: "No timeline found" },
          { status: 404 }
        );
      }

      if (!timeline.shareToken) {
        return NextResponse.json(
          { error: "Timeline not ready for sharing. Please save your timeline first." },
          { status: 400 }
        );
      }

      const shareUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/wedding-timeline/shared/${timeline.shareToken}`;

      return NextResponse.json(
        { success: true, shareToken: timeline.shareToken, shareUrl },
        { status: 200 }
      );
    }

    // Default: fetch authenticated user's timeline
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const timeline = await WeddingTimelineModel.findOne({
      userId: session.user.id,
    });

    if (!timeline) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    return NextResponse.json({ found: true, data: timeline }, { status: 200 });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ConnectDB();
    const session = await getServerSession(authOptions);
    const body = await req.json();

    // Validate basics
    if (!body.zaffaTime || !body.events) {
      return NextResponse.json(
        { error: "Missing required fields: zaffaTime or events" },
        { status: 400 }
      );
    }

    const userId = session?.user?.id || body.userId;

    if (userId) {
      // Upsert for logged in user
      // Generate shareToken only on creation (setOnInsert)
      const timeline = await WeddingTimelineModel.findOneAndUpdate(
        { userId: userId },
        {
          $set: {
            userId: userId,
            zaffaTime: body.zaffaTime,
            selectedFeatures: body.selectedFeatures || [],
            events: body.events,
          },
          $setOnInsert: {
            shareToken: crypto.randomBytes(16).toString("hex"), // Only set on creation
          },
        },
        { new: true, upsert: true }
      );

      return NextResponse.json(
        { success: true, data: timeline },
        { status: 201 }
      );
    } else {
      // Create new for anonymous (though UI might force login)
      const newTimeline = await WeddingTimelineModel.create({
        userId: null,
        zaffaTime: body.zaffaTime,
        selectedFeatures: body.selectedFeatures || [],
        events: body.events,
        shareToken: crypto.randomBytes(16).toString("hex"), // Generate token upfront
      });

      return NextResponse.json(
        { success: true, data: newTimeline },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Error saving wedding timeline:", error);
    return NextResponse.json(
      { error: "Failed to save timeline" },
      { status: 500 }
    );
  }
}
