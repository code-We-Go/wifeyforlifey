"use client";

import { thirdFont } from "@/fonts";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";

const BridalJourney = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
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
    "planners",
    "expert sessions",
    "smart tools",
    "and bridal essentials !",
  ];

  // Auto-cycle through items
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 1500); // Change every 2.5 seconds

    return () => clearInterval(interval);
  }, [isVisible, items.length]);

  return (
    <section
      ref={sectionRef}
      className="bg-pinkey text-lovely py-10 md:py-20 overflow-hidden relative"
    >
      {/* Background Illustrations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left - Bride Planner */}
        {/* <div className="absolute top-4 left-4 md:top-8 md:left-8 w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40  animate-float">
          <Image
            src="/hero/Bride 2_The Efficeint Planner.png"
            alt=""
            fill
            className="object-contain"
          />
        </div> */}

        {/* Top Right - Small Illustration */}
        <div className="absolute top-12 right-8 md:top-16 md:right-16 lg:right-20 w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 rotate-12 animate-bounce-slow">
          <Image
            src="/illustrations/Wifey For Lifey Illustrations-04.png"
            alt=""
            fill
            className="object-contain rotate-12"
          />
        </div>

        {/* Middle Left - Illustration */}
        <div className="absolute md:block  top-24 md:top-20 left-10 md:left-20 lg:left-36 w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 opacity-90 rotate-45 animate-bounce-slow">
          <Image
            src="/illustrations/Wifey For Lifey Illustrations-07.png"
            alt=""
            fill
            className="object-contain -rotate-12"
          />
        </div>

        {/* Middle Right - Illustration */}
        {/* <div className="absolute top-1/2 right-4 md:right-8 w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 opacity-35 -rotate-12 animate-float">
          <Image
            src="/hero/WifeyForLifey Illustrations-28.png"
            alt=""
            fill
            className="object-contain"
          />
        </div> */}

        {/* Bottom Left - Illustration */}
        <div className="absolute max-md:hidden bottom-8 left-8 md:bottom-12 md:left-16 w-10 h-10 md:w-20 md:h-20 lg:w-28 lg:h-28 -rotate-6 animate-bounce-slow">
          <Image
            src="/illustrations/Wifey For Lifey Illustrations-11.png"
            alt=""
            fill
            className="object-contain "
          />
        </div>

        {/* Bottom Right - Brides Together */}
        {/* <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 opacity-25 animate-float">
          <Image
            src="/hero/Brides Together.png"
            alt=""
            fill
            className="object-contain"
          />
        </div> */}
      </div>

      <div className="container-custom max-w-5xl mx-auto text-center space-y-8 md:space-y-12 relative z-10">
        {/* Animated Text Items - Cycling with Fade */}
        <div className="relative h-24 md:h-32 lg:h-40 flex items-center justify-center">
          {items.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out animate-in ${
                currentIndex === index
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
            >
              <h2
                className={`${thirdFont.className} text-3xl tracking-normal md:text-4xl lg:text-5xl font-bold `}
              >
                {item}
              </h2>
            </div>
          ))}
        </div>

        {/* Subtitle */}
        <div
          className={`transform transition-all duration-700 ease-out delay-300 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-lg md:text-xl lg:text-2xl font-semibold max-w-3xl mx-auto leading-relaxed">
            everything you need to plan calmly and make right choices
          </p>
        </div>

        {/* CTA Button */}
        <div
          className={`transform transition-all duration-700 ease-out delay-500 ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-8 scale-95"
          }`}
        >
          <Button
            onClick={() => {
              document.getElementById("join-now")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
            size="lg"
            className="rounded-full font-normal tracking-wide text-base md:text-lg px-8 md:px-12 py-6 md:py-8 bg-lovely hover:bg-lovely/90 text-creamey shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            begin your bridal journey 💗
          </Button>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default BridalJourney;
