import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import videoModel from "@/app/modals/videoModel";
import UserModel from "@/app/modals/userModel";
import InteractionsModel from "@/app/modals/interactionsModel";
import { ConnectDB } from "@/app/config/db";
import playlistModel from "@/app/modals/playlistModel";

// POST - Like/Unlike a reply
export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ videoId: string; commentId: string; replyId: string }>;
  }
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

    const { videoId, commentId, replyId } = await params;

    // Check if user is subscribed
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isSubscribed) {
      return NextResponse.json(
        { error: "Subscription required to like replies" },
        { status: 403 }
      );
    }

    const userId = user._id.toString();

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

    // Find the reply
    if (!comment.replies || comment.replies.length === 0) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    const replyIndex = comment.replies.findIndex((reply: any) =>
      reply._id && reply._id.toString
        ? reply._id.toString() === replyId
        : reply._id === replyId
    );

    if (replyIndex === -1) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    const reply = comment.replies[replyIndex];

    // Check if user already liked the reply
    const alreadyLiked = reply.likes && reply.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike the reply
      reply.likes = reply.likes.filter((id: string) => id !== userId);
    } else {
      // Like the reply
      if (!reply.likes) {
        reply.likes = [];
      }
      reply.likes.push(userId);
    }

    // Save the updated video
    await video.save();

    // Record the interaction
    const { parentId, parentType } = await request.json();
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
    await InteractionsModel.create({
      notifyUserId: comment.userId,
      link: `${process.env.baseUrl}playlists/${playlistId}?videoId=${videoId}#${commentId}`,
      userId: userId,
      targetId: replyId,
      targetType: "reply",
      actionType: alreadyLiked ? "unlike" : "like",
      parentId: parentId || videoId,
      parentType: parentType || "video",
      read: false,
    });

    return NextResponse.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: reply.likes.length,
    });
  } catch (error: any) {
    console.error("Error handling reply like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
