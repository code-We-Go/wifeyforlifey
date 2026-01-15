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

    const body = await req.json();
    const { easeOfUse, satisfaction, realistic, timeSaved, comment } = body;

    // Validate that at least one rating is provided or comment is not empty
    if (!easeOfUse && !satisfaction && !realistic && !timeSaved && (!comment || comment.trim() === "")) {
      return NextResponse.json(
        { error: "Please provide at least one rating or comment" },
        { status: 400 }
      );
    }

    // Update the user's timeline with feedback
    const timeline = await WeddingTimelineModel.findOneAndUpdate(
      { userId: session.user.id },
      { 
        $set: { 
          feedback: {
            easeOfUse,
            satisfaction,
            realistic,
            timeSaved,
            comment: comment ? comment.trim() : ""
          } 
        } 
      },
      { new: true }
    );

    if (!timeline) {
      return NextResponse.json(
        { error: "Timeline not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Thank you for your feedback!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}
