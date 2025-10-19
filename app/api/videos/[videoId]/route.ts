import { NextRequest, NextResponse } from "next/server";
import videoModel from "@/app/modals/videoModel";
import { ConnectDB } from "@/app/config/db";

// GET - Get a single video by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    await ConnectDB();
    const { videoId } = await params;

    // Find the video
    const video = await videoModel.findById(videoId);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error: any) {
    console.error("Error getting video:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
