"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import axios from "axios";
import { thirdFont } from "@/fonts";
import { FaGoogle, FaWhatsapp } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { BadgeAlert, Calendar, Globe } from "lucide-react";

function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<"ar" | "en">(
    locale === "ar" ? "ar" : "en"
  );
  const [weddingDay, setWeddingDay] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    setRedirectPath(redirect);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!whatsAppNumber.trim()) {
      setError(t("whatsAppRequired"));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/register", {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        whatsAppNumber: whatsAppNumber.trim(),
        preferredLanguage,
        weddingDay: weddingDay || undefined,
      });

      if (response.status === 201) {
        router.push("/verification");
      }
    } catch (error: any) {
      setError(error.response?.data?.error || t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    const callbackUrl = redirectPath || "/account";
    signIn("google", { callbackUrl });
  };

  return (
    <div className="bg-patternPinkey min-h-[calc(100vh-128px)]">
      <div className="min-h-full flex items-center justify-center bg-black/30 backdrop-blur-[3px] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg rounded-2xl bg-creamey shadow-2xl w-full py-8 px-6 sm:px-8 space-y-5">
          <div>
            <h2
              className={`${thirdFont.className} mt-2 text-center text-3xl sm:text-4xl font-bold tracking-normal text-lovely`}
            >
              {t("createAccountTitle")}
            </h2>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs font-semibold text-lovely/90 mb-1"
                >
                  {t("firstName")}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="appearance-none rounded-lg placeholder:text-lovely/60 relative block w-full px-3 py-2 border border-pinkey text-lovely bg-creamey/90 focus:outline-none focus:ring-1 focus:ring-lovely focus:border-lovely text-sm"
                  placeholder={t("firstNamePlaceholder")}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs font-semibold text-lovely/90 mb-1"
                >
                  {t("lastName")}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="appearance-none rounded-lg placeholder:text-lovely/60 relative block w-full px-3 py-2 border border-pinkey text-lovely bg-creamey/90 focus:outline-none focus:ring-1 focus:ring-lovely focus:border-lovely text-sm"
                  placeholder={t("lastNamePlaceholder")}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-lovely/90 mb-1"
              >
                {t("username")} *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-lg placeholder:text-lovely/60 relative block w-full px-3 py-2 border border-pinkey text-lovely bg-creamey/90 focus:outline-none focus:ring-1 focus:ring-lovely focus:border-lovely text-sm"
                placeholder={t("usernamePlaceholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-lovely/90 mb-1"
              >
                {t("email")} *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none lowercase rounded-lg placeholder:text-lovely/60 bg-creamey/90 relative block w-full px-3 py-2 border border-pinkey text-lovely focus:outline-none focus:ring-1 focus:ring-lovely focus:border-lovely text-sm"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label
                htmlFor="whatsAppNumber"
                className="flex items-center gap-1.5 text-xs font-semibold text-lovely/90 mb-1"
              >
                <FaWhatsapp className="text-emerald-600 text-sm" />
                <span>{t("whatsAppNumber")} *</span>
              </label>
              <input
                id="whatsAppNumber"
                name="whatsAppNumber"
                type="tel"
                required
                dir="ltr"
                className="appearance-none rounded-lg placeholder:text-lovely/60 relative block w-full px-3 py-2 border border-pinkey text-lovely bg-creamey/90 focus:outline-none focus:ring-1 focus:ring-lovely focus:border-lovely text-sm text-left"
                placeholder={t("whatsAppPlaceholder")}
                value={whatsAppNumber}
                onChange={(e) => setWhatsAppNumber(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Preferred Language for emails & communications */}
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
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${preferredLanguage === "ar"
                      ? "bg-lovely text-creamey border-lovely shadow-sm"
                      : "bg-white/70 text-lovely border-pinkey hover:bg-white"
                    }`}
                >
                  🇪🇬 {t("arabic")}
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredLanguage("en")}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${preferredLanguage === "en"
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
                htmlFor="weddingDay"
                className="flex items-center gap-1.5 text-xs font-semibold text-lovely/90 mb-1"
              >
                <Calendar className="w-3.5 h-3.5 text-lovely" />
                <span>{t("weddingDay")}</span>
              </label>
              <input
                id="weddingDay"
                name="weddingDay"
                type="date"
                className="appearance-none rounded-lg placeholder:text-lovely/60 relative block w-full px-3 py-2 border border-pinkey text-lovely bg-creamey/90 focus:outline-none focus:ring-1 focus:ring-lovely focus:border-lovely text-sm"
                value={weddingDay}
                onChange={(e) => setWeddingDay(e.target.value)}
                disabled={loading}
              />
              <p className="text-[11px] text-lovely/70 mt-1">
                {t("weddingDayHelp")}
              </p>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-lovely/90 mb-1"
              >
                {t("password")} *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg placeholder:text-lovely/60 relative block w-full px-3 py-2 border border-pinkey bg-creamey text-lovely focus:outline-none focus:ring-1 focus:ring-lovely focus:border-lovely text-sm"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-lovely flex gap-2 w-full justify-center items-center text-sm text-center bg-pinkey/30 py-2 px-3 rounded-lg">
                <BadgeAlert className="text-xs w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border-2 border-creamey text-sm rounded-lg text-creamey bg-lovely font-semibold hover:bg-everGreen/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors"
              >
                {loading ? t("creatingAccount") : t("createAccount")}
              </button>
            </div>
          </form>

          <div className="relative flex my-4">
            <div className="w-full inset-0 flex items-center">
              <div className="w-full border-t border-pinkey"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-lovely whitespace-nowrap bg-creamey">
                {t("or")}
              </span>
            </div>
            <div className="w-full inset-0 flex items-center">
              <div className="w-full border-t border-pinkey"></div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-2.5 px-4 border-2 border-creamey text-sm rounded-lg text-creamey bg-lovely font-semibold hover:bg-everGreen/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors"
            >
              <span>{loading ? t("creatingWithGoogle") : t("createWithGoogle")}</span>
              <FaGoogle className="ms-2" />
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-lovely">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="font-medium underline text-lovely/90 hover:text-lovely ms-1"
              >
                {t("signIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlaylistPageWrapper() {
  return (
    <Suspense fallback={<div>Loading</div>}>
      <RegisterPage />
    </Suspense>
  );
}
