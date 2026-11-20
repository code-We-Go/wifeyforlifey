"use client";

import { thirdFont } from "@/fonts";
import React, { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

const BridalJourneyTwo = () => {
  const t = useTranslations("home.marquee");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const items = [
    // t("tagline"),
    t("planners"),
    t("expertSessions"),
    t("tagline"),
    t("smartTools"),
    t("bridalEssentials"),
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-lovely text-creamey py-2 md:py-3 overflow-hidden relative select-none"
    >
      <div className="relative w-full">
        {/* Scrolling Marquee */}
        <div className="flex items-center overflow-hidden" dir="ltr">
          <div className="animate-scroll flex whitespace-nowrap">
            {[0, 1, 2].map((setIndex) => (
              <div
                key={setIndex}
                className="flex items-center gap-6 sm:gap-8 px-3 sm:px-4 shrink-0"
              >
                {items.map((item, index) => (
                  <React.Fragment key={`${setIndex}-${index}`}>
                    <h2
                      className={`${thirdFont.className} ${isArabic
                        ? "text-lg md:text-xl lg:text-2xl tracking-normal"
                        : "text-lg md:text-xl lg:text-2xl tracking-wider"
                        } font-bold text-creamey inline-block`}
                      dir={isArabic ? "rtl" : "ltr"}
                    >
                      {item}
                    </h2>
                    <span
                      className={`${isArabic ? "text-lg md:text-2xl" : "text-2xl md:text-3xl"
                        } text-creamey/80 select-none`}
                    >
                      •
                    </span>
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333333%);
          }
        }

        .animate-scroll {
          animation: marquee 12s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default BridalJourneyTwo;
