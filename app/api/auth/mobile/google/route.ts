import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import { ConnectDB } from "@/app/config/db";
import UserModel from "@/app/modals/userModel";
import { generateToken } from "@/app/utils/jwtUtils";

// Google's public keys endpoint
const GOOGLE_KEYS_URL = "https://www.googleapis.com/oauth2/v3/certs";

// Cache Google's public keys
let cachedKeys: any[] | null = null;
let keysCachedAt = 0;
const KEYS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function getGooglePublicKeys(): Promise<any[]> {
  const now = Date.now();
  if (cachedKeys && now - keysCachedAt < KEYS_CACHE_DURATION) {
    return cachedKeys;
  }

  const response = await fetch(GOOGLE_KEYS_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch Google public keys");
  }

  const { keys } = await response.json();
  cachedKeys = keys;
  keysCachedAt = now;
  return keys;
}

function getSigningKey(keys: any[], kid: string): string {
  const key = keys.find((k: any) => k.kid === kid);
  if (!key) {
    throw new Error("Google signing key not found for kid: " + kid);
  }
  return jwkToPem(key);
}

interface GoogleTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string; // Google User ID — stable across sign-ins
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export async function POST(req: Request) {
  try {
    await ConnectDB();

    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: "idToken is required" },
        { status: 400 }
      );
    }

    // 1. Decode the token header to get the key ID (kid)
    const decodedHeader = jwt.decode(idToken, { complete: true });
    if (!decodedHeader || !decodedHeader.header) {
      return NextResponse.json(
        { error: "Invalid ID token format" },
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

    // 2. Fetch Google's public keys and find the matching one
    const googleKeys = await getGooglePublicKeys();
    const signingKey = getSigningKey(googleKeys, kid);

    // 3. Verify the token — accept both mobile and web client IDs
    // const GOOGLE_MOBILE_CLIENT_ID = process.env.googleClientId;
    const GOOGLE_WEB_CLIENT_ID = process.env.googleClientId;
   const GOOGLE_IOS_CLIENT_ID= process.env.GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.GOOGLE_ANDROID_CLIENT_ID;

    const validAudiences = [
      // GOOGLE_MOBILE_CLIENT_ID,
      GOOGLE_WEB_CLIENT_ID,
      GOOGLE_IOS_CLIENT_ID,
      GOOGLE_ANDROID_CLIENT_ID
    ].filter(Boolean) as string[];

    if (validAudiences.length === 0) {
      console.error(
        "Neither GOOGLE_MOBILE_CLIENT_ID nor googleClientId environment variable is set"
      );
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    let payload: GoogleTokenPayload;
    try {
      // Verify signature and expiry first, then check audience manually
      // (jsonwebtoken's `audience` option doesn't support OR logic natively)
      payload = jwt.verify(idToken, signingKey, {
        algorithms: ["RS256"],
      }) as GoogleTokenPayload;

      // Validate issuer
      if (
        payload.iss !== "accounts.google.com" &&
        payload.iss !== "https://accounts.google.com"
      ) {
        throw new Error("Invalid issuer: " + payload.iss);
      }

      // Validate audience (accept any of the valid client IDs)
      if (!validAudiences.includes(payload.aud)) {
        throw new Error("Invalid audience: " + payload.aud);
      }
    } catch (verifyError: any) {
      console.error("Google token verification failed:", verifyError.message);
      return NextResponse.json(
        { error: "Invalid or expired Google token" },
        { status: 401 }
      );
    }

    // 4. Extract user info from verified token
    const googleUserId = payload.sub;
    const email = payload.email;

    if (!googleUserId) {
      return NextResponse.json(
        { error: "Google token missing user identifier" },
        { status: 401 }
      );
    }

    // 5. Look up user: first by googleUserId, then by email
    let user = await UserModel.findOne({ googleUserId });
    let isNewUser = false;

    if (!user && email) {
      // Check if a user with this email already exists (account linking)
      user = await UserModel.findOne({ email });
      if (user) {
        // Link Google ID to existing account
        user.googleUserId = googleUserId;
        if (user.authProvider === "email") {
          user.authProvider = "google";
        }
        await user.save();
      }
    }

    if (!user) {
      // Create a new user
      const username =
        email?.split("@")[0] || `google_${googleUserId.substring(0, 8)}`;

      user = await UserModel.create({
        username,
        email: email || `${googleUserId}@google.com`,
        firstName: payload.given_name || payload.name?.split(" ")[0] || "",
        lastName: payload.family_name || payload.name?.split(" ")[1] || "",
        imageURL: payload.picture || "",
        emailVerified: payload.email_verified === true,
        authProvider: "google",
        googleUserId,
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
        message: "Google sign-in successful",
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
    console.error("Google sign-in error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
