import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import subscriptionsModel from "@/app/modals/subscriptionsModel";

/**
 * GET /api/admin/sync-bosta-status
 * 
 * Force-updates stuck subscription statuses for subscriptions since Sept 2
 * that have a shipmentID but are stuck at "confirmed".
 * 
 * Query params:
 *   ?dryRun=true   — (default) Preview what would change without updating
 *   ?dryRun=false  — Actually update the subscriptions
 *   ?status=delivered — The status to set (default: "delivered")
 */
export async function GET(request: NextRequest) {
  await ConnectDB();

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") !== "false";
  const targetStatus = searchParams.get("status") || "delivered";

  // Validate target status
  const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"];
  if (!validStatuses.includes(targetStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    // Find subscriptions created since Sept 2 that have a shipmentID but are stuck at "confirmed"
    const sept2 = new Date("2026-09-02T00:00:00Z");
    const stuckSubs = await subscriptionsModel.find({
      createdAt: { $gte: sept2 },
      shipmentID: { $ne: "", $exists: true },
      status: "confirmed",
    });

    console.log(`Found ${stuckSubs.length} stuck subscriptions to update to "${targetStatus}"`);

    const results: any[] = [];
    let updatedCount = 0;

    for (const sub of stuckSubs) {
      if (!dryRun) {
        // Update the subscription
        await subscriptionsModel.findByIdAndUpdate(sub._id, {
          status: targetStatus,
        });

        // Also update sibling subscriptions with the same paymentID
        if (sub.paymentID) {
          const siblingResult = await subscriptionsModel.updateMany(
            {
              paymentID: sub.paymentID,
              _id: { $ne: sub._id },
              status: "confirmed",
            },
            { status: targetStatus, shipmentID: sub.shipmentID }
          );
          if (siblingResult.modifiedCount > 0) {
            console.log(
              `Updated ${siblingResult.modifiedCount} sibling(s) for paymentID ${sub.paymentID}`
            );
          }
        }
      }

      updatedCount++;
      results.push({
        subscriptionId: sub._id.toString(),
        shipmentID: sub.shipmentID,
        email: sub.email,
        currentStatus: sub.status,
        newStatus: targetStatus,
        paymentID: sub.paymentID,
        action: dryRun ? "would_update" : "updated",
      });
    }

    return NextResponse.json({
      dryRun,
      targetStatus,
      totalStuck: stuckSubs.length,
      updated: updatedCount,
      results,
    });
  } catch (error: any) {
    console.error("Sync Bosta status error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
