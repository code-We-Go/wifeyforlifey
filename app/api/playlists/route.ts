import mongoose from "mongoose";
import playlistModel from "@/app/modals/playlistModel";
import videoModel from "@/app/modals/videoModel";
import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";
import packageModel from "@/app/modals/packageModel";

export async function GET(req: Request) {
  await ConnectDB();
  // Authenticate the request using our mixed auth middleware
  // const { isAuthenticated, user } = await authenticateRequest(req);

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
  const packageId = searchParams.get("packageId");

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

    if (packageId) {
      const pkg = await packageModel.findById(packageId);
      if (pkg && pkg.packagePlaylists && pkg.packagePlaylists.length > 0) {
        searchQuery = { ...searchQuery, _id: { $in: pkg.packagePlaylists } };
      } else {
        // If package doesn't exist or has no playlists, return empty
        return NextResponse.json(
          {
            data: [],
            total: 0,
            currentPage: page,
            totalPages: 1,
          },
          { status: 200 }
        );
      }
    }

    searchQuery = { ...searchQuery, isPublic: true };

    // Get total count
    const totalPlaylists = await playlistModel.countDocuments(searchQuery);

    // Get playlists with populated videos and pagination
    const playlists = await playlistModel
      .find(searchQuery)
      .populate({
        path: "videos",
        model: "videos",
        select: "title description thumbnailUrl duration isPublished playlistFolder",
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
