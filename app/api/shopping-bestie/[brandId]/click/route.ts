import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ShoppingBrandModel from "@/app/modals/shoppingBestieModel";

interface Params {
  params: Promise<{ brandId: string }>;
}

// ─── POST /api/shopping-bestie/[brandId]/click ────────────────────────────────
// Public (no auth required): atomically increments the brand's click counter.
// Called whenever a user clicks "Visit Store".
export async function POST(_req: Request, { params }: Params) {
  try {
    const { brandId } = await params;
    await ConnectDB();

    const updated = await ShoppingBrandModel.findByIdAndUpdate(
      brandId,
      { $inc: { clicks: 1 } },
      { new: true }
    ).select("clicks");

    if (!updated) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, clicks: updated.clicks },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error recording click:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record click" },
      { status: 500 }
    );
  }
}
