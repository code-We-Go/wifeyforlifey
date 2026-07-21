"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DoubleHero() {
  return (
    <div className="w-full flex flex-col md:flex-row min-h-[60vh] md:h-[70vh] 2xl:h-[80vh] relative overflow-hidden bg-creamey">
      {/* Left / Upper Section */}
      <div className="relative flex-1 h-[60vh] md:h-full group overflow-hidden border-b md:border-b-0 md:border-r border-pinkey/30">
        {/* Mobile Image */}
        <Image
          src="/weddingPlanningPlanner/mob.jpeg"
          alt="Wedding Planning Planner Mobile"
          fill
          className="object-cover object-center md:hidden transition-transform duration-700 group-hover:scale-105"
          priority
        />
        {/* Desktop Image */}
        <Image
                  src="/weddingPlanningPlanner/mob.jpeg"

          // src="/weddingPlanningPlanner/desktop.png"
          alt="Wedding Planning Planner Desktop"
          fill
          className="object-cover object-center hidden md:block transition-transform duration-700 group-hover:scale-105"
          priority
        />
        
        {/* Overlay to give text/button some contrast if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Button in the middle down */}
        <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center px-4">
          <Link href="/package/WeddingBestiePlanner" passHref>
            <Button 
              className="bg-creamey text-lovely hover:bg-creamey border border-lovely md:px-8 px-4 md:py-6 py-4 rounded-full font-bold shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-base md:text-lg tracking-wide"
            >
              Wedding Planning Bestie 
            </Button>
          </Link>
        </div>
      </div>

      {/* Right / Below Section */}
      <div className="relative flex-1 h-[50vh] md:h-full group overflow-hidden">
        <Image
          src="/experience/gehaz1.png"
          alt="Gehaz Experience"
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          priority
        />

        {/* Overlay to give text/button some contrast if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Button in the middle down */}
        <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center px-4">
          <Link href="/package/GehazBestiePlanner" passHref>
            <Button 
              className="bg-creamey text-lovely hover:bg-creamey border border-lovely md:px-8 px-4 md:py-6 py-4 rounded-full font-bold shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-base md:text-lg tracking-wide"
            >
              Gehaz Bestie
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
