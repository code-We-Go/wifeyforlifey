"use client";

import { lifeyFont, thirdFont } from "@/fonts";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { headerStyle } from "@/app/styles/style";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const JoinNow = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>();

  // All images for the carousel (including the original gehaz1.png as first)
  const carouselImages = [
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
    },
    // [
    //   Autoplay({
    //     delay: 2000,
    //     stopOnInteraction: false,
    //     stopOnMouseEnter: true,
    //   }),
    // ]
  );

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [selectedImage]);

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
            PSSSST... Buying Your Gehaz & Feeling Lost?
            <br />
            Meet YOUR GEHAZ BESTIE PLANNER!
          </h1>
          
          <p className="text-lg md:text-xl font-bold text-lovely">
            Built by a bride, for brides!
          </p>

          {/* Feature Points */}
          <ul className="list-disc list-outside text-left pl-8 md:pl-10 space-y-1 md:space-y-2 mb-4">
            <li className="text-sm md:text-base font-normal text-lovely">
              The first planner ever to include a chapter about your relationship with your fiancé — plus 10 chapters covering every part of your home.
            </li>
            <li className="text-sm md:text-base font-normal text-lovely">
              The only planner to split gehaz into Essentials vs Nice-to-Haves so you don&apos;t overspend
            </li>
            <li className="text-sm md:text-base font-normal text-lovely">
              Quantity recommendations so you buy just enough
            </li>
            <li className="text-sm md:text-base font-normal text-lovely">
              Emotions Journaling to keep you grounded through the chaos
            </li>
          </ul>
        </div>

        {/* Embla Carousel */}
        <div className="overflow-hidden mb-8 -mx-2" ref={emblaRef}>
          <div className="flex">
            {carouselImages.map((src, index) => (
              <div
                key={index}
                className="flex-none w-[66.67vw] h-[66.67vw] sm:w-[45vw] sm:h-[45vw] md:w-[33vw] md:h-[33vw] lg:w-[25vw] lg:h-[25vw] pl-2 pr-2"
              >
                <div 
                  className="w-full h-full overflow-hidden shadow-lg bg-pinkey cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedImage(src)}
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
This isn’t just a planner — it unlocks a whole support system.          </p>
          <Button
            asChild
            size="lg"
            className="rounded-md font-bold tracking-wide text-base md:text-lg px-8 py-6 bg-lovely hover:bg-lovely/90 text-creamey shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Link href="/packages/687396821b4da119eb1c13fe">See what&apos;s inside <span className="ml-2"><Image src="/illustrations/key.png" alt="arrow-right" className="-rotate-[110deg] animate-pulse" width={50} height={50} /></span></Link>
          </Button>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-lovely transition-colors p-2 rounded-full hover:bg-white/10"
            onClick={() => setSelectedImage(null)}
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div 
            className="relative max-w-[95vw] max-h-[95vh] w-auto h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Fullscreen view"
              width={1200}
              height={1200}
              className="object-contain w-auto h-auto max-w-[95vw] max-h-[95vh]"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default JoinNow;
