import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConnectDB } from "@/app/config/db";
import { compare } from "bcryptjs";
import UserModel from "@/app/modals/userModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import { LoyaltyTransactionModel } from "@/app/modals/loyaltyTransactionModel";
import { LoyaltyPointsModel } from "@/app/modals/rewardModel";
import { v4 as uuidv4 } from "uuid";
import SessionModel from "@/app/modals/sessionsModel";
import { Types } from "mongoose"; // For ObjectId

// Extend NextAuth types to include isSubscribed
let loyaltyPoints = 0;

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      firstName?: string;
      lastName?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isSubscribed: boolean;
      subscription?: {
        packageId?: string;
        paid?: boolean;
      };
      subscriptionExpiryDate?: Date | null;
      // loyaltyPoints?: number;
      sessionId?: string; // Add sessionId here
      deviceFingerprint?: string; // Add device fingerprint
      isTesting?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isSubscribed?: boolean;
    subscription?: {
      packageId?: string;
      paid?: boolean;
    };
    // loyaltyPoints?: number;
    sessionId?: string; // Add sessionId here
    deviceFingerprint?: string; // Add device fingerprint
    isTesting?: boolean;
  }
}

// Helper function to calculate loyalty points
// async function calculateLoyaltyPoints(email: string) {
//   let loyaltyPoints = 0;
//   const transactions = await LoyaltyTransactionModel.find({ email }).populate(
//     "bonusID"
//   ); // Populate bonusID for non-purchase transactions

