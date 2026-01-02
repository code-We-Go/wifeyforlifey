import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import InspoModel from "@/app/modals/insposModel";

export async function POST(req: NextRequest) {
  try {
    await ConnectDB();
    const { type, inspoId, sectionId, imagePublicId } = await req.json();

    if (!inspoId) {
      return NextResponse.json({ error: "Missing inspoId" }, { status: 400 });
    }

    let update = {};
    let query: any = { _id: inspoId };
    let options: any = {};

    switch (type) {
      case "view_inspo":
        update = { $inc: { viewCount: 1 } };
        break;

      case "view_section":
        if (!sectionId) {
          return NextResponse.json(
            { error: "Missing sectionId" },
            { status: 400 }
          );
        }
        query = { _id: inspoId, "sections._id": sectionId };
        update = { $inc: { "sections.$.viewCount": 1 } };
        break;

      case "download_image":
        if (!sectionId || !imagePublicId) {
          return NextResponse.json(
            { error: "Missing sectionId or imagePublicId" },
            { status: 400 }
          );
        }
        update = {
          $inc: { "sections.$[sec].images.$[img].downloadCount": 1 },
        };
        options = {
          arrayFilters: [
            { "sec._id": sectionId },
            { "img.public_id": imagePublicId },
          ],
        };
        break;

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const result = await InspoModel.updateOne(query, update, options);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
  }
}
