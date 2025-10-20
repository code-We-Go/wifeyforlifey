"use client";

import React from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { thirdFont } from "@/fonts";

interface IFavorite {
  _id: string;
  title: string;
  image: string;
  link: string;
  clickCount: number;
  category: string;
  subCategory: string;
  brand: string;
  price?: number;
  maxPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FavoriteCardProps {
  favorite: IFavorite;
}

export default function FavoriteCard({ favorite }: FavoriteCardProps) {
  // Function to handle external link click and increment click count
  const handleVisitWebsite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorite.link) {
      // Increment click count
      try {
        await fetch(`/api/favorites/${favorite._id}/click`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Error incrementing click count:", error);
      }

      // Open link in new tab
      window.open(favorite.link, "_blank");
    }
  };

  // Format price display based on maxPrice
  const formatPrice = () => {
    if (favorite.maxPrice && favorite.maxPrice > 0) {
      return `${favorite.price} - ${favorite.maxPrice} EGP`;
    }
    return `${favorite.price} EGP`;
  };

  return (
    <div className="relative product-card bg-lovely p-2 pt-4 border-lovely border-2 group cursor-pointer">
      <Image
        width={80}
        height={50}
        className="absolute -top-5 -rotate-45 -left-5 z-20"
        alt="fyonka"
        src={"/fyonkaCreamey.png"}
        unoptimized
      />
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={favorite.image}
          alt={favorite.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div className="md:p-4">
        <h4
          className={`${thirdFont.className} tracking-normal font-semibold text-creamey line-clamp-1`}
        >
          {favorite.brand}
        </h4>
        <div className="flex flex-col mt-2">
          <div className="space-y-0">
            <p className="text-xs text-creamey">
              {favorite.category} - {favorite.subCategory}
            </p>
            <div className="w-full flex justify-between">
              <p className="text-creamey">{favorite.title}</p>
              <p className="text-sm font-medium text-creamey">
                {formatPrice()}
              </p>
            </div>
            {/* <p className="text-xs font-medium text-creamey bg-creamey/20 px-2 py-1 rounded-md inline-block mt-1">
              Clicks: {favorite.clickCount}
            </p> */}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            {favorite.link && (
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
