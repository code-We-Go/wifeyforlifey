import mongoose from "mongoose";
import playlistModel from "@/app/modals/playlistModel";
import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";

const loadDB = async () => {
  await ConnectDB();
};

export async function GET(request: Request) {
  try {
    await loadDB();

    // Extract id from the URL
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid playlist ID" },
        { status: 400 }
      );
    }

    const playlist = await playlistModel.findById(id).populate({
      path: "videos",
      // model: "videoModel",
      select:
        "title description thumbnailUrl duration isPublic isPublished url",
    });

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }
    console.log("videos" + playlist);
    return NextResponse.json({ data: playlist }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching playlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist" },
      { status: 500 }
    );
  }
}
