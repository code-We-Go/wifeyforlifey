"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ipackage } from "@/app/interfaces/interfaces";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { thirdFont } from "@/fonts";
import { useToast } from "@/hooks/use-toast";

export default function PackageCard({
  packageItem,
}: {
  packageItem: Ipackage;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const handlePackageClick = (e: React.MouseEvent) => {
    // Only navigate if the click wasn't on a button
    if (!(e.target as HTMLElement).closest("button")) {
      router.push(`/packages/${packageItem._id}`);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    router.push(`/packages/${packageItem._id}`);
  };

  return (
    <div
      className="relative product-card bg-lovely p-2 pt-4 border-lovely border-2 group cursor-pointer"
      onClick={handlePackageClick}
    >
      <Image
        width={80}
        height={50}
        className="absolute -top-5 -rotate-45 -left-5 z-20"
        alt="fyonka"
        src={"/fyonkaCreamey.png"}
      />
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={packageItem.imgUrl}
          alt={packageItem.name}
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
          {packageItem.name}
        </h4>
        <div className="flex items-center justify-between mt-2">
          <div className="space-y-0">
            <p className="text-xs text-creamey">{packageItem.duration}</p>
            <p className="price-tag text-creamey">
              LE{packageItem.price.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 hover:bg-creamey/90 text-lovely bg-creamey rounded-full"
              onClick={handleViewDetails}
            >
              <Package className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="text-xs">View</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}