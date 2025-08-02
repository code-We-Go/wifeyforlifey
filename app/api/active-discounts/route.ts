import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import discount from "@/app/models/discount";

export async function GET(req: Request) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(req.url);
    const cartTotal = parseFloat(searchParams.get("cartTotal") || "0");
    const redeemType = searchParams.get("redeemType");

    if (redeemType === "Purchase") {
      const activeDiscounts = await discount
        .find({
          isActive: true,
          applicationType: "AUTOMATIC",
          redeemType: { $in: [redeemType, "All"] },
          //   startDate: { $lte: new Date() },
          //   endDate: { $gte: new Date() },
          $or: [
            { minCartValue: { $exists: false } },
            { minCartValue: { $lte: cartTotal } },
          ],
        })
        .select("-__v");
      // console.log("activeDiscounts: "+activeDiscounts +activeDiscounts.length);
      return NextResponse.json({
        success: true,
        discounts: activeDiscounts,
      });
    }
    if (redeemType === "Subscription") {
      const activeDiscounts = await discount
        .find({
          isActive: true,
          applicationType: "AUTOMATIC",
          redeemType: { $in: [redeemType, "All"] },
          //   startDate: { $lte: new Date() },
          //   endDate: { $gte: new Date() },
          // $or: [
          //   { minCartValue: { $exists: false } },
          //   { minCartValue: { $lte: cartTotal } },
          // ],
        })
        .select("-__v");
      // console.log("activeDiscounts: "+activeDiscounts +activeDiscounts.length);
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
