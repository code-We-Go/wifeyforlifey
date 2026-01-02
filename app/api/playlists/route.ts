import mongoose from "mongoose";
import playlistModel from "@/app/modals/playlistModel";
import videoModel from "@/app/modals/videoModel";
import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/mobileAuth";

const loadDB = async () => {
  await ConnectDB();
};

loadDB();
console.log("reagistering" + videoModel);

export async function POST(req: Request) {
  // Authenticate the request
  const { isAuthenticated, user } = await authenticateRequest(req);

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const data = await req.json();
    console.log("Creating playlist:", data);
    const newPlaylist = await playlistModel.create(data);
    return NextResponse.json({ data: newPlaylist }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating playlist:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Authenticate the request
  const { isAuthenticated, user } = await authenticateRequest(request);

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const req = await request.json();
    console.log("Deleting playlist:", req.playlistID);

    const res = await playlistModel.findByIdAndDelete(req.playlistID);
    if (!res) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: res }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Authenticate the request
  const { isAuthenticated, user } = await authenticateRequest(request);

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const playlistID = searchParams.get("playlistID");
    const req = await request.json();

    console.log("Updating playlist:", playlistID, req);

    const res = await playlistModel.findByIdAndUpdate(playlistID, req, {
      new: true,
      runValidators: true,
    });

    if (!res) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: res }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating playlist:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Authenticate the request using our mixed auth middleware
  const { isAuthenticated, user } = await authenticateRequest(req);

  // Check if user is authenticated
  // if (!isAuthenticated) {
  //   return NextResponse.json(
  //     { error: "Authentication required" },
  //     { status: 401 }
  //   );
  // }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const all = searchParams.get("all") === "true";
  const limit = all ? 0 : 10;
  const skip = all ? 0 : (page - 1) * limit;
  const featured = searchParams.get("featured") === "true";

  try {
    // Create search query
    let searchQuery: any = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    if (featured) {
      searchQuery = { ...searchQuery, featured: true };
    }

    // Get total count
    const totalPlaylists = await playlistModel.countDocuments(searchQuery);

    // Get playlists with populated videos and pagination
    const playlists = await playlistModel
      .find(searchQuery)
      .populate({
        path: "videos",
        model: "videos",
        select: "title description thumbnailUrl duration isPublished",
      })
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (playlists.length > 0) {
      console.log("sort" + playlists[0].title);
    }

    return NextResponse.json(
      {
        data: playlists,
        total: totalPlaylists,
        currentPage: page,
        totalPages: all ? 1 : Math.ceil(totalPlaylists / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}
