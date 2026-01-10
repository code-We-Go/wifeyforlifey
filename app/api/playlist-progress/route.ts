import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/mobileAuth";
import { ConnectDB } from "@/app/config/db";
import UserModel from "@/app/modals/userModel";
import playlistsProgress from "@/app/modals/playlistsProgress";

// GET: fetch playlist progress record for current user
export async function GET(request: NextRequest) {
  try {
    await ConnectDB();
    const { isAuthenticated, user: authUser, authType } = await authenticateRequest(request);

    if (!isAuthenticated || !authUser?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get("playlistId");

    let user = authUser;
    if (authType === "session") {
      user = await UserModel.findOne({ email: authUser.email });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If playlistId is provided, return a single record for that playlist (backwards compatible)
    if (playlistId) {
      const record = await playlistsProgress
        .findOne({ userID: user._id, playlistID: playlistId })
        .lean();

      return NextResponse.json({ success: true, progress: record || null });
    }

    // Otherwise, return all progress records for this user, sorted by most recent update
    const progressList = await playlistsProgress
      .find({ userID: user._id })
      .sort({ updatedAt: -1 })
      .populate({
        path: "playlistID",
        model: "playlists",
        select: "title thumbnailUrl isPublic",
      })
      .populate({
        path: "lastWatchedVideoID",
        model: "videos",
        select: "title thumbnailUrl isPublic url",
      })
      .lean();

    return NextResponse.json({ success: true, progressList });
  } catch (err: any) {
    console.error("GET /api/playlist-progress error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: ensure a playlist progress record exists when user enters playlist
export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const { isAuthenticated, user: authUser, authType } = await authenticateRequest(request);

    if (!isAuthenticated || !authUser?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { playlistId } = await request.json();
    if (!playlistId) {
      return NextResponse.json({ error: "playlistId is required" }, { status: 400 });
    }

    let user = authUser;
    if (authType === "session") {
      user = await UserModel.findOne({ email: authUser.email });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const record = await playlistsProgress.findOneAndUpdate(
      { userID: user._id, playlistID: playlistId },
      {
        $setOnInsert: {
          userID: user._id,
          playlistID: playlistId,
          videosWatched: [],
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, progress: record });
  } catch (err: any) {
    console.error("POST /api/playlist-progress error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: when a video ends, add it to videosWatched and set lastWatchedVideoID
export async function PUT(request: NextRequest) {
  try {
    await ConnectDB();
    const { isAuthenticated, user: authUser, authType } = await authenticateRequest(request);

    if (!isAuthenticated || !authUser?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { playlistId, videoId } = await request.json();
    if (!playlistId || !videoId) {
      return NextResponse.json({ error: "playlistId and videoId are required" }, { status: 400 });
    }

    let user = authUser;
    if (authType === "session") {
      user = await UserModel.findOne({ email: authUser.email });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only mark the video as watched when it ends; do not update lastWatchedVideoID here
    const record = await playlistsProgress.findOneAndUpdate(
      { userID: user._id, playlistID: playlistId },
      { $addToSet: { videosWatched: videoId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, progress: record });
  } catch (err: any) {
    console.error("PUT /api/playlist-progress error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: update lastWatchedVideoID when user starts a new video
export async function PATCH(request: NextRequest) {
  try {
    await ConnectDB();
    const { isAuthenticated, user: authUser, authType } = await authenticateRequest(request);

    if (!isAuthenticated || !authUser?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { playlistId, videoId } = await request.json();
    if (!playlistId || !videoId) {
      return NextResponse.json({ error: "playlistId and videoId are required" }, { status: 400 });
    }

    let user = authUser;
    if (authType === "session") {
      user = await UserModel.findOne({ email: authUser.email });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const record = await playlistsProgress.findOneAndUpdate(
      { userID: user._id, playlistID: playlistId },
      { $set: { lastWatchedVideoID: videoId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, progress: record });
  } catch (err: any) {
    console.error("PATCH /api/playlist-progress error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
