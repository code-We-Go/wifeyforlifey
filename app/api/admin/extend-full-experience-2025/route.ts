import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import mongoose from "mongoose";
import { PACKAGE_IDS } from "@/app/modals/userModel";

/**
 * Admin Script: Extends the expiryDate of all Full Experience subscriptions
 * that were created in 2025 (and are still active) by +3 months.
 *
 * One-off task — safe to preview first via the `dryRun=true` query param.
 *
 * Call:  GET /api/admin/extend-full-experience-2025           → executes the update
 * Call:  GET /api/admin/extend-full-experience-2025?dryRun=true → preview only, no writes
 */
export async function GET(request: Request) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get("dryRun") === "true";

    const packageId = new mongoose.Types.ObjectId(PACKAGE_IDS.FULL_EXPERIENCE);

    // Matches the query you provided:
    // { packageID: ObjectId('687396821b4da119eb1c13fe'), createdAt: { $gte: 2025-01-01, $lte: 2025-12-31 }, subscribed: true }
    const filter = {
      packageID: packageId,
      createdAt: {
        $gte: new Date("2025-01-01T00:00:00.000Z"),
        $lte: new Date("2025-12-31T23:59:59.999Z"),
      },
      subscribed: true,
    };

    // Always fetch matched docs first for reporting
    const matched = await subscriptionsModel
      .find(filter)
      .select("_id email expiryDate createdAt")
      .lean();

    console.log(
      `[extend-full-experience-2025] Found ${matched.length} subscriptions. dryRun=${dryRun}`
    );

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: `Dry run — no changes written. ${matched.length} subscription(s) would be extended by 3 months.`,
        matched: matched.length,
        subscriptions: matched.map((s: any) => ({
          _id: s._id,
          email: s.email,
          currentExpiryDate: s.expiryDate,
          newExpiryDate: addMonths(new Date(s.expiryDate), 3),
          createdAt: s.createdAt,
        })),
      });
    }

    // Execute the bulk update: add 3 months to each expiryDate individually
    // We use a loop so each doc gets its own correct +3 months from its own expiryDate.
    let updatedCount = 0;
    const results: any[] = [];

    for (const sub of matched) {
      const currentExpiry = new Date((sub as any).expiryDate);
      const newExpiry = addMonths(currentExpiry, 3);

      await subscriptionsModel.findByIdAndUpdate((sub as any)._id, {
        $set: { expiryDate: newExpiry },
      });

      updatedCount++;
      results.push({
        _id: (sub as any)._id,
        email: (sub as any).email,
        oldExpiryDate: currentExpiry,
        newExpiryDate: newExpiry,
      });
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      message: `Extended expiryDate by 3 months for ${updatedCount} Full Experience subscription(s).`,
      matched: matched.length,
      updated: updatedCount,
      subscriptions: results,
    });
  } catch (error: any) {
    console.error("[extend-full-experience-2025] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}

/**
 * Adds `months` calendar months to a given Date.
 * Handles month-end edge cases (e.g. Jan 31 + 1 month → Feb 28/29).
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  result.setMonth(targetMonth);

  // If the day overflowed (e.g. Jan 31 → Mar 3), snap back to last day of the intended month
  const intendedMonth = ((targetMonth % 12) + 12) % 12;
  if (result.getMonth() !== intendedMonth) {
    result.setDate(0); // last day of the previous month
  }

  return result;
}
