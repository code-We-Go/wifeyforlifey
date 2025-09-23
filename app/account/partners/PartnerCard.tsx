"use client";

import React from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { thirdFont } from "@/fonts";

interface Partner {
  category: string;
  subCategory: string;
  brand: string;
  offer: string;
  discount: string;
  code: string;
  link: string;
  bookingMethod: string;
  imagePath?: string;
}

interface PartnerCardProps {
  partner: Partner;
}

export default function PartnerCard({ partner }: PartnerCardProps) {
  // Function to handle external link click
  const handleVisitWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (partner.link) {
      window.open(partner.link, "_blank");
    }
  };

  // Default image path if none is provided
  const getImagePath = (): string => {
    return partner.imagePath || "vogacloset.jpeg"; // Default logo if no image path is provided
  };

  return (
    <div className="relative product-card bg-lovely p-2 pt-4 border-lovely border-2 group cursor-pointer">
      <Image
        width={80}
        height={50}
        className="absolute -top-5 -rotate-45 -left-5 z-20"
        alt="fyonka"
        src={"/fyonkaCreamey.png"}
      />
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={`${getImagePath()}`}
          alt={partner.brand}
          fill
          className={`object-cover transition-transform duration-300 group-hover:scale-105`}
        />
        <div
          className={`absolute inset-0 transition-colors duration-300 bg-black/0 group-hover:bg-black/10`}
        ></div>
      </div>
      <div className="md:p-4">
        <h4
          className={`${thirdFont.className} tracking-normal font-semibold text-creamey line-clamp-1`}
        >
          {partner.brand}
        </h4>
        <div className="flex flex-col mt-2">
          <div className="space-y-0">
            <p className="text-xs text-creamey">
              {partner.category} - {partner.subCategory}
            </p>
            <p>{partner.offer}</p>
            {partner.discount && (
              <p className="text-sm font-medium text-creamey">
                {partner.discount}
              </p>
            )}
            {partner.code && (
              <p className="text-xs font-medium text-creamey bg-creamey/20 px-2 py-1 rounded-md inline-block mt-1">
                Code: {partner.code}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            {partner.link && (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 hover:bg-creamey/90 text-lovely bg-creamey rounded-full"
                onClick={handleVisitWebsite}
              >
                <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                <span className="text-xs">Visit</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
