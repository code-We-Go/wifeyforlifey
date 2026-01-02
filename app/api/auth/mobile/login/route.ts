import { NextResponse } from "next/server";
import { generateToken } from "@/app/utils/jwtUtils";
import { ConnectDB } from "@/app/config/db";
import UserModel from "@/app/modals/userModel";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await ConnectDB();
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
      isSubscribed: user.isSubscribed || false,
      subscriptionExpiryDate: user.subscriptionExpiryDate,
    });

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          imageURL: user.imageURL,
          isSubscribed: user.isSubscribed,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
