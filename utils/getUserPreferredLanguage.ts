import { ConnectDB } from "@/app/config/db";
import UserModel from "@/app/modals/userModel";

export interface ResolveLanguageParams {
  userId?: string | null;
  email?: string | null;
  fallbackLang?: "en" | "ar" | string | null;
}

/**
 * Resolves a recipient's preferred language ('en' | 'ar')
 * by checking UserModel via userId or email, falling back to fallbackLang, or 'en'.
 */
export async function getUserPreferredLanguage({
  userId,
  email,
  fallbackLang,
}: ResolveLanguageParams): Promise<"en" | "ar"> {
  const normalizedFallback: "en" | "ar" = fallbackLang === "ar" ? "ar" : "en";

  try {
    if (!userId && !email) {
      return normalizedFallback;
    }

    await ConnectDB();

    let user = null;
    if (userId) {
      user = await UserModel.findById(userId).select("preferredLanguage").lean();
    }
    if (!user && email) {
      const normalizedEmail = email.trim().toLowerCase();
      user = await UserModel.findOne({ email: normalizedEmail })
        .select("preferredLanguage")
        .lean();
    }

    if (user && (user as any).preferredLanguage) {
      const lang = (user as any).preferredLanguage;
      return lang === "ar" ? "ar" : "en";
    }
  } catch (error) {
    console.warn("Could not resolve user preferred language, using fallback:", error);
  }

  return normalizedFallback;
}

