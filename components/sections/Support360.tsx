"use client";

import { thirdFont } from "@/fonts";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { headerStyle, subHeaderStyle } from "@/app/styles/style";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface SupportCard {
  id: number;
  title: string;
  description: string[];
  imagePath: string;
}

const supportCards: SupportCard[] = [
  {
    id: 1,
    title: "Discounts & Partnerships",
    description: [
      "A trusted partner list that grows over time",
      "Community-only discounts on things you actually need",
      "Your membership keeps increasing in value — Wifey-approved = always 💕"
    ],
    imagePath: "/360/50.png"
  },
  {
    id: 2,
    title: "Wifeys favorite products",
    description: [
      "Curated, Wifey-approved products we genuinely recommend",
      "Real reviews — you don't waste time searching",
      "Clear guidance on what's worth buying — and what's not",
      "Includes the maximum fair market price, so you don't overpay"
    ],
    imagePath: "/360/52.png"
  },
  {
    id: 3,
    title: "Inspos",
    description: [
      "Pinterest, But Make It Bridal 💕",
      "Curated bridal inspiration — without the overwhelm",
      "Makeup looks, hairstyles, bridal nails & home moodboards",
      "Saved, organized, and filtered by the Wifey team",
      "Inspiration that feels realistic, beautiful, and achievable",
      "So you can get inspired — not stressed or pressured."
    ],
    imagePath: "/360/51.png"
  },
  {
    id: 4,
    title: "Whatsapp Support circle",
    description: [
      "You're not meant to do this alone.",
      "A private Whatsapp group for Wifey brides only",
      "Ask questions, share worries, and support each other",
      // "Live group chat with trusted experts and each other",
      "Guided by the Wifey for Life team — not just about gehaz, but life, emotions, and everything in between"
    ],
    imagePath: "/360/48.png"
  },
  {
    id: 5,
    title: "Bridal-Era Video Guides",
    description: [
      "Designed to support your Gehaz Bestie Planner when it's time to choose",
      "Helps you understand options and avoid confusion or pressure",
      "Protects you from fake reviews and biased sales advice",
      "Includes trusted expert videos in selected playlists ",
      "(OB-GYN, sex therapists, interior designers, appliance experts & more)",
      // "Organized support in 1 place"
    ],
    imagePath: "/360/49.png"
  },
  {
    id: 6,
    title: "Expert-Led Webinars",
    description: [
      "Live group webinars hosted with trusted experts",
      "ask questions, learn, and feel reassured",
      "Guided by the Wifey for Life team",
      "Examples of webinars hosted!",
      "Appliances 101 with Zeinab Ahmed",
      "Feminine Care 101 with Dr. Dalia Ghozlan",
      "Sex Education 101 with Quareb Therapy"
    ],
    imagePath: "/360/53.png"
  },
  {
    id: 7,
    title: "Discounts on 1:1 Consultations",
    description: [
      "Personal Support — At a Better Price 💕",
      "10%-20% off 1:1 consultations",
      "Interior designers",
      "Women's health educators",
      "Sex therapists",
      "Appliance experts",
      "Wedding & bridal consultants"
    ],
    imagePath: "/360/47.png"
  }
];

const Support360 = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>();
  
  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
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
        <div className="text-left mb-1 md:mb-2 max-w-5xl">
          <h2
            className={`${thirdFont.className} ${headerStyle} mb-2 md:mb-4`}
          >
            The First ever bridal experience to provide 360 support!
          </h2>
          <p className={`${subHeaderStyle} text-lovely/90`}>
            Because you're never meant to go through your bridal era alone! Everything inside the Full Wifey Experience is designed to save you time, protect your money, and support you emotionally.
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
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-lovely text-white p-2 md:p-3 rounded-full shadow-lg transition-all ${
                  !canScrollPrev ? 'opacity-30 cursor-not-allowed' : 'hover:bg-lovely/90 cursor-pointer'
                }`}
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-lovely text-white p-2 md:p-3 rounded-full shadow-lg transition-all ${
                  !canScrollNext ? 'opacity-30 cursor-not-allowed' : 'hover:bg-lovely/90 cursor-pointer'
                }`}
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
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
                      <ul className="list-disc list-outside pl-4  text-creamey marker:text-creamey">
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
            Buy Gehaz Bestie Planner Now
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
