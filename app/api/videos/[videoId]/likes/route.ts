import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import videoModel from "@/app/modals/videoModel";
import UserModel from "@/app/modals/userModel";
import {ConnectDB} from "@/app/config/db";

// POST - Like/Unlike a video
export async function POST(
  request: NextRequest,
  { params }: { params: { videoId: string } }
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

    const { videoId } = params;
    
    // Check if user is subscribed
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // if (!user.isSubscribed) {
    //   return NextResponse.json(
    //     { error: "Subscription required to like videos" },
    //     { status: 403 }
    //   );
    // }

    const userId = user._id.toString();
    
    // Find the video and populate user information for likes
    const video = await videoModel.findById(videoId)
      .populate({
        path: 'likes',
        model: 'users',
        select: 'username firstName lastName imageURL'
      });
    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }
    
    // Initialize likes array if it doesn't exist
    if (!video.likes) {
      video.likes = [];
    }
    
    // Check if user already liked the video
    const alreadyLiked = video.likes.includes(userId);
    
    if (alreadyLiked) {
      // Unlike the video
      video.likes = video.likes.filter((id: string) => id !== userId);
    } else {
      // Like the video
      video.likes.push(userId);
    }
    
    // Save the updated video
    await video.save();
    
    return NextResponse.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: video.likes.length
    });
    
  } catch (error: any) {
    console.error("Error handling video like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
