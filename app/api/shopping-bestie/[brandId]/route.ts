import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import ShoppingBrandModel from "@/app/modals/shoppingBestieModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

interface Params {
  params: { brandId: string };
}

// ─── GET /api/shopping-bestie/[brandId] ──────────────────────────────────────
// Public: returns a single brand INCLUDING its reviews
export async function GET(_req: Request, { params }: Params) {
  try {
    await ConnectDB();

    const brand = await ShoppingBrandModel.findOne({
      _id: params.brandId,
      isActive: true,
    })
      .populate("reviews.userId", "username firstName lastName imageURL")
      .lean();

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: brand }, { status: 200 });
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/shopping-bestie/[brandId] ────────────────────────────────────
// Admin-only: update brand fields
// export async function PATCH(request: Request, { params }: Params) {
//   try {
//     await ConnectDB();

//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id || session?.user?.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await request.json();

//     // Prevent overwriting computed/sensitive fields
//     delete body.clicks;
//     delete body.averageRating;
//     delete body.totalRatings;
//     delete body.reviews;

//     const updated = await ShoppingBrandModel.findByIdAndUpdate(
//       params.brandId,
//       { $set: body },
//       { new: true, runValidators: true }
//     );

//     if (!updated) {
//       return NextResponse.json({ error: "Brand not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, data: updated }, { status: 200 });
//   } catch (error) {
//     console.error("Error updating brand:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to update brand" },
//       { status: 500 }
//     );
//   }
// }

// ─── DELETE /api/shopping-bestie/[brandId] ───────────────────────────────────
// Admin-only: soft-delete (sets isActive = false)
// export async function DELETE(_req: Request, { params }: Params) {
//   try {
//     await ConnectDB();

//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id || session?.user?.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const updated = await ShoppingBrandModel.findByIdAndUpdate(
//       params.brandId,
//       { $set: { isActive: false } },
//       { new: true }
//     );

//     if (!updated) {
//       return NextResponse.json({ error: "Brand not found" }, { status: 404 });
//     }

//     return NextResponse.json(
//       { success: true, message: "Brand deactivated" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error deleting brand:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to delete brand" },
//       { status: 500 }
//     );
//   }
// }
