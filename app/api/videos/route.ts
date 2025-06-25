import mongoose from "mongoose";
import videoModel from "@/app/modals/videoModel";
import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";

const loadDB = async () => {
  await ConnectDB();
};

loadDB();

export async function GET(request: Request) {
  try {
    await loadDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const isPublic = searchParams.get("isPublic");
    const all = searchParams.get("all") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = all ? 0 : 10;
    const skip = all ? 0 : (page - 1) * limit;

    // Create search query
    const searchQuery: any = {};
    
    if (search) {
      searchQuery.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    if (isPublic !== null && isPublic !== undefined) {
      searchQuery.isPublic = isPublic === "true";
    }

    // Get total count
    const totalVideos = await videoModel.countDocuments(searchQuery);

    // Get videos with pagination
    const videos = await videoModel
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        data: videos,
        total: totalVideos,
        currentPage: page,
        totalPages: all ? 1 : Math.ceil(totalVideos / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await loadDB();
    
    const data = await request.json();
    console.log("Creating video:", data);
    
    const newVideo = await videoModel.create(data);
    return NextResponse.json({ data: newVideo }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating video:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await loadDB();
    
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");
    const data = await request.json();
    
    console.log("Updating video:", videoId, data);
    
    const updatedVideo = await videoModel.findByIdAndUpdate(videoId, data, {
      new: true,
      runValidators: true,
    });
    
    if (!updatedVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    
    return NextResponse.json({ data: updatedVideo }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating video:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await loadDB();
    
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");
    
    console.log("Deleting video:", videoId);
    
    const deletedVideo = await videoModel.findByIdAndDelete(videoId);
    
    if (!deletedVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    
    return NextResponse.json({ data: deletedVideo }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 