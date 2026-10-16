"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { thirdFont } from "@/fonts";

export default function AppliancesWebinarGlobalPopup() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<"ar" | "en">("ar");

  useEffect(() => {
    try {
      // Ensure it appears only once across the website
      const alreadyShown = localStorage.getItem("wb_appliances_webinar_seen");
      if (!alreadyShown) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          localStorage.setItem("wb_appliances_webinar_seen", "true");
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Fallback
      const sessionShown = sessionStorage.getItem("wb_appliances_webinar_seen");
      if (!sessionShown) {
        setIsOpen(true);
        sessionStorage.setItem("wb_appliances_webinar_seen", "true");
      }
    }
  }, []);

  const close = () => {
    setIsOpen(false);
    try {
      localStorage.setItem("wb_appliances_webinar_seen", "true");
    } catch { }
  };

  const handleDirectTo1on1 = () => {
    close();
    router.push("/shop?tab=sessions#partner-sessions");
  };

  const handleDirectToWebinar = () => {
    close();
    router.push("/shop?tab=sessions#partner-sessions");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300"
      onClick={close}
    >
      <div
        className="relative bg-[#fbf3e0] text-[#592a2f] border-2 border-[#efc9cf] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-7"
        onClick={(e) => e.stopPropagation()}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-4 left-4 z-20 text-[#592a2f]/60 hover:text-[#d32333] transition-colors p-2 rounded-full bg-white/70 hover:bg-white shadow-sm"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Language Switcher */}
        <div className="flex justify-end mb-3">
          <div className="inline-flex bg-white/80 border border-[#efc9cf] rounded-full p-1 text-xs font-semibold shadow-sm">
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`px-3 py-1 rounded-full transition-all ${lang === "ar"
                ? "bg-[#d32333] text-white shadow-sm font-bold"
                : "text-[#592a2f] hover:text-[#d32333]"
                }`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full transition-all ${lang === "en"
                ? "bg-[#d32333] text-white shadow-sm font-bold"
                : "text-[#592a2f] hover:text-[#d32333]"
                }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Session Media & Title Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-5">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-[#efc9cf] flex-shrink-0 shadow-md">
            <Image
              src="/experts/zeinab.png"
              alt="Appliances Master Class"
              fill
              className="object-cover"
            />
          </div>

          <div className="text-center sm:text-start flex-1">
            <div className="inline-block px-3 py-1 rounded-full bg-[#fce2e8] text-[#d32333] text-xs font-bold mb-2">
              {lang === "ar" ? "الجمعة ٢٣ أكتوبر ٢٠٢٦" : "Friday, Oct 23, 2026"}
            </div>

            {lang === "ar" ? (
              <>
                <h2 className={`${thirdFont.className} text-xl sm:text-2xl font-bold text-[#d32333] mb-1 leading-snug`}>
                  ورشة أجهزة بيتك
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-[#8b3a49]">
                  دليلك لاختيار أجهزة بيتك مع م. زينب أحمد استعداداً للبلاك فرايداي
                </p>
              </>
            ) : (
              <>
                <h2 className={`${thirdFont.className} text-xl sm:text-2xl font-bold text-[#d32333] mb-1 leading-snug`}>
                  Appliances Master Class
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-[#8b3a49]">
                  Your guide to choosing home appliances with Eng. Zeinab Ahmed
                </p>
              </>
            )}
          </div>
        </div>

        {/* Content Body */}
        {lang === "ar" ? (
          <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-[#592a2f]">
            <div className="bg-white/85 border border-[#efc9cf] rounded-2xl p-4 shadow-sm">
              <p className="font-bold text-[#d32333] mb-1">
                عن الورشة الجماعية (Webinar):
              </p>
              <p>
                ورشة عمل أونلاين عبر Google Meet تركز على الشرح التفصيلي والمقارنة بين مختلف الأجهزة المنزلية، وترشيحات لأفضل البراندات في ميزانيات وفئات متعددة، مع تخصيص آخر 15 دقيقة للأسئلة المباشرة.
              </p>
            </div>

            {/* Direct to /shop partners sessions callout */}
            {/* <div className="bg-[#fff5f6] border-2 border-dashed border-[#d32333] rounded-2xl p-4 sm:p-5">
              <div className="font-bold text-[#d32333] mb-1.5 text-sm sm:text-base">
                بتدوري عن استشارة فردية خاصة 1:1؟
              </div>
              <p className="text-xs sm:text-sm text-[#592a2f] mb-3">
                نظراً لأن الورشة جماعية، فالوقت لا يسمح بعمل ترشيحات مخصصة لمقاسات شقتك وميزانيتك بدقة. إذا كنتِ ترغبين في جلسة خاصة 1:1 لمراجعة جهاز بيتك خطوة بخطوة مع م. زينب أحمد، يمكنكِ حجزها مباشرة من قسم جلسات الشركاء!
              </p>
              <Button
                type="button"
                onClick={handleDirectTo1on1}
                className="w-full bg-[#d32333] hover:bg-[#b01b29] text-white font-bold py-2.5 sm:py-3 rounded-xl shadow-md transition-all text-xs sm:text-sm"
              >
                احجزي جلسة فردية 1:1 من قسم الشركاء (/shop)
              </Button>
            </div> */}
          </div>
        ) : (
          <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-[#592a2f]">
            <div className="bg-white/85 border border-[#efc9cf] rounded-2xl p-4 shadow-sm">
              <p className="font-bold text-[#d32333] mb-1">
                About this Group Webinar:
              </p>
              <p>
                An online group session hosted on Google Meet focused on comprehensive comparisons of home appliances, brand recommendations across budgets, and a general 15-minute Q&amp;A at the end.
              </p>
            </div>

            {/* Direct to /shop partners sessions callout */}
            {/* <div className="bg-[#fff5f6] border-2 border-dashed border-[#d32333] rounded-2xl p-4 sm:p-5">
              <div className="font-bold text-[#d32333] mb-1.5 text-sm sm:text-base">
                Looking for a Private 1:1 Consultation?
              </div>
              <p className="text-xs sm:text-sm text-[#592a2f] mb-3">
                Since this is a group webinar, personalized choices tailored to your home dimensions and exact budget cannot be accommodated. If you want a tailored 1-on-1 session with Eng. Zeinab Ahmed, book an individual session in our Partner Sessions section!
              </p>
              <Button
                type="button"
                onClick={handleDirectTo1on1}
                className="w-full bg-[#d32333] hover:bg-[#b01b29] text-white font-bold py-2.5 sm:py-3 rounded-xl shadow-md transition-all text-xs sm:text-sm"
              >
                Book 1:1 Partner Session in /shop
              </Button>
            </div> */}
          </div>
        )}

        {/* Action Footer */}
        <div className="mt-5 pt-3.5 border-t border-[#efc9cf] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <button
            type="button"
            onClick={close}
            className="text-xs text-[#592a2f]/70 hover:text-[#592a2f] underline order-2 sm:order-1 py-1"
          >
            {lang === "ar" ? "إغلاق التنبيه" : "Dismiss"}
          </button>

          <Button
            type="button"
            onClick={handleDirectToWebinar}
            variant="outline"
            className="w-full sm:w-auto border-2 border-[#d32333] text-[#d32333] hover:bg-[#d32333] hover:text-white font-bold px-5 py-2 rounded-xl transition-all order-1 sm:order-2 text-xs sm:text-sm"
          >
            {lang === "ar"
              ? "تصفح وحجز الورشة الجماعية (Webinar)"
              : "Book Group Webinar Seat"}
          </Button>
        </div>
      </div>
    </div>
  );
}
