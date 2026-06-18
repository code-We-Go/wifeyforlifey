import { NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import UserModel from "@/app/modals/userModel";
import bcrypt from "bcryptjs";
import { generateToken } from "@/app/utils/jwtUtils";
import SubSubscriptionModel from "@/app/modals/subSubscriptionModel";
export async function POST(req: Request) {
  try {
    await ConnectDB();

    const body = await req.json();
    const { username, email, password, firstName, lastName } = body;

    // Validate input
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Missing required fields: username, email, password" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      firstName: firstName || "",
      lastName: lastName || "",
      emailVerified: false, // Default to false until verified
    });

    // Sync subscriptions from subscriptionsModel
    const subscriptionsModel = (await import("@/app/modals/subscriptionsModel")).default;
    const userSubs = await subscriptionsModel.find({ email: newUser.email });
    if (userSubs.length > 0) {
      const subIds = userSubs.map(s => s._id.toString());
      const existingIds = newUser.subscriptions?.map((s: any) => s.toString()) || [];

      let modified = false;
      for (const id of subIds) {
        if (!existingIds.includes(id)) {
          if (!newUser.subscriptions) newUser.subscriptions = [];
          newUser.subscriptions.push(id);
          modified = true;
        }
      }
      if (modified || !newUser.isSubscribed) {
        newUser.isSubscribed = true;
        await newUser.save();
      }
    }

    // await newUser.populate("subscriptions");

    // Accept any pending sub-subscriptions for this new user
    await SubSubscriptionModel.updateMany(
      { inviteeEmail: email, status: "pending" },
      { $set: { status: "accepted", inviteeUser: newUser._id } }
    );

    // Generate token
    const token = generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
      isSubscribed: newUser.isSubscribed || false,
      subscriptionExpiryDate: newUser.subscriptionExpiryDate,
    });

    // Return success with token
    return NextResponse.json(
      {
        message: "User created successfully",
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
