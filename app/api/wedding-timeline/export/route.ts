import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import WeddingTimelineModel from "@/app/modals/WeddingTimeline";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export async function POST(req: Request) {
  try {
    await ConnectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Increment the exported counter
    const timeline = await WeddingTimelineModel.findOneAndUpdate(
      { userId: session.user.id },
      { $inc: { exported: 1 } },
      { new: true }
    );

    if (!timeline) {
      return NextResponse.json(
        { error: "Timeline not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, exported: timeline.exported },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error incrementing export counter:", error);
    return NextResponse.json(
      { error: "Failed to track export" },
      { status: 500 }
    );
  }
}
