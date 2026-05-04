"use client";

import { thirdFont } from "@/fonts";
import React, { useEffect, useRef, useState } from "react";

const BridalJourneyTwo = () => {
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
    "planners",
    "expert sessions",
    "smart tools",
    "bridal essentials",
    "everything you need to plan calmly and make right choices",
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-lovely text-creamey py-3 md:py-6 overflow-hidden relative"
    >
      <div className="relative w-full">
        {/* Scrolling Marquee */}
        <div className="flex items-center">
          <div className="animate-scroll flex whitespace-nowrap">
            {/* First set */}
            <div className="flex items-center gap-8 px-4">
              {items.map((item, index) => (
                <React.Fragment key={`first-${index}`}>
                  <h2
                    className={`${thirdFont.className} text-2xl md:text-3xl lg:text-4xl tracking-wide font-bold`}
                  >
                    {item}
                  </h2>
                  {index < items.length - 1 && (
                    <span className="text-2xl md:text-3xl">•</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Duplicate set for seamless loop */}
            <div className="flex items-center gap-8 px-4">
              {items.map((item, index) => (
                <React.Fragment key={`second-${index}`}>
                  <span className="text-2xl md:text-3xl">•</span>
                  <h2
                    className={`${thirdFont.className} text-2xl md:text-3xl lg:text-4xl tracking-wide font-bold`}
                  >
                    {item}
                  </h2>
                </React.Fragment>
              ))}
            </div>

            {/* Third set for seamless loop */}
            <div className="flex items-center gap-8 px-4">
              {items.map((item, index) => (
                <React.Fragment key={`third-${index}`}>
                  <span className="text-2xl md:text-3xl">•</span>
                  <h2
                    className={`${thirdFont.className} text-2xl md:text-3xl lg:text-4xl font-bold tracking-widest`}
                  >
                    {item}
                  </h2>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default BridalJourneyTwo;
