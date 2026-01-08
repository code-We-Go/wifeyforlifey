import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import WeddingTimelineModel from "@/app/modals/WeddingTimeline";

export async function POST(req: Request) {
  try {
    await ConnectDB();
    const body = await req.json();

    // Validate basics
    if (!body.startTime || !body.weddingStartTime || !body.events) {
      return NextResponse.json(
        { error: "Missing required fields: startTime, weddingStartTime or events" },
        { status: 400 }
      );
    }

    const newTimeline = await WeddingTimelineModel.create({
      userId: body.userId || null,
      startTime: body.startTime,
      weddingStartTime: body.weddingStartTime,
      events: body.events,
    });

    return NextResponse.json(
      { success: true, data: newTimeline },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving wedding timeline:", error);
    return NextResponse.json(
      { error: "Failed to save timeline" },
      { status: 500 }
    );
  }
}
