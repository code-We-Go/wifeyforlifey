import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConnectDB } from "@/app/config/db";
import { compare } from "bcryptjs";
import UserModel from "@/app/modals/userModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";
import { LoyaltyTransactionModel } from "@/app/modals/loyaltyTransactionModel";
import { LoyaltyPointsModel } from "@/app/modals/rewardModel";


console.log("registering" + LoyaltyPointsModel);
// Extend NextAuth types to include isSubscribed
let loyaltyPoints = 0;

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      firstName?:string
      lastName?:string
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isSubscribed: boolean;
      subscriptionExpiryDate?:Date | null;
      loyaltyPoints?:number ;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isSubscribed?: boolean;
    loyaltyPonits?:number;
  }
}

// Helper function to calculate loyalty points
async function calculateLoyaltyPoints(email: string) {
  let loyaltyPoints = 0;
  const transactions = await LoyaltyTransactionModel
    .find({ email })
    .populate('bonusID'); // Populate bonusID for non-purchase transactions

  for (const tx of transactions) {
    if (tx.reason === "purchase") {
      loyaltyPoints += tx.amount;
    } else if (tx.bonusID && tx.bonusID.amount) {
      loyaltyPoints += tx.bonusID.bonusPoints;
    }
  }
  return loyaltyPoints;
}

console.log("registering" + LoyaltyPointsModel);
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
      },
      async authorize(credentials) {
        try {
          await ConnectDB();
          const user = await UserModel.findOne({ email: credentials?.email });
          if (!user) throw new Error("No user found");

          const isValid = await compare(credentials!.password, user.password);
          if (!isValid) throw new Error("Wrong password");

          // Ensure email is defined
          if (!credentials?.email) {
            throw new Error("Email is required for loyalty points calculation");
          }
          const loyaltyPoints = await calculateLoyaltyPoints(credentials.email);

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            loyaltyPoints, // Pass the calculated points
          };
        } catch (error) {
          console.error("Authorize error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await ConnectDB();
          const existingUser = await UserModel.findOne({ email: user.email });
          if (!existingUser) {
            const subscribed = await subscriptionsModel.findOne({email:user.email,subscribed:true})
            await UserModel.create({
              username: user.name || user.email?.split('@')[0] || 'user',
              email: user.email,
              emailVerified: true,
              imageURL:user.image,
              // isSubscribed: subscribed?true:false,
              subscription:subscribed._id // Default value for new users
            });
          }
        } catch (error) {
          console.error("SignIn callback error:", error);
          return false; // Prevent sign-in if DB operation fails
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      try {
        await ConnectDB();
        const email = user?.email || token.email;
        if (email) {
          console.log("Querying for email:", email);
          const subscription = await subscriptionsModel.findOne({email:email,subscribed:true});
          console.log("subscription" + subscription)
          console.log("expiryDateGetTime"+subscription.expiryDate.getTime())
          token.isSubscribed = (subscription?.expiryDate && subscription.expiryDate.getTime() > Date.now());
          token.subscriptionExpiryDate = subscription?.expiryDate
            ? subscription.expiryDate.toISOString()
            : null;
            token.loyaltyPonits =  await calculateLoyaltyPoints(subscription.email);

          
          // const dbUser = await UserModel.findOne({ email });
          // token.isSubscribed = dbUser?.isSubscribed ?? false;
        }
      } catch (error) {
        console.error("JWT callback error:", error);
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (session.user) {
        session.user.isSubscribed = token.isSubscribed ?? false;
        session.user.subscriptionExpiryDate = token.subscriptionExpiryDate
          ? new Date(token.subscriptionExpiryDate as string)
          : null;
          session.user.loyaltyPoints= token.loyaltyPonits
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
