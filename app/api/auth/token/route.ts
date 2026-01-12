import { NextResponse } from "next/server";
import { generateToken } from "@/app/utils/jwtUtils";
import { ConnectDB } from "@/app/config/db";
import UserModel from "@/app/modals/userModel";
import bcrypt from "bcryptjs";

// Connect to database
ConnectDB();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      // isSubscribed: user.isSubscribed || false,
      subscriptionExpiryDate: user.subscriptionExpiryDate,
    });

    return NextResponse.json({ token }, { status: 200 });
  } catch (error: any) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// For testing purposes only - generates a sample token
export async function GET() {
  try {
    // Find a sample user
    const user = await UserModel.findOne();

    if (!user) {
      return NextResponse.json(
        { error: "No users found in database" },
        { status: 404 }
      );
    }

    // Generate token for the sample user
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      // isSubscribed: user.isSubscribed || false,
      subscriptionExpiryDate: user.subscriptionExpiryDate,
    });

    return NextResponse.json(
      {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          isSubscribed: user.isSubscribed || false,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Sample token generation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
