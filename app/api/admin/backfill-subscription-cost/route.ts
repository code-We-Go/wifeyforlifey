import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import packageModel from "@/app/modals/packageModel";

/**
 * Migration Script: Backfills the `cost` field on all subscription records
 * by reading the `cost` value from the linked package document.
 *
 * One-off task — safe to re-run (idempotent: only updates docs where cost is missing).
 *
 * Call: GET /api/admin/backfill-subscription-cost
 */
export async function GET() {
  try {
    await ConnectDB();

    // Ensure packageModel is registered for populate
    void packageModel;

    // Find subscriptions that have no cost yet but have a packageID
    const subscriptions = await subscriptionsModel
      .find({ cost: { $exists: false }, packageID: { $exists: true, $ne: null } })
      .populate<{ packageID: { cost?: number } | null }>("packageID")
      ;

    console.log(`Found ${subscriptions.length} subscriptions missing cost.`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const sub of subscriptions) {
      const pkg = sub.packageID as any;

      if (typeof pkg?.cost !== "number") {
        // Package has no cost defined — skip
        skippedCount++;
        continue;
      }

      await subscriptionsModel.findByIdAndUpdate((sub as any)._id, {
        $set: { cost: pkg.cost },
      });

      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: "Backfill completed.",
      found: subscriptions.length,
      updated: updatedCount,
      skipped: skippedCount,
    });
  } catch (error: any) {
    console.error("Backfill Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An error occurred during backfill.",
      },
      { status: 500 }
    );
  }
}