//   for (const tx of transactions) {
//     if (tx.reason === "purchase") {
//       loyaltyPoints += tx.amount;
//     } else if (tx.bonusID && tx.bonusID.amount) {
//       loyaltyPoints += tx.bonusID.bonusPoints;
//     }
//   }
//   return loyaltyPoints;
// }

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.googleClientId!,
      clientSecret: process.env.googleClientSecret!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
        deviceFingerprint: {},
      },
      // In the CredentialsProvider authorize function
      async authorize(credentials) {
        try {
          await ConnectDB();
          const email = credentials?.email?.trim().toLowerCase();
          if (!email) {
            throw new Error("Email is required");
          }
          const user = await UserModel.findOne({ email });
          if (!user) throw new Error("No user found");

          const isValid = await compare(credentials!.password, user.password);
          if (!isValid) throw new Error("Wrong password");

          // if (!credentials?.email) {
          //   throw new Error("Email is required for loyalty points calculation");
          // }
          // const loyaltyPoints = await calculateLoyaltyPoints(credentials.email);

          // Generate and store sessionId for single-session enforcement
          const sessionId = uuidv4();
          await SessionModel.findOneAndUpdate(
            { userId: user._id.toString() },
            { sessionId, createdAt: new Date() },
            { upsert: true }
          );

          // Get device fingerprint if provided
          const deviceFingerprint = credentials?.deviceFingerprint || null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            // loyaltyPoints,
            sessionId, // Attach sessionId for JWT
            deviceFingerprint, // Attach device fingerprint for JWT
          };
        } catch (error) {
          console.error("Authorize error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
      profile,
      credentials,
    }: {
      user: any;
      account: any;
      profile?: any;
      credentials?: {
        // deviceFingerprint?: string;
        email?: string;
        password?: string;
      };
    }) {
      await ConnectDB();
      let userId: string | undefined;

      if (account?.provider === "google") {
        const googleEmail = user.email?.trim().toLowerCase();
        let existingUser = await UserModel.findOne({ email: googleEmail });
        if (!existingUser) {
          //   const subscribed = await subscriptionsModel.findOne({
          //     email: user.email,
          //     subscribed: true,
          //   }
          // );
          existingUser = await UserModel.create({
            username: user.name || user.email?.split("@")[0] || "user",
            firstName: user.name?.split(" ")[0] || "user",
            lastName: user.name?.split(" ")[1] || "user",
            email: googleEmail,
            emailVerified: true,
            imageURL: user.image,
          });
        }
        userId = (existingUser as any)._id?.toString();
        user.id = userId ?? "";
        user.image = existingUser.imageURL || null; // Always set user.id for NextAuth

        // We can't access sessionStorage directly in the server component
        // The deviceFingerprint will be retrieved in the client component after redirect
      } else {
        // Credentials provider
        userId = user.id || (user as any)._id?.toString();
        user.id = userId ?? ""; // Always set user.id for NextAuth
      }

      // Generate and store sessionId for single-session enforcement
      if (user?.email && userId) {
        const sessionId = uuidv4();
        await SessionModel.findOneAndUpdate(
          { userId },
          { sessionId, createdAt: new Date() },
          { upsert: true }
        );
        (user as any).sessionId = sessionId; // Attach to user for JWT
      }
      return true;
    },

    async jwt({ token, user }) {
      try {
        await ConnectDB();
        const email = (user?.email || token.email)?.trim().toLowerCase();
        if (email) {
          const subscription = await subscriptionsModel.findOne({
            email,
            subscribed: true,
          });
          if (!subscription) {
            token.isSubscribed = false;
            token.subscriptionExpiryDate = null;
            token.subscription = {
              packageId: undefined,
              paid: false,
            };
            return token;
          }
          console.log("packageID" + subscription.packageID);
          token.isSubscribed = !!(
            subscription?.expiryDate &&
            subscription.expiryDate.getTime() > Date.now()
          );
          token.subscriptionExpiryDate = subscription?.expiryDate
            ? subscription.expiryDate.toISOString()
            : null;
          token.subscription = {
            packageId: subscription?.packageID || undefined,
            paid: subscription?.paid || false,
          };
          // token.loyaltyPoints = await calculateLoyaltyPoints(email);
        }
      } catch (error) {
        console.error("JWT callback error:", error);
      }
      // Attach sessionId to token
      if ((user as any)?.sessionId) {
        token.sessionId = (user as any).sessionId;
      }
      // Attach device fingerprint to token
      if ((user as any)?.deviceFingerprint) {
        token.deviceFingerprint = (user as any).deviceFingerprint;
      }
      // Check session validity
      if (token.sub && token.sessionId) {
        const dbSession = await SessionModel.findOne({ userId: token.sub });
        if (!dbSession || dbSession.sessionId !== token.sessionId) {
          throw new Error("Session invalidated: logged in elsewhere.");
        }
      }
      return token;
    },

    async session({ session, token }) {
      // 1. Apply token data first (Cached/Stale)
      if (session.user) {
        // if(existingUser?.imageURL) {session.user.image=existingUser.imageURL;}
        session.user.isSubscribed = token.isSubscribed ?? false;
        session.user.subscriptionExpiryDate = token.subscriptionExpiryDate
          ? new Date(token.subscriptionExpiryDate as string)
          : null;
        // Expose subscription details (packageId, paid) on the session user
        if (session.user && token.subscription) {
          // token.subscription is set in the JWT callback
          session.user.subscription = token.subscription;
        }
        // session.user.loyaltyPoints = token.loyaltyPoints;
      }
      if (session.user && token.sessionId) {
        session.user.sessionId = token.sessionId;
      }
      // Add device fingerprint to session if available
      if (session.user && token.deviceFingerprint) {
        session.user.deviceFingerprint = token.deviceFingerprint as string;
      }

      // 2. Apply fresh DB data (Overwrites Stale)
      if (token.sub && session.user) {
        session.user.id = token.sub;

        // Fetch user data to get firstName and lastName
        try {
          const userData = await UserModel.findById(token.sub);
          if (userData) {
            session.user.firstName =
              userData.firstName || userData.username || "";
            session.user.lastName = userData.lastName || "";
            session.user.isTesting = userData.isTesting || false;

            // Fetch fresh subscription data to avoid stale JWT
            if (userData.email) {
              const subscription = await subscriptionsModel.findOne({
                email: userData.email,
                subscribed: true,
              });

              if (subscription) {
                session.user.isSubscribed = !!(
                  subscription.expiryDate &&
                  subscription.expiryDate.getTime() > Date.now()
                );
                session.user.subscriptionExpiryDate = subscription.expiryDate;
                session.user.subscription = {
                  packageId: subscription.packageID?.toString(),
                  paid: subscription.subscribed,
                };
              } else {
                // If DB says no subscription, overwrite token (which might say yes)
                session.user.isSubscribed = false;
                session.user.subscription = undefined;
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data for session:", error);
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  secret: process.env.NEXTAUTH_SECRET,
};
