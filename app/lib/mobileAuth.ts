import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { verifyToken, extractTokenFromHeader } from "@/app/utils/jwtUtils";
import UserModel from "@/app/modals/userModel";

export interface AuthResult {
  user: any | null;
  isAuthenticated: boolean;
  authType: 'jwt' | 'session' | 'none';
}

export async function authenticateRequest(req: Request): Promise<AuthResult> {
  // 1. Try token-based auth first (for mobile)
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = extractTokenFromHeader(authHeader);
    if (token) {
      const decodedUser = verifyToken(token);
      if (decodedUser) {
        // Fetch full user data to ensure user still exists and get latest details
        try {
          const dbUser = await UserModel.findById(decodedUser.id);
          if (dbUser) {
             return { user: dbUser, isAuthenticated: true, authType: 'jwt' };
          }
        } catch (error) {
          console.error("Error fetching user from DB during token auth:", error);
        }
      }
    }
  }

  // 2. Fall back to session-based auth (for web)
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return { user: session.user, isAuthenticated: true, authType: 'session' };
  }

  return { user: null, isAuthenticated: false, authType: 'none' };
}
