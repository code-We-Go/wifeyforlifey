import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import blogModel from "@/app/modals/blogModel";
import UserModel from "@/app/modals/userModel";
import InteractionsModel from "@/app/modals/interactionsModel";
import { ConnectDB } from "@/app/config/db";
import mongoose from "mongoose";
import BlogModel from "@/app/modals/blogModel";

// POST - Like/Unlike a blog
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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

    const { slug } = await params;

    // Check if user is subscribed
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // if (!user.isSubscribed) {
    //   return NextResponse.json(
    //     { error: "Subscription required to like blogs" },
    //     { status: 403 }
    //   );
    // }

    const userId = user._id;

    // Find the blog and populate user information for likes
    let blog = await BlogModel.findOne({ slug: slug }).populate({
      path: "likes",
      model: "users",
      select: "username firstName lastName imageURL",
    });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Initialize likes array if it doesn't exist
    if (!blog.likes) {
      blog.likes = [];
    }

    // Check if user already liked the blog
    console.log("userId:", userId, "type:", typeof userId);
    const alreadyLiked = blog.likes.some((like: any) => {
      console.log("id in likes array:", like, "type:", typeof like);
      return like._id.toString() === userId.toString();
    });

    if (alreadyLiked) {
      // Unlike the blog
      console.log("alreadyLiked" + alreadyLiked);
      blog.likes = blog.likes.filter(
        (like: any) => like._id.toString() !== userId.toString()
      );
    } else {
      // Like the blog
      blog.likes.push(new mongoose.Types.ObjectId(userId));
    }

    // Save the updated blog with retry logic for version conflicts
    let retries = 3;
    let saved = false;

    while (retries > 0 && !saved) {
      try {
        await blog.save();

        // Record the interaction for admin dashboard and notifications
        const { parentId, parentType } = await request.json();
        // const findPlaylistByVideoId = async (blogId: string) => {
        //   try {
        //     const playlist = await playlistModel.findOne({ blogs: blogId });
        //     return playlist?._id || null;
        //   } catch (error) {
        //     console.error("Error finding playlist by blog ID:", error);
        //     return null;
        //   }
        // };

        // Get the playlist ID for this blog
        // const playlistId = await findPlaylistByVideoId(blogId);
        await InteractionsModel.create({
          userId: userId,
          notifyUserId: "685ae0dbe9a01f25818f9830",
          broadcast: false,
          link: `${process.env.baseUrl}blogs/${slug}`,
          targetId: slug,
          targetType: "blog",
          actionType: alreadyLiked ? "unlike" : "like",
          parentId: parentId || slug,
          parentType: parentType || "blog",
          read: false,
        });

        saved = true;
      } catch (saveError: any) {
        if (saveError.name === "VersionError" && retries > 1) {
          console.log(
            `Version conflict detected, retrying... (${
              retries - 1
            } attempts left)`
          );
          // Refetch the latest version of the document
          const updatedBlog = await BlogModel.findOne({ slug: slug }).populate({
            path: "likes",
            model: "users",
            select: "username firstName lastName imageURL",
          });
          if (!updatedBlog) {
            throw new Error("Blog not found during retry");
          }

          // Re-apply our changes to the fresh document
          if (alreadyLiked) {
            updatedBlog.likes = updatedBlog.likes.filter(
              (like: any) => like._id.toString() !== userId.toString()
            );
          } else {
            updatedBlog.likes.push(new mongoose.Types.ObjectId(userId));
          }

          blog = updatedBlog;
          retries--;
        } else {
          // If it's not a version error or we're out of retries, rethrow
          throw saveError;
        }
      }
    }

    return NextResponse.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: blog.likes.length,
    });
  } catch (error: any) {
    console.error("Error handling blog like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
