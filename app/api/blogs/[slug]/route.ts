import BlogModel from "@/app/modals/blogModel";
import { ConnectDB } from "@/app/config/db";
import { NextResponse } from "next/server";

// const loadDB = async () => {
//   await ConnectDB();
// };

// loadDB();

// GET - Fetch a single blog by slug and automatically increment view count
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await ConnectDB();
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source");
    const track = searchParams.get("track");

    let blog;

    // By default, automatically increment view count on GET
    // Pass ?track=false to fetch without counting (e.g. preview, admin, or comment section)
    if (track === "false") {
      blog = await BlogModel.findOne({ slug });
    } else {
      const isWeb = source === "web" || source === "website" || req.headers.get("x-platform") === "web";

      const incUpdate: Record<string, number> = {
        viewCount: 1,
      };

      if (isWeb) {
        incUpdate.webViewCount = 1;
      } else {
        // Default to mobile so the mobile app doesn't need to change anything
        incUpdate.mobileViewCount = 1;
      }

      blog = await BlogModel.findOneAndUpdate(
        { slug },
        { $inc: incUpdate },
        { new: true }
      );
    }

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ data: blog }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

// PATCH - Update view count
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await ConnectDB();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { action, source } = body;

    if (!action || action === "increment_view" || action === "view") {
      const isWeb = source === "web" || source === "website";

      const incUpdate: Record<string, number> = {
        viewCount: 1,
      };

      if (isWeb) {
        incUpdate.webViewCount = 1;
      } else {
        // Default to mobile so the mobile app doesn't need any changes
        incUpdate.mobileViewCount = 1;
      }

      const blog = await BlogModel.findOneAndUpdate(
        { slug },
        { $inc: incUpdate },
        { new: true }
      );

      if (!blog) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
      }

      return NextResponse.json({ data: blog }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}
