"use client";

import { thirdFont } from "@/fonts";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useLocale, useTranslations } from "next-intl";
import { headerStyle, subHeaderStyle } from "@/app/styles/style";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface SupportCard {
  id: number;
  title: string;
  description: string[];
  imagePath: string;
}

const Support360 = () => {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const t = useTranslations("home.support360");
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>();

  const supportCards: SupportCard[] = [
    {
      id: 1,
      title: t("card1Title"),
      description: [
        t("card1Point1"),
        t("card1Point2"),
        t("card1Point3"),
      ],
      imagePath: "/360/50.png"
    },
    {
      id: 2,
      title: t("card2Title"),
      description: [
        t("card2Point1"),
        t("card2Point2"),
        t("card2Point3"),
        t("card2Point4"),
      ],
      imagePath: "/360/52.png"
    },
    {
      id: 3,
      title: t("card3Title"),
      description: [
        t("card3Point1"),
        t("card3Point2"),
        t("card3Point3"),
        t("card3Point4"),
        t("card3Point5"),
        t("card3Point6"),
      ],
      imagePath: "/360/51.png"
    },
    {
      id: 4,
      title: t("card4Title"),
      description: [
        t("card4Point1"),
        t("card4Point2"),
        t("card4Point3"),
        t("card4Point4"),
      ],
      imagePath: "/360/48.png"
    },
    {
      id: 5,
      title: t("card5Title"),
      description: [
        t("card5Point1"),
        t("card5Point2"),
        t("card5Point3"),
        t("card5Point4"),
      ],
      imagePath: "/360/49.png"
    },
    {
      id: 6,
      title: t("card6Title"),
      description: [
        t("card6Point1"),
        t("card6Point2"),
        t("card6Point3"),
      ],
      imagePath: "/360/53.png"
    },
    {
      id: 7,
      title: t("card7Title"),
      description: [
        t("card7Point1"),
        t("card7Point2"),
      ],
      imagePath: "/360/47.png"
    }
  ];
  
  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    direction: isRtl ? "rtl" : "ltr",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section 
      ref={sectionRef}
      className={`bg-pinkey text-lovely pt-8 md:pt-16 pb-16 md:pb-16 transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container-custom">
        {/* Header */}
        <div className="text-start mb-1 md:mb-2 max-w-5xl">
          <h2
            className={`${thirdFont.className} ${headerStyle} mb-2 md:mb-4`}
          >
            {t("title")}
          </h2>
          <p className={`${subHeaderStyle} text-lovely/90`}>
            {t("subtitle")}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          {supportCards.length > 2 && (
            <>
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className={`absolute start-0 top-1/2 -translate-y-1/2 -translate-x-4 rtl:translate-x-4 md:-translate-x-12 rtl:md:translate-x-12 z-10 bg-lovely text-white p-2 md:p-3 rounded-full shadow-lg transition-all ${
                  !canScrollPrev ? 'opacity-30 cursor-not-allowed' : 'hover:bg-lovely/90 cursor-pointer'
                }`}
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 rtl:rotate-180" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className={`absolute end-0 top-1/2 -translate-y-1/2 translate-x-4 rtl:-translate-x-4 md:translate-x-12 rtl:md:-translate-x-12 z-10 bg-lovely text-white p-2 md:p-3 rounded-full shadow-lg transition-all ${
                  !canScrollNext ? 'opacity-30 cursor-not-allowed' : 'hover:bg-lovely/90 cursor-pointer'
                }`}
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 rtl:rotate-180" />
              </button>
            </>
          )}

          {/* Embla Carousel */}
          <div className="overflow-x-clip overflow-y-visible" ref={emblaRef}>
            <div className="flex gap-2 md:gap-4">
              {supportCards.map((card) => (
                <div key={card.id} className="relative flex-[0_0_80%] sm:flex-[0_0_50%] md:flex-[0_0_40%] lg:flex-[0_0_30%]  2xl:flex-[0_0_22%] min-w-0 pb-6 md:pb-12">
                  <div className="bg-lovely rounded-sm  shadow-xl h-[350px] md:h-[450px] lg:h-[500px] xl:h-[500px] ">
                    {/* Card Header */}
                    <div className="p-2 md:p-4 pb-32 md:pb-40 h-full ">
                      <h3 className="text-base lg:text-lg font-bold text-creamey mb-2 md:mb-3">
                        {card.title}
                      </h3>
                      <ul className="list-disc list-outside ps-4  text-creamey marker:text-creamey">
                        {card.description.map((point, index) => (
                          <li key={index} className="text-xs md:text-sm text-creamey/95 leading-normal">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Mobile Screen Mockup - Absolutely positioned at bottom */}
                    <div className="absolute -bottom-14  xs:-bottom-32 sm:-bottom-20 md:-bottom-20 lg:-bottom-16 xl:-bottom-4 2xl:-bottom-14  left-1/2 z-20 -translate-x-1/2 w-[420px] xs:w-[550px] md:w-[520px] lg:w-[580px] xl:w-[600px] 2xl:w-[620px] h-[450px] xs:h-[550px] md:h-[550px] lg:h-[640px] xl:h-[800px] 2xl:h-[840px]">
                      <Image
                        src={card.imagePath}
                        alt={card.title}
                        fill
                        className="object-contain object-bottom"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-48 sm:mt-36 md:mt-32 lg:mt-20 ">
          <Link 
            href="/package/GehazBestiePlanner"
            className="bg-lovely relative text-creamey px-8 py-4 rounded-sm font-semibold text-base md:text-lg hover:bg-lovely/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {t("cta")}
                <Image
                  width={60}
                  height={30}
                  className="absolute -top-5 -rotate-45 -left-5 z-20"
                  alt="fyonka"
                  src={"/fyonkaCreamey.png"}
                  unoptimized
                />
          </Link>
        </div>
    
      </div>
    </section>
  );
};

export default Support360;
