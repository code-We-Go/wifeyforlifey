"use client";

import { lifeyFont, thirdFont } from "@/fonts";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui/button";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useTranslations, useLocale } from "next-intl";
import { headerStyle } from "@/app/styles/style";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const JoinNow = () => {
  const t = useTranslations("home.joinNow");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>();

  useEffect(() => {
    setMounted(true);
  }, []);

  // All images for the carousel (use Arabic assets when locale is ar)
  const carouselImages = isRtl
    ? [
        "/JoinNowNew/ar/0.jpeg",
        "/JoinNowNew/ar/1.jpeg",
        "/JoinNowNew/ar/2.jpeg",
        "/JoinNowNew/ar/3.jpeg",
        "/JoinNowNew/ar/4.jpeg",
        "/JoinNowNew/ar/5.jpeg",
        "/JoinNowNew/ar/6.jpeg",
        "/JoinNowNew/ar/7.jpeg",
      ]
    : [
        "/experience/gehaz1.png",
        "/JoinNowNew/1.png",
        "/JoinNowNew/2.png",
        "/JoinNowNew/3.png",
        "/JoinNowNew/4.png",
        "/JoinNowNew/5.png",
        "/JoinNowNew/6.png",
        // "/JoinNowNew/7.png",
      ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      dragFree: true,
      direction: isRtl ? "rtl" : "ltr",
    },
  );

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) =>
      prev !== null ? (prev - 1 + carouselImages.length) % carouselImages.length : null
    );
  }, [carouselImages.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % carouselImages.length : null
    );
  }, [carouselImages.length]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
      } else if (e.key === "ArrowLeft") {
        if (isRtl) {
          handleNext();
        } else {
          handlePrev();
        }
      } else if (e.key === "ArrowRight") {
        if (isRtl) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    };

    if (selectedIndex !== null) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedIndex, isRtl, handlePrev, handleNext]);

  // Swipe gesture handling for mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = (touchStartY.current || 0) - (touchEndY.current || 0);

    // Only trigger if primarily a horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swiped Left
        if (isRtl) {
          handlePrev();
        } else {
          handleNext();
        }
      } else {
        // Swiped Right
        if (isRtl) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  return (
    <section
      ref={sectionRef}
      className={`bg-creamey text-lovely py-8 md:py-16 overflow-hidden transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container-custom "
      id="join-now">
        {/* Header Text */}
        <div className="mb-1 md:mb-2">
          <h1
            className={`${thirdFont.className } ${headerStyle}  mb-4`}
          >
            {t("title")}
            <br />
            {t("subtitle")}
          </h1>
          
          <p className="text-lg md:text-xl font-bold text-lovely">
            {t("badge")}
          </p>

          {/* Feature Points */}
          <ul className="list-disc list-outside text-start ps-8 md:ps-10 space-y-1 md:space-y-2 mb-4">
            <li className="text-sm md:text-base font-normal text-lovely">
              {t("point1")}
            </li>
            <li className="text-sm md:text-base font-normal text-lovely">
              {t("point2")}
            </li>
            <li className="text-sm md:text-base font-normal text-lovely">
              {t("point3")}
            </li>
            <li className="text-sm md:text-base font-normal text-lovely">
              {t("point4")}
            </li>
          </ul>
        </div>

        {/* Embla Carousel */}
        <div className="overflow-hidden mb-8 -mx-2" ref={emblaRef}>
          <div className="flex">
            {carouselImages.map((src, index) => (
              <div
                key={index}
                className="flex-none w-[66.67vw] h-[66.67vw] sm:w-[45vw] sm:h-[45vw] md:w-[33vw] md:h-[33vw] lg:w-[25vw] lg:h-[25vw] px-2"
              >
                <div 
                  className="w-full h-full overflow-hidden shadow-lg bg-pinkey cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedIndex(index)}
                >
                  <Image
                    src={src}
                    alt={`Planner feature ${index + 1}`}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Text and CTA */}
        <div className="text-center space-y-6">
          <p className="text-base md:text-lg font-bold text-lovely">
            {t("bottomNote")}
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-md font-bold tracking-wide text-base md:text-lg px-8 py-6 bg-lovely hover:bg-lovely/90 text-creamey shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Link href="/package/GehazBestiePlanner">
              {t("cta")} <span className="ms-2"><Image src="/illustrations/key.png" alt="arrow-right" className="-rotate-[110deg] animate-pulse" width={50} height={50} /></span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Fullscreen Image Modal with Prev/Next Navigation rendered via Portal to cover entire viewport */}
      {mounted &&
        selectedIndex !== null &&
        createPortal(
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-6 select-none touch-pan-y"
            onClick={() => setSelectedIndex(null)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[10000] text-white/80 hover:text-white transition-all p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md cursor-pointer"
              onClick={() => setSelectedIndex(null)}
              aria-label="Close modal"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            {/* Previous Button */}
            <button
              className="absolute left-2 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-[10000] p-2.5 sm:p-3.5 rounded-full bg-black/40 hover:bg-black/75 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
              onClick={handlePrev}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* Next Button */}
            <button
              className="absolute right-2 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-[10000] p-2.5 sm:p-3.5 rounded-full bg-black/40 hover:bg-black/75 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* Center Image Container */}
            <div 
              className="relative flex flex-col items-center justify-center max-w-[92vw] sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[65vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={carouselImages[selectedIndex]}
                alt={`Feature preview ${selectedIndex + 1}`}
                width={1200}
                height={1200}
                priority
                className="object-contain w-auto h-auto max-w-[92vw] sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[65vw] max-h-[75vh] sm:max-h-[80vh] rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
              />
              {/* Image counter indicator */}
              <div className="mt-3 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-xs sm:text-sm font-medium">
                {selectedIndex + 1} / {carouselImages.length}
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};

export default JoinNow;
