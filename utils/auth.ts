import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
// import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/cookies';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Simple in-memory cache for token verification (for middleware)
const tokenCache = new Map<string, { user: any; expires: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function setToken(token: string) {
  const cookieStore = await cookies(); // Await cookies() to get the cookie store
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function removeToken() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");
  } catch (e) {
    console.error("Error in deleting token:", e);
  }
}

export async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export function generateToken(payload: { id: string; username: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

// Optimized authentication function for server-side use
export async function isAuthenticated() {
  try {
    const token = await getToken();
    if (!token) {
      return { isAuth: false, user: null };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return { isAuth: false, user: null };
    }

    return { isAuth: true, user: decoded };
  } catch (error) {
    console.error("Authentication check error:", error);
    return { isAuth: false, user: null };
  }
}

// Optimized for middleware with caching
export function isAuthFromRequest(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    console.log("token" + "flase");
    return { isAuth: false, user: null };
  }

  // Check cache first
  const cached = tokenCache.get(token);
  if (cached && cached.expires > Date.now()) {
    console.log("token" + "true");

    return { isAuth: true, user: cached.user };
  }

  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    console.log("error in decoding");
    return { isAuth: false, user: null };
  }

  // Cache the result
  tokenCache.set(token, {
    user: decoded,
    expires: Date.now() + CACHE_DURATION,
  });

  return { isAuth: true, user: decoded };
}

// Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  Array.from(tokenCache.entries()).forEach(([token, data]) => {
    if (data.expires <= now) {
      tokenCache.delete(token);
    }
  });
}, 60000); // Clean up every minute
