"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PackageCard as PackageCardType } from "@/app/interfaces/interfaces";
import { thirdFont } from "@/fonts";

export default function PackageCard({
  card,
  packageId,
}: {
  card: PackageCardType;
  packageId: string;
}) {
  const router = useRouter();

  // const handleCardClick = (e: React.MouseEvent) => {
  //   // Only navigate if the click wasn't on a button
  //   if (!(e.target as HTMLElement).closest("button")) {
  //     router.push(`/packages/${packageId}`);
  //   }
  // };

  return (
    <div
      className="relative product-card bg-lovely p-2 pt-4 border-lovely border-2 group cursor-pointer"
      // onClick={handleCardClick}
    >
      <Image
        width={80}
        height={50}
        className="absolute -top-5 -rotate-45 -left-5 z-20"
        alt="fyonka"
        src={"/fyonkaCreamey.png"}
        unoptimized
      />
      <div className="relative aspect-[12/18] overflow-hidden">
        <Image
          src={card.image}
          alt="Package Card"
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 transition-colors duration-300 bg-black/0 group-hover:bg-black/10"></div>
      </div>
      <div className="p-4">
        <ul className="space-y-2">
          {card.points.map((point, index) => (
            <li key={index} className="text-creamey text-sm flex items-start">
              <span className="mr-2">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          {/* <Button
            size="sm"
            variant="secondary"
            className="w-full h-8 hover:bg-creamey/90 text-lovely bg-creamey rounded-full"
            onClick={() => router.push(`/packages/${packageId}`)}
          >
            <span className="text-xs">View Details</span>
          </Button> */}
        </div>
      </div>
    </div>
  );
}
