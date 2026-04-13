import { NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/mobileAuth";
import UserModel from "@/app/modals/userModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import WeddingTimelineModel from "@/app/modals/WeddingTimeline";
import { LoyaltyTransactionModel } from "@/app/modals/loyaltyTransactionModel";
import InteractionsModel from "@/app/modals/interactionsModel";
import playlistsProgress from "@/app/modals/playlistsProgress";
import { ConnectDB } from "@/app/config/db";

export async function POST(req: Request) {
  try {
    await ConnectDB();
    const auth = await authenticateRequest(req);

    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.user._id;
    const userEmail = auth.user.email;

    // Perform deletion of associated data
    
    // 1. Delete Wedding Timeline
    try {
      await WeddingTimelineModel.deleteMany({ userId: userId.toString() });
    } catch (err) {
      console.error("Error deleting wedding timeline:", err);
    }

    // 2. Delete Subscription if it exists
    if (auth.user.subscription) {
      try {
        await subscriptionsModel.findByIdAndDelete(auth.user.subscription);
      } catch (err) {
        console.error("Error deleting subscription:", err);
      }
    }

    // 3. Delete Loyalty Transactions (linked by email)
    if (userEmail) {
      try {
        await LoyaltyTransactionModel.deleteMany({ email: userEmail });
      } catch (err) {
        console.error("Error deleting loyalty transactions:", err);
      }
    }

    // 4. Delete Interactions
    try {
      await InteractionsModel.deleteMany({ userId: userId });
    } catch (err) {
      console.error("Error deleting interactions:", err);
    }

    // 5. Delete Playlist Progress
    try {
      await playlistsProgress.deleteMany({ userID: userId });
    } catch (err) {
      console.error("Error deleting playlist progress:", err);
    }

    // 6. Finally, delete the user
    const deletedUser = await UserModel.findByIdAndDelete(userId);


    if (!deletedUser) {
      return NextResponse.json(
        { error: "User not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account and associated data deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in delete-account API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// Support DELETE method for RESTful clients
export async function DELETE(req: Request) {
  return POST(req);
}

