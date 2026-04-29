import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import UserModel from "@/app/modals/userModel";
import mongoose from "mongoose";

/**
 * Migration Script: Moves data from singular 'subscription' field to 'subscriptions' array.
 * This is a one-off task to ensure backward compatibility with old user records.
 */
export async function GET() {
  try {
    await ConnectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const usersCollection = db.collection("users");

    // Find users that have the old 'subscription' field
    // and where that field is not null
    const query = { 
      subscription: { $exists: true, $ne: null } 
    };

    const usersToUpdate = await usersCollection.find(query).toArray();
    
    console.log(`Found ${usersToUpdate.length} users to migrate.`);

    let updatedCount = 0;

    for (const user of usersToUpdate) {
      const oldSub = user.subscription;
      
      // Initialize subscriptions array if it doesn't exist
      const currentSubs = Array.isArray(user.subscriptions) ? user.subscriptions : [];
      
      // Only add if not already present in the array
      const alreadyPresent = currentSubs.some(
        (id: any) => id.toString() === oldSub.toString()
      );

      const updateOps: any = {
        $unset: { subscription: "" }
      };

      if (!alreadyPresent) {
        updateOps.$push = { subscriptions: oldSub };
      }

      await usersCollection.updateOne({ _id: user._id }, updateOps);
      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed successfully.`,
      found: usersToUpdate.length,
      updated: updatedCount
    });

  } catch (error: any) {
    console.error("Migration Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "An error occurred during migration."
    }, { status: 500 });
  }
}
