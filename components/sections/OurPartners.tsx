"use client";

import { thirdFont } from "@/fonts";
import { Partner } from "@/app/modals/Partner";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { headerStyle } from "@/app/styles/style";

const OurPartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch("/api/partners?fields=imagePath,discount,brand");
        const data = await res.json();
        if (data.partners) {
          setPartners(data.partners);
        }
      } catch (err) {
        console.error("Failed to fetch partners", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  if (loading || partners.length === 0) return null;

  return (
    <div className="flex py-16 flex-col min-h-[50vh] pb-8 h-auto md:mini-h-[65vh] items-center text-start justify-center bg-pinkey">
      <section className="w-[95vw] md:w-[80vw] text-start  bg-transparent text-lovely pt-8 pb-4">
        <h2
          className={`${thirdFont.className} ${headerStyle}   mb-8`}
        >
          Our Partners
        </h2>

        <div className="logos group flex gap-8 relative overflow-hidden whitespace-nowrap py-10 [mask-image:_linear-gradient(to_right,_transparent_0,_white_128px,white_calc(100%-128px),_transparent_100%)]">
          {/* First loop */}
          <div className="animate-slide-left-infinite group-hover:animation-pause w-max flex gap-8">
            {partners.map((partner, index) => (
              <PartnerItem key={`p1-${index}`} partner={partner} />
            ))}
          </div>

          {/* Duplicate loop for infinite scroll */}
          <div className="animate-slide-left-infinite group-hover:animation-pause w-max flex gap-8">
            {partners.map((partner, index) => (
              <PartnerItem key={`p2-${index}`} partner={partner} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const PartnerItem = ({ partner }: { partner: Partner }) => {
  return (
    <div className="flex flex-col items-center justify-start w-52 space-y-4">
        {/* Circle Image Wrapper */}
      <div className="relative overflow-hidden w-52 h-52 rounded-full border-4 border-lovely group/item shrink-0">
        <Image
          fill
          className="inline object-cover"
          src={partner.imagePath || "/placeholder.png"}
          alt={partner.brand}
        />
        {/* Brand Name Overlay on Hover */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
          <span className="text-white text-xl font-bold text-wrap text-center px-2">
            {partner.brand}
          </span>
        </div>
      </div>
      
      {/* Discount Text Below */}
      {partner.discount && (
         <div className="text-lovely font-semibold text-lg text-center whitespace-normal">
            {partner.discount}
         </div>
      )}
    </div>
  );
};

export default OurPartners;