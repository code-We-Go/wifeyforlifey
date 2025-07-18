import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConnectDB } from "@/app/config/db";
import { compare } from "bcryptjs";
import UserModel from "@/app/modals/userModel";
import subscriptionsModel from "@/app/modals/subscriptionsModel";

// Extend NextAuth types to include isSubscribed
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
      subscriptionExpiryDate?:Date | null
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isSubscribed?: boolean;
  }
}

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

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
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
              isSubscribed: subscribed?true:false,
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
          const subscription = await subscriptionsModel.findOne({email});
          console.log("subscription" + subscription)
          console.log("expiryDateGetTime"+subscription.expiryDate.getTime())
          token.isSubscribed = (subscription?.expiryDate && subscription.expiryDate.getTime() > Date.now());
          token.subscriptionExpiryDate = subscription?.expiryDate
            ? subscription.expiryDate.toISOString()
            : null;
          
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
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
