import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/mobileAuth";
import videoModel from "@/app/modals/videoModel";
import UserModel from "@/app/modals/userModel";
import InteractionsModel from "@/app/modals/interactionsModel";
import { ConnectDB } from "@/app/config/db";
import playlistModel from "@/app/modals/playlistModel";

// POST - Add a reply to a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string; commentId: string }> }
) {
  try {
    await ConnectDB();
    const { isAuthenticated, user: authUser, authType } = await authenticateRequest(request);

    if (!isAuthenticated || !authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { videoId, commentId } = await params;
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Reply text is required" },
        { status: 400 }
      );
    }

    // Get full user from DB to check subscription
    let user = authUser;
    if (authType === "session") {
      user = await UserModel.findOne({ email: authUser.email });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is subscribed directly from session/user object
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

    // Create the reply with additional fields to match VideoComment structure
    const newReply = {
      userId: user._id.toString(),
      username: user.username || user.firstName || "User",
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

    // Get the newly added reply with its ID from the database
    const savedReply = comment.replies[comment.replies.length - 1];
    const findPlaylistByVideoId = async (videoId: string) => {
      try {
        const playlist = await playlistModel.findOne({ videos: videoId });
        return playlist?._id || null;
      } catch (error) {
        console.error("Error finding playlist by video ID:", error);
        return null;
      }
    };

    // Get the playlist ID for this video
    const playlistId = await findPlaylistByVideoId(videoId);
    // Record the reply interaction
    // const { parentId, parentType } = await request.json();
    await InteractionsModel.create({
      notifyUserId: comment.userId,
      link: `${process.env.baseUrl}playlists/${playlistId}?videoId=${videoId}#${commentId}`,
      userId: user._id,
      targetId: commentId,
      targetType: "comment",
      actionType: "reply",
      parentId: videoId,
      parentType: "video",
      replyId: savedReply._id,
      content: text.trim(),
      read: false,
    });

    // Prepare the response with properly structured user data and the database ID
    const replyWithUserData = {
      ...newReply,
      _id: savedReply._id.toString(), // Include the actual database ID
      userId: {
        _id: user._id.toString(),
        username: user.username,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageURL: user.imageURL || user.image || "",
      },
    };

    return NextResponse.json({
      success: true,
      reply: replyWithUserData,
    });
  } catch (error: any) {
    console.error("Error adding reply to comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
