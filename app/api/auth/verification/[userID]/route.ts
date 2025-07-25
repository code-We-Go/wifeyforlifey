import { NextRequest, NextResponse } from "next/server";
import userModel from "@/app/modals/userModel";
import verificationsModel from "@/app/modals/sessionModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";

export async function GET(_request: NextRequest) {
  try {
    // Extract userID from the URL using nextUrl.pathname
    const userID = _request.nextUrl.pathname.split("/")[4]; // Assuming the URL structure is /api/auth/verification/[userID]

    if (!userID) {
      // If userID is missing, redirect to sign-up page
      return NextResponse.redirect(new URL("/register", _request.url));
    }

    // Fetch session based on userID
    const getSession = await verificationsModel.findOne({ userID: userID });
    const data = await userModel.findOne({ _id: userID });
    console.log(data?.email);

    if (getSession) {
      try {
        const subscription = await subscriptionsModel.findOne({
          email: data?.email,
          subscribed: true,
        });
        // Update the user's emailVerified status
        if (subscription) {
          await userModel.findByIdAndUpdate(userID, {
            emailVerified: true,
            subscription: subscription._id,
          });
        } else {
          await userModel.findByIdAndUpdate(userID, { emailVerified: true });
        }

        // Redirect to the login page for the user to sign in with NextAuth
        return NextResponse.redirect(new URL("/login", _request.url));
      } catch (err: any) {
        console.error("Error in updating user:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    } else {
      console.error("No session found for userID:", userID);
      return NextResponse.json(
        { error: "No session found for the provided userID" },
        { status: 404 }
      );
    }
  } catch (err: any) {
    console.error("Error in GET handler:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
