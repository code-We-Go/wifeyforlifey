"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { thirdFont } from "@/fonts";

const GehazBestieOverlay = () => {
  return (
    <div className="fixed bottom-0 right-0 z-[9999] flex items-end pointer-events-none py-4 md:p-6">
      <div className="flex flex-col items-end mb-6 md:mb-10">
        <div className="pointer-events-auto relative bg-[#E31E24] text-creamey p-2 md:p-4 rounded-2xl rounded-br-none shadow-2xl max-w-[180px] md:max-w-[220px] transition-all duration-300 hover:scale-105 group animate-in fade-in slide-in-from-bottom-4">
          <p className={`${thirdFont.className} text-sm md:text-base font-bold tracking-wide leading-loose `}>
            Lost while buying your Gehaz ??
          </p>
          <Link 
            href="/package/GehazBestiePlanner" 
            className="mt-1 flex items-center gap-2 text-xs md:text-sm font-bold  text-creamey underline px-3 py-1 rounded-full  transition-colors w-fit"
          >
            click here 
            {/* <span className="text-lg decoration-none">➔</span> */}
          </Link>
          
          {/* Triangle for speech bubble */}
          <div className="absolute -bottom-3  right-0 w-0 h-0 border-l-[15px] border-l-transparent border-t-[15px] border-t-[#E31E24]"></div>
        </div>
      </div>
      
      <div className="w-28 md:w-40 pointer-events-auto transform translate-y-4">
        <Image
          src="/characters/Nareiman1.png"
          alt="Bride Character"
          width={160}
          height={240}
          className="object-contain drop-shadow-2xl"
          priority
        />
      </div>
      
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-in {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GehazBestieOverlay;
