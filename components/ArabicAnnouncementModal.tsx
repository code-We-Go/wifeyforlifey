"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { X, Globe, Check, Heart } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export default function ArabicAnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const seen =
        typeof window !== "undefined" &&
        localStorage.getItem("wb_arabic_announcement_seen") === "true";
      if (!seen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback
      setIsOpen(true);
    }
  }, []);

  const close = () => {
    setIsOpen(false);
    try {
      localStorage.setItem("wb_arabic_announcement_seen", "true");
    } catch { }
  };

  const handleSelectLanguage = (newLocale: "ar" | "en") => {
    try {
      localStorage.setItem("wb_arabic_announcement_seen", "true");
    } catch { }

    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    if (newLocale !== locale) {
      startTransition(() => {
        router.replace(pathname, { locale: newLocale });
        router.refresh();
      });
    }
    setIsOpen(false);
  };

  const handleBookNow = () => {
    try {
      localStorage.setItem("wb_arabic_announcement_seen", "true");
    } catch { }

    document.cookie = `NEXT_LOCALE=ar; path=/; max-age=31536000; SameSite=Lax`;

    startTransition(() => {
      router.push("/package/GehazBestiePlanner", { locale: "ar" });
      router.refresh();
    });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={close}
    >
      <div
        className="relative w-full max-w-lg md:max-w-3xl lg:max-w-4xl bg-creamey text-lovely border-2 border-lovely/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] overflow-y-auto"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "var(--font-arabic), sans-serif" }}
      >
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-3.5 left-3.5 z-30 p-2 rounded-full bg-creamey/90 hover:bg-creamey text-lovely hover:text-lovely/80 transition-all shadow-sm border border-lovely/20 cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Image Section (50%) */}
        <div className="relative w-full md:w-1/2 h-56 sm:h-64 md:h-auto min-h-[220px] md:min-h-[440px] bg-creamey shrink-0">
          <Image
            src="/ar/hero/gehazBestie.jpeg"
            alt="وايفي بقت بالعربي - بلانر جهاز بيستي"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:hidden" />
          <div className="absolute bottom-3 right-3 md:hidden bg-creamey/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-lovely shadow-sm border border-lovely/20">
            🎀 وايفي بقت بالعربي
          </div>
        </div>

        {/* Content Section (50%) */}
        <div className="w-full md:w-1/2 p-5 sm:p-7 lg:p-8 flex flex-col justify-between gap-4 bg-creamey">
          <div className="space-y-3">
            {/* Tag Badge */}
            <div className="hidden md:inline-flex items-center gap-1.5 bg-pinkey/30 text-lovely text-xs font-bold px-3.5 py-1 rounded-full border border-pinkey/60">
              <span>🌸</span>
              <span>مفاجأة سارة لعرائس وايفي</span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-lovely leading-snug">
              🎀 وايفي بقت بالعربي!
            </h2>

            {/* Description 1 */}
            <p className="text-xs sm:text-sm text-lovely/90 leading-relaxed font-medium">
              علشان رحلتك في تجهيز بيتك تبقى أسهل وألطف، موقع وايفي وGehaz Bestie Planner بقوا متاحين بالعربي! 💗
            </p>

            {/* Pre-order Callout Box */}
            <div className="p-3 bg-pinkey/25 border border-pinkey/60 rounded-2xl text-xs sm:text-sm font-semibold text-lovely leading-relaxed shadow-2xs">
              والأحلى؟ تقدري دلوقتي تعملي Pre-order للنسخة العربي من البلانر وتكوني من أول الوايفيز اللي تستلمها!
            </div>

            {/* Language Switcher Buttons inside popup */}
            <div className="p-3 bg-creamey rounded-2xl border border-lovely/20 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-lovely">
                <Globe className="w-3.5 h-3.5 text-lovely" />
                <span>اختاري لغة التصفح:</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Arabic Option */}
                <button
                  type="button"
                  onClick={() => handleSelectLanguage("ar")}
                  disabled={isPending}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${locale === "ar"
                      ? "bg-lovely text-creamey border-lovely shadow-sm"
                      : "bg-creamey text-lovely border-lovely/30 hover:bg-pinkey/20"
                    }`}
                >
                  <span>العربية</span>
                  {locale === "ar" && <Check className="w-4 h-4 text-creamey" />}
                </button>

                {/* English Option */}
                <button
                  type="button"
                  onClick={() => handleSelectLanguage("en")}
                  disabled={isPending}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${locale === "en"
                      ? "bg-lovely text-creamey border-lovely shadow-sm"
                      : "bg-creamey text-lovely border-lovely/30 hover:bg-pinkey/20"
                    }`}
                >
                  <span>English</span>
                  {locale === "en" && <Check className="w-4 h-4 text-creamey" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            {/* Primary Pre-order CTA */}
            <button
              type="button"
              onClick={handleBookNow}
              disabled={isPending}
              className="w-full py-3.5 px-4 bg-lovely hover:bg-lovely/90 text-creamey rounded-2xl font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>احجزي نسختك دلوقتي 💌</span>
            </button>

            {/* Secondary Option */}
            <button
              type="button"
              onClick={() => handleSelectLanguage(locale === "ar" ? "ar" : "en")}
              disabled={isPending}
              className="w-full py-2 px-3 text-xs sm:text-sm text-lovely/75 hover:text-lovely font-semibold transition-colors cursor-pointer"
            >
              {locale === "ar"
                ? "تصفحي الموقع بالعربي"
                : "المتابعة بالإنجليزية (Continue in English)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
