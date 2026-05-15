import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id?: string;
    firstName?: string;
    lastName?: string;
    isSubscribed?: boolean;
    subscription?: {
      packageId?: string;
      paid?: boolean;
    };
    subscriptionExpiryDate?: Date | null;
    weddingPlanningBestie?: {
      expiryDate?: Date | null;
      isSubscribed?: boolean;
    } | null;
    sessionId?: string;
    deviceFingerprint?: string;
    isTesting?: boolean;
    shippingData?: {
      email?: string;
      firstName?: string;
      lastName?: string;
      address?: string;
      apartment?: string;
      phone?: string;
      whatsAppNumber?: string;
      bostaCity?: string;
      bostaCityName?: string;
      bostaZone?: string;
      bostaZoneName?: string;
      bostaDistrict?: string;
      bostaDistrictName?: string;
    };
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isSubscribed?: boolean;
    subscription?: {
      packageId?: string;
      paid?: boolean;
    };
    weddingPlanningBestie?: {
      expiryDate?: string | null;
      isSubscribed?: boolean;
    } | null;
    sessionId?: string;
    deviceFingerprint?: string;
    isTesting?: boolean;
  }
}
