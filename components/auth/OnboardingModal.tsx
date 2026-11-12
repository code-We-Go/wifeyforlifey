"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import axios from "axios";
import { FaWhatsapp } from "react-icons/fa";
import { X, Calendar, Globe, Heart, BadgeAlert } from "lucide-react";
import { thirdFont } from "@/fonts";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingModal() {
  const { data: session, status, update } = useSession();
  const t = useTranslations("auth");
  const locale = useLocale();
  const pathname = usePathname();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<"ar" | "en">(
    locale === "ar" ? "ar" : "en"
  );
  const [weddingDay, setWeddingDay] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      setIsOpen(false);
      return;
    }

    // Suppress on auth flow routes
    const isAuthRoute =
      pathname?.includes("/login") ||
      pathname?.includes("/register") ||
      pathname?.includes("/verification");

    if (isAuthRoute) {
      setIsOpen(false);
      return;
    }

    // If user already completed onboarding or has WhatsApp number, no need to show
    const user = session.user as any;
    const hasCompleted = user.onboardingCompleted || Boolean(user.whatsAppNumber);
    if (hasCompleted) {
      setIsOpen(false);
      return;
    }

    // Check if dismissed in this browser session
    const dismissed = sessionStorage.getItem("wifey_onboarding_modal_dismissed");
    if (dismissed === "true") {
      setIsOpen(false);
      return;
    }

    // Pre-populate fields from session if available
    if (user.firstName) setFirstName(user.firstName);
    else if (user.name) {
      const parts = user.name.split(" ");
      setFirstName(parts[0] || "");
      if (parts.length > 1) setLastName(parts.slice(1).join(" "));
    }
    if (user.lastName) setLastName(user.lastName);
    if (user.preferredLanguage) setPreferredLanguage(user.preferredLanguage);
    else setPreferredLanguage(locale === "ar" ? "ar" : "en");

    setIsOpen(true);
  }, [session, status, pathname, locale]);

  const handleDismiss = () => {
    sessionStorage.setItem("wifey_onboarding_modal_dismissed", "true");
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!whatsAppNumber.trim()) {
      setError(t("whatsAppRequired"));
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/user/onboarding", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        whatsAppNumber: whatsAppNumber.trim(),
        preferredLanguage,
        weddingDay: weddingDay || undefined,
      });

      if (res.data?.success) {
        toast({
          title: locale === "ar" ? "تم حفظ بياناتك بنجاح! 💕" : "Profile updated! 💕",
          description:
            locale === "ar"
              ? "شكراً ليكي يا قمر، رحلتك مع وايفي هتبدأ بأحلى تفاصيل."
              : "Thank you! Your profile details are now saved.",
        });

        // Trigger session refresh so state updates everywhere
        await update();
        setIsOpen(false);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-creamey border border-pinkey/40 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-lovely/60 hover:text-lovely p-1.5 rounded-full hover:bg-pinkey/30 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lovely/10 text-lovely mb-2">
            <Heart className="w-6 h-6 fill-lovely text-lovely" />
          </div>
          <h2
            className={`${thirdFont.className} text-2xl sm:text-3xl font-bold text-lovely`}
          >
            {t("onboardingTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-lovely/80 mt-1 max-w-sm mx-auto">
            {t("onboardingSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="onboarding-firstName"
                className="block text-xs font-semibold text-lovely/90 mb-1"
              >
                {t("firstName")}
              </label>
              <input
                id="onboarding-firstName"
                type="text"
                className="appearance-none rounded-lg placeholder:text-lovely/50 block w-full px-3 py-2 border border-pinkey text-lovely bg-white/70 focus:outline-none focus:ring-1 focus:ring-lovely focus:border-lovely text-sm"
                placeholder={t("firstNamePlaceholder")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="onboarding-lastName"
                className="block text-xs font-semibold text-lovely/90 mb-1"
              >
                {t("lastName")}
              </label>
              <input
                id="onboarding-lastName"
                type="text"
                className="appearance-none rounded-lg placeholder:text-lovely/50 block w-full px-3 py-2 border border-pinkey text-lovely bg-white/70 focus:outline-none focus:ring-1 focus:ring-lovely focus:border-lovely text-sm"
                placeholder={t("lastNamePlaceholder")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* WhatsApp Number */}
          <div>
            <label
              htmlFor="onboarding-whatsapp"
              className="flex items-center gap-1.5 text-xs font-semibold text-lovely/90 mb-1"
            >
              <FaWhatsapp className="text-emerald-600 text-sm" />
              <span>{t("whatsAppNumber")} *</span>
            </label>
            <input
              id="onboarding-whatsapp"
              type="tel"
              required
              dir="ltr"
              className="appearance-none rounded-lg placeholder:text-lovely/50 block w-full px-3 py-2 border border-pinkey text-lovely bg-white/70 focus:outline-none focus:ring-1 focus:ring-lovely focus:border-lovely text-sm text-left"
              placeholder={t("whatsAppPlaceholder")}
              value={whatsAppNumber}
              onChange={(e) => setWhatsAppNumber(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Preferred Language */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-lovely/90 mb-1">
              <Globe className="w-3.5 h-3.5 text-lovely" />
              <span>{t("preferredLanguage")}</span>
            </label>
            <p className="text-[11px] text-lovely/70 mb-2">
              {t("preferredLanguageDesc")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreferredLanguage("ar")}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  preferredLanguage === "ar"
                    ? "bg-lovely text-creamey border-lovely shadow-sm"
                    : "bg-white/70 text-lovely border-pinkey hover:bg-white"
                }`}
              >
                🇪🇬 {t("arabic")}
              </button>
              <button
                type="button"
                onClick={() => setPreferredLanguage("en")}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  preferredLanguage === "en"
                    ? "bg-lovely text-creamey border-lovely shadow-sm"
                    : "bg-white/70 text-lovely border-pinkey hover:bg-white"
                }`}
              >
                🇬🇧 {t("english")}
              </button>
            </div>
          </div>

          {/* Wedding Date (Optional) */}
          <div>
            <label
              htmlFor="onboarding-wedding"
              className="flex items-center gap-1.5 text-xs font-semibold text-lovely/90 mb-1"
            >
              <Calendar className="w-3.5 h-3.5 text-lovely" />
              <span>{t("weddingDay")}</span>
            </label>
            <input
              id="onboarding-wedding"
              type="date"
              className="appearance-none rounded-lg placeholder:text-lovely/50 block w-full px-3 py-2 border border-pinkey text-lovely bg-white/70 focus:outline-none focus:ring-1 focus:ring-lovely focus:border-lovely text-sm"
              value={weddingDay}
              onChange={(e) => setWeddingDay(e.target.value)}
              disabled={loading}
            />
            <p className="text-[11px] text-lovely/70 mt-1">
              {t("weddingDayHelp")}
            </p>
          </div>

          {error && (
            <div className="text-lovely flex gap-2 w-full justify-center items-center text-xs text-center bg-pinkey/30 py-2 px-3 rounded-lg">
              <BadgeAlert className="text-xs w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border-2 border-creamey text-sm rounded-lg text-creamey bg-lovely font-semibold hover:bg-everGreen/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors"
            >
              {loading ? t("saving") : t("saveAndContinue")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

