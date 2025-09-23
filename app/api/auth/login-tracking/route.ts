import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/app/config/db";
import LoginModel from "@/app/modals/loginsModel";
import { checkSuspiciousLoginActivity } from "@/utils/suspiciousLoginDetection";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const data = await request.json();

    // Validate required fields - only email is required for failed login attempts
    if (!data.email) {
      return NextResponse.json(
        { error: "Missing required email field" },
        { status: 400 }
      );
    }

    // Create login record with device fingerprinting
    const loginRecord = await LoginModel.create({
      userId: data.userId || null, // Make userId optional for unauthenticated attempts
      email: data.email,
      success: data.success ?? true,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      deviceType: data.deviceType,
      deviceBrand: data.deviceBrand,
      deviceModel: data.deviceModel,
      browserName: data.browserName,
      browserVersion: data.browserVersion,
      osName: data.osName,
      osVersion: data.osVersion,
      fingerprint: data.fingerprint,
    });

    // Check for suspicious login activity if login was successful and we have userId and fingerprint
    let suspiciousActivityDetected = false;
    if (data.success !== false && data.userId && data.fingerprint) {
      suspiciousActivityDetected = await checkSuspiciousLoginActivity(
        data.userId,
        data.email,
        data.fingerprint
      );
    }

    return NextResponse.json(
      {
        success: true,
        loginId: loginRecord._id,
        suspiciousActivityDetected,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error recording login:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record login" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    // Get query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const email = url.searchParams.get("email");
    const fingerprint = url.searchParams.get("fingerprint");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    // Build query
    const query: any = {};
    if (userId) query.userId = userId;
    if (email) query.email = email;
    if (fingerprint) query.fingerprint = fingerprint;

    // Get login records
    const loginRecords = await LoginModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    return NextResponse.json({ logins: loginRecords });
  } catch (error: any) {
    console.error("Error fetching login records:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch login records" },
      { status: 500 }
    );
  }
}
