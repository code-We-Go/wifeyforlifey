import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import { DiscountModel } from "@/app/modals/Discount";

export async function GET(req: Request) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(req.url);
    const cartTotal = parseFloat(searchParams.get("cartTotal") || "0");
    console.log("cartTotal" + cartTotal);
    const redeemType = searchParams.get("redeemType");

    if (redeemType === "Purchase") {
      const activeDiscounts = await DiscountModel.find({
        isActive: true,
        applicationType: "AUTOMATIC",
        redeemType: { $in: [redeemType, "All"] },
        "conditions.validFrom": { $lte: new Date() },
        "conditions.validUntil": { $gte: new Date() },
        $or: [
          { "conditions.minimumOrderAmount": { $exists: false } },
          { "conditions.minimumOrderAmount": { $lte: cartTotal } },
        ],
      }).select("-__v");

      return NextResponse.json({
        success: true,
        discounts: activeDiscounts,
      });
    }
    if (redeemType === "Subscription") {
      const activeDiscounts = await DiscountModel.find({
        isActive: true,
        applicationType: "AUTOMATIC",
        redeemType: { $in: [redeemType, "All"] },
        "conditions.validFrom": { $lte: new Date() },
        "conditions.validUntil": { $gte: new Date() },
        $or: [
          { "conditions.minimumOrderAmount": { $exists: false } },
          { "conditions.minimumOrderAmount": { $lte: cartTotal } },
        ],
      }).select("-__v");

      return NextResponse.json({
        success: true,
        discounts: activeDiscounts,
      });
    }
    // Find all active automatic discounts
  } catch (error) {
    console.error("Error fetching active discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch active discounts" },
      { status: 500 }
    );
  }
}
