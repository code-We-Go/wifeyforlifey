import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import { DiscountModel } from "@/app/modals/Discount";

export async function GET(req: Request) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(req.url);
    const hasCartTotal =
      searchParams.has("cartTotal") && searchParams.get("cartTotal") !== "";
    const cartTotal = hasCartTotal
      ? parseFloat(searchParams.get("cartTotal") || "0")
      : null;
    const redeemType = searchParams.get("redeemType");

    const now = new Date();

    const andConditions: any[] = [
      { isActive: true },
      { applicationType: "AUTOMATIC" },
      {
        $or: [
          { "conditions.validFrom": { $exists: false } },
          { "conditions.validFrom": null },
          { "conditions.validFrom": { $lte: now } },
        ],
      },
      {
        $or: [
          { "conditions.validUntil": { $exists: false } },
          { "conditions.validUntil": null },
          { "conditions.validUntil": { $gte: now } },
        ],
      },
    ];

    if (redeemType) {
      andConditions.push({
        $or: [
          { redeemType: { $in: [redeemType, "All"] } },
          { redeemType: { $exists: false } },
          { redeemType: null },
        ],
      });
    }

    if (hasCartTotal && cartTotal !== null) {
      andConditions.push({
        $or: [
          { "conditions.minimumOrderAmount": { $exists: false } },
          { "conditions.minimumOrderAmount": null },
          { "conditions.minimumOrderAmount": { $lte: cartTotal } },
        ],
      });
    }

    const query = { $and: andConditions };
    const activeDiscounts = await DiscountModel.find(query).select("-__v");

    // Sort discounts to get the highest valid Minimum Order Amount first
    activeDiscounts.sort((a, b) => {
      const minA = a.conditions?.minimumOrderAmount || 0;
      const minB = b.conditions?.minimumOrderAmount || 0;
      return minB - minA;
    });

    return NextResponse.json({
      success: true,
      discounts: activeDiscounts,
    });
  } catch (error) {
    console.error("Error fetching active discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch active discounts" },
      { status: 500 }
    );
  }
}
