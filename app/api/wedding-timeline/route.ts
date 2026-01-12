import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import WeddingTimelineModel from "@/app/modals/WeddingTimeline";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";

export async function GET(req: Request) {
  try {
    await ConnectDB();
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
      const timeline = await WeddingTimelineModel.findOneAndUpdate(
        { userId: userId },
        {
          userId: userId,
          zaffaTime: body.zaffaTime,
          selectedFeatures: body.selectedFeatures || [],
          events: body.events,
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
