import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import { ConnectDB } from "@/app/config/db";
import UserModel from "@/app/modals/userModel";
import { generateToken } from "@/app/utils/jwtUtils";

// Apple's public keys endpoint
const APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys";

// Cache Apple's public keys (they rotate infrequently)
let cachedKeys: any[] | null = null;
let keysCachedAt = 0;
const KEYS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function getApplePublicKeys(): Promise<any[]> {
  const now = Date.now();
  if (cachedKeys && now - keysCachedAt < KEYS_CACHE_DURATION) {
    return cachedKeys;
  }

  const response = await fetch(APPLE_KEYS_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch Apple public keys");
  }

  const { keys } = await response.json();
  cachedKeys = keys;
  keysCachedAt = now;
  return keys;
}

function getSigningKey(keys: any[], kid: string): string {
  const key = keys.find((k: any) => k.kid === kid);
  if (!key) {
    throw new Error("Apple signing key not found for kid: " + kid);
  }
  return jwkToPem(key);
}

interface AppleTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string; // Apple User ID — stable across sign-ins
  email?: string;
  email_verified?: string | boolean;
  is_private_email?: string | boolean;
  nonce?: string;
}

export async function POST(req: Request) {
  try {
    await ConnectDB();

    const body = await req.json();
    const { identityToken, fullName } = body;

    if (!identityToken) {
      return NextResponse.json(
        { error: "identityToken is required" },
        { status: 400 }
      );
    }

    // 1. Decode the token header to get the key ID (kid)
    const decodedHeader = jwt.decode(identityToken, { complete: true });
    if (!decodedHeader || !decodedHeader.header) {
      return NextResponse.json(
        { error: "Invalid identity token format" },
        { status: 401 }
      );
    }

    const { kid } = decodedHeader.header;
    if (!kid) {
      return NextResponse.json(
        { error: "Token header missing kid" },
        { status: 401 }
      );
    }

    // 2. Fetch Apple's public keys and find the matching one
    const appleKeys = await getApplePublicKeys();
    const signingKey = getSigningKey(appleKeys, kid);

    // 3. Verify the token signature and claims
    const APPLE_BUNDLE_ID = process.env.APPLE_BUNDLE_ID;
    if (!APPLE_BUNDLE_ID) {
      console.error("APPLE_BUNDLE_ID environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    let payload: AppleTokenPayload;
    try {
      payload = jwt.verify(identityToken, signingKey, {
        algorithms: ["RS256"],
        issuer: "https://appleid.apple.com",
        audience: APPLE_BUNDLE_ID,
      }) as AppleTokenPayload;
    } catch (verifyError: any) {
      console.error("Apple token verification failed:", verifyError.message);
      return NextResponse.json(
        { error: "Invalid or expired Apple token" },
        { status: 401 }
      );
    }

    // 4. Extract user info from verified token
    const appleUserId = payload.sub;
    const email = payload.email;

    if (!appleUserId) {
      return NextResponse.json(
        { error: "Apple token missing user identifier" },
        { status: 401 }
      );
    }

    // 5. Look up user: first by appleUserId, then by email
    let user = await UserModel.findOne({ appleUserId });
    let isNewUser = false;

    if (!user && email) {
      // Check if a user with this email already exists (account linking)
      user = await UserModel.findOne({ email });
      if (user) {
        // Link Apple ID to existing account
        user.appleUserId = appleUserId;
        user.authProvider = "apple";
        await user.save();
      }
    }

    if (!user) {
      // Create a new user
      const givenName = fullName?.givenName || "";
      const familyName = fullName?.familyName || "";
      const username =
        email?.split("@")[0] || `apple_${appleUserId.substring(0, 8)}`;

      user = await UserModel.create({
        username,
        email: email || `${appleUserId}@privaterelay.apple.com`,
        firstName: givenName,
        lastName: familyName,
        emailVerified: true, // Apple verifies the email
        authProvider: "apple",
        appleUserId,
      });

      isNewUser = true;
    }

    // 6. Generate our app's JWT token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      isSubscribed: user.isSubscribed || false,
      subscriptionExpiryDate: user.subscriptionExpiryDate,
    });

    // 7. Return the same response shape as mobile login/signup
    return NextResponse.json(
      {
        message: "Apple sign-in successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          imageURL: user.imageURL || "",
          isSubscribed: user.isSubscribed || false,
        },
        isNewUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Apple sign-in error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
