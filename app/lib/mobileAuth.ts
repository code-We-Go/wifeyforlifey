import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { verifyToken, extractTokenFromHeader } from "@/app/utils/jwtUtils";
import UserModel from "@/app/modals/userModel";
import subscriptionsModel from "../modals/subscriptionsModel";
import { ConnectDB } from "../config/db";

export interface AuthResult {
  user: any | null;
  isAuthenticated: boolean;
  authType: "jwt" | "session" | "none";
}

export async function authenticateRequest(req: Request): Promise<AuthResult> {
  await ConnectDB();
  // 1. Try token-based auth first (for mobile)
  const authHeader = req.headers.get("authorization");
      console.log("register" + subscriptionsModel);

  if (authHeader) {
    const token = extractTokenFromHeader(authHeader);
    if (token) {
      const decodedUser = verifyToken(token);
      if (decodedUser) {

        // Fetch full user data to ensure user still exists and get latest details
        try {
          
          const dbUser = await UserModel.findById(decodedUser.id).populate(
            "subscriptions"
          );
          if (dbUser) {
            let isSubscribed = false;
            if (dbUser.email) {
              const allSubscriptions = await subscriptionsModel.find({
                email: dbUser.email,
                subscribed: true,
              }).sort({ expiryDate: -1 });

              // PACKAGE_IDS from userModel
              const PACKAGE_IDS = {
                FULL_EXPERIENCE: "687396821b4da119eb1c13fe",
                MINI: "68bf6ae9c4d5c1af12cdcd37",
                WEDDING_PLANNING_BESTIE: "6965e63c6df4503dda02c12b",
              };

              const mainSubscription = 
                allSubscriptions.find((sub: any) => sub.packageID?.toString() === PACKAGE_IDS.FULL_EXPERIENCE) ||
                allSubscriptions.find((sub: any) => sub.packageID?.toString() === PACKAGE_IDS.MINI);

              if (mainSubscription) {
                const isMini = mainSubscription.packageID?.toString() === PACKAGE_IDS.MINI;
                isSubscribed = isMini
                  ? !!mainSubscription.subscribed
                  : !!(
                      mainSubscription.expiryDate &&
                      new Date(mainSubscription.expiryDate).getTime() > Date.now()
                    );
              }
            }

            const userObj = dbUser.toObject();
            userObj.isSubscribed = isSubscribed;

            return { user: userObj, isAuthenticated: true, authType: "jwt" };
          }
        } catch (error) {
          console.error(
            "Error fetching user from DB during token auth:",
            error
          );
        }
      }
    }
  }

  // 2. Fall back to session-based auth (for web)
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return { user: session.user, isAuthenticated: true, authType: "session" };
  }

  return { user: null, isAuthenticated: false, authType: "none" };
}
