import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { verifyToken, extractTokenFromHeader } from "@/app/utils/jwtUtils";
import UserModel, { PACKAGE_IDS } from "@/app/modals/userModel";
import subscriptionsModel from "../modals/subscriptionsModel";
import SubSubscriptionModel from "../modals/subSubscriptionModel";
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
            let subscriptionExpiryDate: Date | null = null;
            let mainSubscription: any = null;

            if (dbUser.email) {
              const allSubscriptions = await subscriptionsModel.find({
                email: dbUser.email,
                subscribed: true,
              }).sort({ expiryDate: -1 });

              // Prioritize active Full Experience over Mini, and Mini over expired Full Experience
              const activeFullSub = allSubscriptions.find(
                (sub: any) =>
                  sub.packageID?.toString() === PACKAGE_IDS.FULL_EXPERIENCE &&
                  sub.expiryDate &&
                  new Date(sub.expiryDate).getTime() > Date.now()
              );
              const miniSub = allSubscriptions.find(
                (sub: any) =>
                  (sub.packageID?.toString() === PACKAGE_IDS.MINI ||
                   sub.packageID?.toString() === PACKAGE_IDS.MINI_WEDDING) &&
                  sub.subscribed
              );
              const anyFullSub = allSubscriptions.find(
                (sub: any) => sub.packageID?.toString() === PACKAGE_IDS.FULL_EXPERIENCE
              );

              mainSubscription = activeFullSub || miniSub || anyFullSub;

              if (mainSubscription) {
                const isMini =
                  mainSubscription.packageID?.toString() === PACKAGE_IDS.MINI || 
                  mainSubscription.packageID?.toString() === PACKAGE_IDS.MINI_WEDDING;
                isSubscribed = isMini
                  ? !!mainSubscription.subscribed
                  : !!(
                      mainSubscription.expiryDate &&
                      new Date(mainSubscription.expiryDate).getTime() > Date.now()
                    );
                subscriptionExpiryDate = mainSubscription.expiryDate
                  ? new Date(mainSubscription.expiryDate)
                  : null;
              } else {
                // Check for sub-subscriptions (groom/bridesmaid) if no main subscription
                const subSub = await SubSubscriptionModel.findOne({
                  inviteeEmail: dbUser.email,
                  status: "accepted",
                }).populate("parentSubscription");

                if (subSub && subSub.parentSubscription?.subscribed) {
                  const parentExpiry = subSub.parentSubscription.expiryDate;
                  const isParentActive =
                    !parentExpiry ||
                    new Date(parentExpiry).getTime() > Date.now();

                  if (isParentActive) {
                    isSubscribed = true;
                    subscriptionExpiryDate = parentExpiry
                      ? new Date(parentExpiry)
                      : null;
                  }
                }
              }
            }

            const userObj = dbUser.toObject();
            userObj.isSubscribed = isSubscribed;
            userObj.subscriptionExpiryDate = subscriptionExpiryDate;
            userObj.subscription = {
              packageId: mainSubscription?.packageID?.toString() || undefined,
              paid: mainSubscription?.subscribed || false,
            };

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
