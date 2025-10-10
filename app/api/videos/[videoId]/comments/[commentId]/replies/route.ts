import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import videoModel from "@/app/modals/videoModel";
import UserModel from "@/app/modals/userModel";
import { ConnectDB } from "@/app/config/db";

// POST - Add a reply to a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { videoId: string; commentId: string } }
) {
  try {
    await ConnectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { videoId, commentId } = params;
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Reply text is required" },
        { status: 400 }
      );
    }

    // Check if user is subscribed
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isSubscribed) {
      return NextResponse.json(
        { error: "Subscription required to reply to comments" },
        { status: 403 }
      );
    }

    // Find the video
    const video = await videoModel.findById(videoId);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Find the comment
    if (!video.comments) {
      return NextResponse.json({ error: "No comments found" }, { status: 404 });
    }

    const comment = video.comments.id
      ? video.comments.id(commentId)
      : video.comments.find((c: any) =>
          c._id && c._id.toString
            ? c._id.toString() === commentId
            : c._id === commentId
        );
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Create the reply
    const newReply = {
      userId: user._id.toString(),
      username: user.username,
      text: text.trim(),
      likes: [],
      createdAt: new Date(),
    };

    // Add the reply to the comment
    if (!comment.replies) {
      comment.replies = [];
    }

    comment.replies.push(newReply);
    await video.save();

    return NextResponse.json({
      success: true,
      reply: newReply,
    });
  } catch (error: any) {
    console.error("Error adding reply to comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}