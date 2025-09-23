import NextAuth from "next-auth";
import { authOptions } from "./authOptions";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConnectDB } from "@/app/config/db";
import { User } from "@/models/User";
import { compare } from "bcryptjs";
import UserModel from "@/app/modals/userModel";

// Extend NextAuth types
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id?: string;
//       firstName?: string;
//       lastName?: string;
//       name?: string | null;
//       email?: string | null;
//       image?: string | null;
//       isSubscribed: boolean;
//       subscriptionExpiryDate?: Date | null;
//       // loyaltyPoints?: number;
//       sessionId?: string; // Add sessionId here
//     };
//   }
// }

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
